import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  Message,
  Conversation,
  PromptExecution,
  ModelConfig,
  RAGQuery,
  RAGResponse,
  ComparisonResult
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class GenAIService {
  private http = inject(HttpClient);
  
  // Mock API endpoint - replace with your actual backend
  private apiUrl = 'http://localhost:8000/api';
  
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  conversations$ = this.conversationsSubject.asObservable();
  
  private executionsSubject = new BehaviorSubject<PromptExecution[]>([]);
  executions$ = this.executionsSubject.asObservable();
  
  private comparisonsSubject = new BehaviorSubject<ComparisonResult[]>([]);
  comparisons$ = this.comparisonsSubject.asObservable();

  // Available models
  availableModels: ModelConfig[] = [
    {
      name: 'gpt-4',
      provider: 'openai',
      displayName: 'GPT-4',
      maxTokens: 8192,
      supportsStreaming: true
    },
    {
      name: 'gpt-3.5-turbo',
      provider: 'openai',
      displayName: 'GPT-3.5 Turbo',
      maxTokens: 4096,
      supportsStreaming: true
    },
    {
      name: 'claude-3-opus',
      provider: 'anthropic',
      displayName: 'Claude 3 Opus',
      maxTokens: 4096,
      supportsStreaming: true
    },
    {
      name: 'mistral-7b',
      provider: 'huggingface',
      displayName: 'Mistral 7B',
      maxTokens: 2048,
      supportsStreaming: false
    }
  ];

  constructor() {
    this.loadFromLocalStorage();
  }

  // Prompt Playground
  executePrompt(
    prompt: string,
    model: string,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Observable<PromptExecution> {
    const startTime = Date.now();
    
    // Mock implementation - replace with actual API call
    return this.mockAPICall({
      prompt,
      model,
      temperature,
      max_tokens: maxTokens
    }).pipe(
      map(response => {
        const execution: PromptExecution = {
          id: this.generateId(),
          prompt,
          response: response.content,
          model,
          temperature,
          maxTokens,
          timestamp: new Date(),
          latency: Date.now() - startTime,
          tokens: {
            prompt: response.usage?.prompt_tokens || 0,
            completion: response.usage?.completion_tokens || 0,
            total: response.usage?.total_tokens || 0
          }
        };
        
        this.addExecution(execution);
        return execution;
      }),
      catchError(error => {
        console.error('Error executing prompt:', error);
        return throwError(() => error);
      })
    );
  }

  // Chat Interface
  sendMessage(
    conversationId: string,
    content: string,
    model: string
  ): Observable<Message> {
    const userMessage: Message = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    this.addMessageToConversation(conversationId, userMessage);

    const conversation = this.getConversation(conversationId);
    const messages = conversation?.messages || [];

    const startTime = Date.now();

    return this.mockChatAPICall({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      model
    }).pipe(
      map(response => {
        const assistantMessage: Message = {
          id: this.generateId(),
          role: 'assistant',
          content: response.content,
          timestamp: new Date(),
          model,
          tokens: response.usage?.total_tokens,
          latency: Date.now() - startTime
        };

        this.addMessageToConversation(conversationId, assistantMessage);
        return assistantMessage;
      })
    );
  }

  // RAG Chat
  ragQuery(query: RAGQuery, model: string): Observable<RAGResponse> {
    const startTime = Date.now();

    return this.mockRAGAPICall({
      query: query.query,
      top_k: query.topK,
      model
    }).pipe(
      map(response => ({
        answer: response.answer,
        sources: response.sources || [],
        model,
        latency: Date.now() - startTime
      }))
    );
  }

  // Response Comparison
  comparePromptAcrossModels(
    prompt: string,
    models: string[],
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Observable<ComparisonResult> {
    const executions$ = models.map(model =>
      this.executePrompt(prompt, model, temperature, maxTokens)
    );

    return new Observable(observer => {
      const executions: PromptExecution[] = [];
      let completed = 0;

      executions$.forEach((exec$, index) => {
        exec$.subscribe({
          next: execution => {
            executions[index] = execution;
            completed++;

            if (completed === models.length) {
              const comparison: ComparisonResult = {
                id: this.generateId(),
                prompt,
                executions,
                createdAt: new Date()
              };

              this.addComparison(comparison);
              observer.next(comparison);
              observer.complete();
            }
          },
          error: err => observer.error(err)
        });
      });
    });
  }

  // Conversation Management
  createConversation(model: string, title?: string): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      title: title || `Conversation ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model,
      totalTokens: 0
    };

    const conversations = this.conversationsSubject.value;
    conversations.unshift(conversation);
    this.conversationsSubject.next(conversations);
    this.saveToLocalStorage();

    return conversation;
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversationsSubject.value.find(c => c.id === id);
  }

  deleteConversation(id: string): void {
    const conversations = this.conversationsSubject.value.filter(c => c.id !== id);
    this.conversationsSubject.next(conversations);
    this.saveToLocalStorage();
  }

  updateConversationTitle(id: string, title: string): void {
    const conversations = this.conversationsSubject.value;
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      conversation.title = title;
      conversation.updatedAt = new Date();
      this.conversationsSubject.next([...conversations]);
      this.saveToLocalStorage();
    }
  }

  private addMessageToConversation(conversationId: string, message: Message): void {
    const conversations = this.conversationsSubject.value;
    const conversation = conversations.find(c => c.id === conversationId);
    
    if (conversation) {
      conversation.messages.push(message);
      conversation.updatedAt = new Date();
      if (message.tokens) {
        conversation.totalTokens += message.tokens;
      }
      this.conversationsSubject.next([...conversations]);
      this.saveToLocalStorage();
    }
  }

  private addExecution(execution: PromptExecution): void {
    const executions = this.executionsSubject.value;
    executions.unshift(execution);
    this.executionsSubject.next(executions);
    this.saveToLocalStorage();
  }

  private addComparison(comparison: ComparisonResult): void {
    const comparisons = this.comparisonsSubject.value;
    comparisons.unshift(comparison);
    this.comparisonsSubject.next(comparisons);
    this.saveToLocalStorage();
  }

  getExecutions(): PromptExecution[] {
    return this.executionsSubject.value;
  }

  getComparisons(): ComparisonResult[] {
    return this.comparisonsSubject.value;
  }

  deleteExecution(id: string): void {
    const executions = this.executionsSubject.value.filter(e => e.id !== id);
    this.executionsSubject.next(executions);
    this.saveToLocalStorage();
  }

  deleteComparison(id: string): void {
    const comparisons = this.comparisonsSubject.value.filter(c => c.id !== id);
    this.comparisonsSubject.next(comparisons);
    this.saveToLocalStorage();
  }

  // Local Storage
  private saveToLocalStorage(): void {
    localStorage.setItem('conversations', JSON.stringify(this.conversationsSubject.value));
    localStorage.setItem('executions', JSON.stringify(this.executionsSubject.value));
    localStorage.setItem('comparisons', JSON.stringify(this.comparisonsSubject.value));
  }

  private loadFromLocalStorage(): void {
    const conversations = localStorage.getItem('conversations');
    const executions = localStorage.getItem('executions');
    const comparisons = localStorage.getItem('comparisons');

    if (conversations) {
      this.conversationsSubject.next(JSON.parse(conversations));
    }
    if (executions) {
      this.executionsSubject.next(JSON.parse(executions));
    }
    if (comparisons) {
      this.comparisonsSubject.next(JSON.parse(comparisons));
    }
  }

  // Mock API calls - replace with real HTTP calls
  private mockAPICall(params: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          content: this.generateMockResponse(params.prompt, params.model),
          usage: {
            prompt_tokens: Math.floor(params.prompt.length / 4),
            completion_tokens: Math.floor(Math.random() * 200) + 50,
            total_tokens: Math.floor(params.prompt.length / 4) + Math.floor(Math.random() * 200) + 50
          }
        });
        observer.complete();
      }, Math.random() * 1000 + 500);
    });
  }

  private mockChatAPICall(params: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        const lastMessage = params.messages[params.messages.length - 1]?.content || '';
        observer.next({
          content: this.generateMockResponse(lastMessage, params.model),
          usage: {
            total_tokens: Math.floor(Math.random() * 300) + 100
          }
        });
        observer.complete();
      }, Math.random() * 1000 + 500);
    });
  }

  private mockRAGAPICall(params: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({
          answer: this.generateMockResponse(params.query, params.model),
          sources: [
            {
              content: 'Sample document content relevant to the query...',
              metadata: { source: 'document1.pdf', page: 5 },
              score: 0.92
            },
            {
              content: 'Another relevant piece of information...',
              metadata: { source: 'document2.pdf', page: 12 },
              score: 0.87
            }
          ]
        });
        observer.complete();
      }, Math.random() * 1500 + 1000);
    });
  }

  private generateMockResponse(prompt: string, model: string): string {
    const responses = [
      `Based on your prompt about "${prompt.slice(0, 50)}...", here's a detailed response from ${model}. This is a mock response that demonstrates the functionality of the GenAI Playground.`,
      `I understand you're asking about: "${prompt.slice(0, 50)}...". Let me provide you with a comprehensive answer using ${model}. [Mock response content]`,
      `Great question! Regarding "${prompt.slice(0, 50)}...", here's what ${model} has to say: This is a simulated response to demonstrate the application's features.`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  clearAllData(): void {
    this.conversationsSubject.next([]);
    this.executionsSubject.next([]);
    this.comparisonsSubject.next([]);
    localStorage.clear();
  }
}
