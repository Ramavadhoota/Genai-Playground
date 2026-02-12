import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'GenAI Playground';
  
  navItems = [
    { path: '/playground', icon: 'play_circle_outline', label: 'Prompt Playground' },
    { path: '/chat', icon: 'chat', label: 'Chat Interface' },
    { path: '/history', icon: 'history', label: 'Conversation History' },
    { path: '/comparison', icon: 'compare_arrows', label: 'Response Comparison' },
    { path: '/dashboard', icon: 'dashboard', label: 'Evaluation Dashboard' }
  ];
}
