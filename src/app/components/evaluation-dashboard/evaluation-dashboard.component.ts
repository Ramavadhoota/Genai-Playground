import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { GenAIService } from '../../services/genai.service';
import { PromptExecution, Conversation, ComparisonResult } from '../../models/interfaces';

interface DashboardStats {
  totalExecutions: number;
  totalConversations: number;
  totalComparisons: number;
  totalTokensUsed: number;
  averageLatency: number;
  modelUsage: { [key: string]: number };
  executionsByDay: { date: string; count: number }[];
}

@Component({
  selector: 'app-evaluation-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './evaluation-dashboard.component.html',
  styleUrls: ['./evaluation-dashboard.component.scss']
})
export class EvaluationDashboardComponent {
  private genAIService = inject(GenAIService);

  // Expose Object to template
  Object = Object;

  stats = signal<DashboardStats>({
    totalExecutions: 0,
    totalConversations: 0,
    totalComparisons: 0,
    totalTokensUsed: 0,
    averageLatency: 0,
    modelUsage: {},
    executionsByDay: []
  });

  executions = signal<PromptExecution[]>([]);
  conversations = signal<Conversation[]>([]);
  comparisons = signal<ComparisonResult[]>([]);

  ngOnInit() {
    this.genAIService.executions$.subscribe(execs => {
      this.executions.set(execs);
      this.updateStats();
    });

    this.genAIService.conversations$.subscribe(convos => {
      this.conversations.set(convos);
      this.updateStats();
    });

    this.genAIService.comparisons$.subscribe(comps => {
      this.comparisons.set(comps);
      this.updateStats();
    });
  }

  private updateStats() {
    const executions = this.executions();
    const conversations = this.conversations();
    const comparisons = this.comparisons();

    // Calculate total tokens
    const executionTokens = executions.reduce((sum, e) => sum + e.tokens.total, 0);
    const conversationTokens = conversations.reduce((sum, c) => c.totalTokens + sum, 0);
    const totalTokensUsed = executionTokens + conversationTokens;

    // Calculate average latency
    const allLatencies = [
      ...executions.map(e => e.latency),
      ...conversations.flatMap(c => 
        c.messages.filter(m => m.latency).map(m => m.latency!)
      )
    ];
    const averageLatency = allLatencies.length > 0
      ? Math.round(allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length)
      : 0;

    // Calculate model usage
    const modelUsage: { [key: string]: number } = {};
    executions.forEach(e => {
      modelUsage[e.model] = (modelUsage[e.model] || 0) + 1;
    });
    conversations.forEach(c => {
      modelUsage[c.model] = (modelUsage[c.model] || 0) + 1;
    });

    // Calculate executions by day (last 7 days)
    const executionsByDay = this.getExecutionsByDay(executions);

    this.stats.set({
      totalExecutions: executions.length,
      totalConversations: conversations.length,
      totalComparisons: comparisons.length,
      totalTokensUsed,
      averageLatency,
      modelUsage,
      executionsByDay
    });
  }

  private getExecutionsByDay(executions: PromptExecution[]): { date: string; count: number }[] {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const countByDay: { [key: string]: number } = {};
    last7Days.forEach(day => countByDay[day] = 0);

    executions.forEach(exec => {
      const day = new Date(exec.timestamp).toISOString().split('T')[0];
      if (countByDay.hasOwnProperty(day)) {
        countByDay[day]++;
      }
    });

    return last7Days.map(date => ({ date, count: countByDay[date] }));
  }

  getMostUsedModel(): string {
    const usage = this.stats().modelUsage;
    const entries = Object.entries(usage);
    if (entries.length === 0) return 'N/A';

    return entries.reduce((a, b) => a[1] > b[1] ? a : b)[0];
  }

  getModelUsagePercentage(model: string): number {
    const usage = this.stats().modelUsage;
    const total = Object.values(usage).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round((usage[model] / total) * 100);
  }

  clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      this.genAIService.clearAllData();
    }
  }

  getAverageTokensPerExecution(): number {
    const executions = this.executions();
    if (executions.length === 0) return 0;
    
    const total = executions.reduce((sum, e) => sum + e.tokens.total, 0);
    return Math.round(total / executions.length);
  }

  getMaxActivityDay(): string {
    const byDay = this.stats().executionsByDay;
    if (byDay.length === 0) return 'N/A';
    
    const max = byDay.reduce((a, b) => a.count > b.count ? a : b);
    return new Date(max.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getBarHeightPercentage(count: number): number {
    const maxCount = Math.max(...this.stats().executionsByDay.map(d => d.count), 1);
    return count > 0 ? (count / maxCount * 100) : 5;
  }
}
