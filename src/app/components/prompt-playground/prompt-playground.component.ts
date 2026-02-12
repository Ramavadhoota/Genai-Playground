import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GenAIService } from '../../services/genai.service';
import { PromptExecution } from '../../models/interfaces';

@Component({
  selector: 'app-prompt-playground',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatSliderModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './prompt-playground.component.html',
  styleUrls: ['./prompt-playground.component.scss']
})
export class PromptPlaygroundComponent {
  private genAIService = inject(GenAIService);

  prompt = '';
  selectedModel = 'gpt-3.5-turbo';
  temperature = 0.7;
  maxTokens = 1000;
  
  loading = signal(false);
  currentExecution = signal<PromptExecution | null>(null);
  executionHistory = signal<PromptExecution[]>([]);

  availableModels = this.genAIService.availableModels;

  ngOnInit() {
    this.genAIService.executions$.subscribe(executions => {
      this.executionHistory.set(executions.slice(0, 10));
    });
  }

  executePrompt() {
    if (!this.prompt.trim()) return;

    this.loading.set(true);
    this.currentExecution.set(null);

    this.genAIService.executePrompt(
      this.prompt,
      this.selectedModel,
      this.temperature,
      this.maxTokens
    ).subscribe({
      next: (execution) => {
        this.currentExecution.set(execution);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error:', error);
        this.loading.set(false);
      }
    });
  }

  clearPrompt() {
    this.prompt = '';
    this.currentExecution.set(null);
  }

  copyResponse() {
    const execution = this.currentExecution();
    if (execution) {
      navigator.clipboard.writeText(execution.response);
    }
  }

  loadFromHistory(execution: PromptExecution) {
    this.prompt = execution.prompt;
    this.selectedModel = execution.model;
    this.temperature = execution.temperature;
    this.maxTokens = execution.maxTokens;
    this.currentExecution.set(execution);
  }

  deleteFromHistory(id: string, event: Event) {
    event.stopPropagation();
    this.genAIService.deleteExecution(id);
  }

  formatTemperature(value: number): string {
    return value.toFixed(2);
  }
}
