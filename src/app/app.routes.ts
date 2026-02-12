import { Routes } from '@angular/router';
import { PromptPlaygroundComponent } from './components/prompt-playground/prompt-playground.component';
import { ChatInterfaceComponent } from './components/chat-interface/chat-interface.component';
import { ConversationHistoryComponent } from './components/conversation-history/conversation-history.component';
import { ResponseComparisonComponent } from './components/response-comparison/response-comparison.component';
import { EvaluationDashboardComponent } from './components/evaluation-dashboard/evaluation-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/playground', pathMatch: 'full' },
  { path: 'playground', component: PromptPlaygroundComponent },
  { path: 'chat', component: ChatInterfaceComponent },
  { path: 'history', component: ConversationHistoryComponent },
  { path: 'comparison', component: ResponseComparisonComponent },
  { path: 'dashboard', component: EvaluationDashboardComponent },
  { path: '**', redirectTo: '/playground' }
];
