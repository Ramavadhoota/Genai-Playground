import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { GenAIService } from '../../services/genai.service';
import { Conversation } from '../../models/interfaces';

@Component({
  selector: 'app-conversation-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatExpansionModule
  ],
  templateUrl: './conversation-history.component.html',
  styleUrls: ['./conversation-history.component.scss']
})
export class ConversationHistoryComponent {
  private genAIService = inject(GenAIService);
  private dialog = inject(MatDialog);

  conversations = signal<Conversation[]>([]);
  searchQuery = '';
  expandedConversation = signal<string | null>(null);

  ngOnInit() {
    this.genAIService.conversations$.subscribe(convos => {
      this.conversations.set(convos);
    });
  }

  get filteredConversations(): Conversation[] {
    const query = this.searchQuery.toLowerCase();
    if (!query) return this.conversations();

    return this.conversations().filter(convo =>
      convo.title.toLowerCase().includes(query) ||
      convo.messages.some(msg => msg.content.toLowerCase().includes(query))
    );
  }

  deleteConversation(id: string, event: Event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this conversation?')) {
      this.genAIService.deleteConversation(id);
    }
  }

  toggleExpand(id: string) {
    this.expandedConversation.set(
      this.expandedConversation() === id ? null : id
    );
  }

  copyMessage(content: string, event: Event) {
    event.stopPropagation();
    navigator.clipboard.writeText(content);
  }

  exportConversation(conversation: Conversation, event: Event) {
    event.stopPropagation();
    const data = JSON.stringify(conversation, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `conversation-${conversation.id}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getConversationSummary(conversation: Conversation): string {
    const firstUserMessage = conversation.messages.find(m => m.role === 'user');
    return firstUserMessage?.content.slice(0, 100) + '...' || 'No messages';
  }

  getTotalTokens(conversation: Conversation): number {
    return conversation.messages.reduce((sum, msg) => sum + (msg.tokens || 0), 0);
  }

  getAveragLatency(conversation: Conversation): number {
    const messagesWithLatency = conversation.messages.filter(m => m.latency);
    if (messagesWithLatency.length === 0) return 0;
    
    const totalLatency = messagesWithLatency.reduce((sum, msg) => sum + (msg.latency || 0), 0);
    return Math.round(totalLatency / messagesWithLatency.length);
  }
}
