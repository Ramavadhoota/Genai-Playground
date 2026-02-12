import { Component, inject, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { GenAIService } from '../../services/genai.service';
import { Conversation, Message } from '../../models/interfaces';

@Component({
  selector: 'app-chat-interface',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './chat-interface.component.html',
  styleUrls: ['./chat-interface.component.scss']
})
export class ChatInterfaceComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  private genAIService = inject(GenAIService);
  private shouldScrollToBottom = false;

  currentConversation = signal<Conversation | null>(null);
  messageInput = '';
  selectedModel = 'gpt-3.5-turbo';
  loading = signal(false);

  availableModels = this.genAIService.availableModels;

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  startNewConversation() {
    const conversation = this.genAIService.createConversation(this.selectedModel);
    this.currentConversation.set(conversation);
  }

  sendMessage() {
    if (!this.messageInput.trim() || !this.currentConversation()) return;

    const conversationId = this.currentConversation()!.id;
    const message = this.messageInput.trim();
    this.messageInput = '';
    this.loading.set(true);
    this.shouldScrollToBottom = true;

    this.genAIService.sendMessage(conversationId, message, this.selectedModel)
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.shouldScrollToBottom = true;
          this.refreshConversation();
        },
        error: (error) => {
          console.error('Error sending message:', error);
          this.loading.set(false);
        }
      });
  }

  private refreshConversation() {
    const conversation = this.genAIService.getConversation(this.currentConversation()!.id);
    if (conversation) {
      this.currentConversation.set({...conversation});
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearConversation() {
    this.currentConversation.set(null);
    this.messageInput = '';
  }

  copyMessage(content: string) {
    navigator.clipboard.writeText(content);
  }
}
