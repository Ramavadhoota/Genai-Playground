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
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { GenAIService } from '../../services/genai.service';
import { ComparisonResult, PromptExecution } from '../../models/interfaces';

@Component({
  selector: 'app-response-comparison',
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
    MatTabsModule,
    MatTableModule
  ],
  templateUrl: './response-comparison.component.html',
  styleUrls: ['./response-comparison.component.scss']
})
export class ResponseComparisonComponent {
  private genAIService = inject(GenAIService);

  prompt = '';
  selectedModels: string[] = [];
  temperature = 0.7;
  maxTokens = 1000;
  
  loading = signal(false);
  currentComparison = signal<ComparisonResult | null>(null);
  comparisonHistory = signal<ComparisonResult[]>([]);

  availableModels = this.genAIService.availableModels;
  displayedColumns: string[] = ['metric', ...this.availableModels.map(m => m.name)];

  ngOnInit() {
    this.genAIService.comparisons$.subscribe(comparisons => {
      this.comparisonHistory.set(comparisons.slice(0, 10));
    });
  }

  compareResponses() {
    if (!this.prompt.trim() || this.selectedModels.length < 2) return;

    this.loading.set(true);
    this.currentComparison.set(null);

    this.genAIService.comparePromptAcrossModels(
      this.prompt,
      this.selectedModels,
      this.temperature,
      this.maxTokens
    ).subscribe({
      next: (comparison) => {
        this.currentComparison.set(comparison);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error comparing responses:', error);
        this.loading.set(false);
      }
    });
  }

  clearComparison() {
    this.prompt = '';
    this.selectedModels = [];
    this.currentComparison.set(null);
  }

  loadFromHistory(comparison: ComparisonResult) {
    this.prompt = comparison.prompt;
    this.selectedModels = comparison.executions.map(e => e.model);
    this.currentComparison.set(comparison);
  }

  deleteFromHistory(id: string, event: Event) {
    event.stopPropagation();
    this.genAIService.deleteComparison(id);
  }

  getMetricsComparison(): any[] {
    const comparison = this.currentComparison();
    if (!comparison) return [];

    const metrics = [
      { name: 'Latency (ms)', key: 'latency' },
      { name: 'Total Tokens', key: 'tokens.total' },
      { name: 'Prompt Tokens', key: 'tokens.prompt' },
      { name: 'Completion Tokens', key: 'tokens.completion' },
      { name: 'Response Length', key: 'responseLength' }
    ];

    return metrics.map(metric => {
      const row: any = { metric: metric.name };
      
      comparison.executions.forEach(exec => {
        let value: any;
        if (metric.key === 'responseLength') {
          value = exec.response.length;
        } else if (metric.key.includes('.')) {
          const keys = metric.key.split('.');
          value = (exec as any)[keys[0]][keys[1]];
        } else {
          value = (exec as any)[metric.key];
        }
        row[exec.model] = value;
      });
      
      return row;
    });
  }

  getBestModel(metricKey: string): string {
    const comparison = this.currentComparison();
    if (!comparison) return '';

    const lowerIsBetter = ['latency'];
    
    const values = comparison.executions.map(exec => {
      let value: number;
      if (metricKey === 'Response Length') {
        value = exec.response.length;
      } else if (metricKey === 'Latency (ms)') {
        value = exec.latency;
      } else {
        value = exec.tokens.total;
      }
      return { model: exec.model, value };
    });

    const sorted = values.sort((a, b) => 
      lowerIsBetter.some(m => metricKey.includes(m)) 
        ? a.value - b.value 
        : b.value - a.value
    );

    return sorted[0].model;
  }

  formatTemperature(value: number): string {
    return value.toFixed(2);
  }

  copyResponse(response: string) {
    navigator.clipboard.writeText(response);
  }
}
