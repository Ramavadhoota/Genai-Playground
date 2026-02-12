# Angular 17 GenAI Playground

A comprehensive Angular 17 application for experimenting with Large Language Models (LLMs) and AI-powered features. Built with standalone components, Angular Material, and TypeScript.

![Angular](https://img.shields.io/badge/Angular-17-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Material](https://img.shields.io/badge/Material-17-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Features

### 1. **Prompt Playground**
- Execute prompts across different AI models (GPT-4, GPT-3.5, Claude, Mistral)
- Configure temperature and max tokens for fine-tuned responses
- View execution history with metrics (latency, tokens)
- Copy and reuse previous prompts
- Real-time response visualization

### 2. **Chat Interface**
- Multi-turn conversations with AI models
- Message history tracking
- Real-time streaming-like responses
- Conversation persistence using localStorage
- Token usage and latency metrics per message
- Copy individual messages

### 3. **Conversation History**
- Browse all past conversations
- Search conversations by title or content
- Expandable conversation view with full message history
- Export conversations as JSON
- View metadata: total tokens, average latency, timestamps
- Delete individual conversations

### 4. **Response Comparison**
- Compare responses from multiple models side-by-side
- Side-by-side view for easy comparison
- Metrics table showing performance comparison
- Identify best-performing models per metric
- Save comparison history
- Full response view for detailed analysis

### 5. **Evaluation Dashboard**
- Real-time metrics visualization
- Track total executions, conversations, and comparisons
- Monitor token usage across all activities
- Model usage distribution with percentage breakdown
- Activity charts showing usage over the last 7 days
- Recent activity feed
- Data export capabilities (coming soon)

## 🛠️ Tech Stack

- **Framework**: Angular 17 (Standalone Components)
- **Language**: TypeScript 5.4
- **UI Library**: Angular Material 17
- **State Management**: RxJS with BehaviorSubjects
- **HTTP Client**: Angular HttpClient
- **Styling**: SCSS with custom theming
- **Storage**: Browser localStorage for persistence

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI 17

## 🔧 Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd genai-playground
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm start
```

4. **Open browser**
Navigate to `http://localhost:4200`

## 🏗️ Project Structure

```
genai-playground/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── prompt-playground/
│   │   │   │   ├── prompt-playground.component.ts
│   │   │   │   ├── prompt-playground.component.html
│   │   │   │   └── prompt-playground.component.scss
│   │   │   ├── chat-interface/
│   │   │   ├── conversation-history/
│   │   │   ├── response-comparison/
│   │   │   └── evaluation-dashboard/
│   │   ├── services/
│   │   │   └── genai.service.ts
│   │   ├── models/
│   │   │   └── interfaces.ts
│   │   ├── app.component.ts
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── styles.scss
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Features in Detail

### Prompt Playground
The Prompt Playground allows you to experiment with different prompts and model configurations:

- **Model Selection**: Choose from GPT-4, GPT-3.5 Turbo, Claude 3 Opus, or Mistral 7B
- **Temperature Control**: Adjust creativity (0-2) with a slider
- **Token Limit**: Set maximum response length (100-4000 tokens)
- **Response Metrics**: View latency, token usage, and model information
- **History**: Access and reuse previous prompt executions

### Chat Interface
Engage in multi-turn conversations with AI:

- **Conversation Management**: Create new conversations or continue existing ones
- **Message History**: All messages are preserved and displayed chronologically
- **Auto-scroll**: Automatically scrolls to newest messages
- **Keyboard Shortcuts**: Press Enter to send (Shift+Enter for new line)
- **Persistence**: Conversations are saved to localStorage

### Conversation History
Manage and review all your conversations:

- **Search**: Find conversations by title or message content
- **Expand/Collapse**: View full conversation details on demand
- **Export**: Download conversations as JSON for external use
- **Metrics**: See token usage, message count, and performance stats
- **Delete**: Remove unwanted conversations

### Response Comparison
Compare how different models respond to the same prompt:

- **Multi-Model Selection**: Choose 2+ models to compare
- **Side-by-Side View**: Visual comparison of responses
- **Metrics Table**: Performance comparison across all models
- **Best Model Indicators**: Automatically highlights best performers
- **Comparison History**: Save and revisit previous comparisons

### Evaluation Dashboard
Monitor your AI experimentation:

- **Key Metrics**: Total executions, conversations, comparisons, tokens, latency
- **Model Usage**: Visual breakdown of which models you use most
- **Activity Chart**: 7-day activity visualization
- **Recent Activity**: Quick view of latest executions
- **Data Management**: Clear all data when needed

## 🔌 Backend Integration

### Mock API (Current Implementation)
The application currently uses mock API calls that simulate real backend responses. This is implemented in `GenAIService`:

```typescript
private mockAPICall(params: any): Observable<any> {
  return new Observable(observer => {
    setTimeout(() => {
      observer.next({
        content: this.generateMockResponse(params.prompt, params.model),
        usage: { /* token stats */ }
      });
      observer.complete();
    }, Math.random() * 1000 + 500);
  });
}
```

### Real Backend Integration
To connect to a real backend, update the following in `genai.service.ts`:

1. **Update API URL**:
```typescript
private apiUrl = 'http://localhost:8000/api'; // Your backend URL
```

2. **Replace Mock Methods with Real HTTP Calls**:
```typescript
executePrompt(prompt: string, model: string, temperature: number, maxTokens: number): Observable<PromptExecution> {
  return this.http.post<any>(`${this.apiUrl}/execute`, {
    prompt,
    model,
    temperature,
    max_tokens: maxTokens
  }).pipe(
    map(response => this.mapToPromptExecution(response))
  );
}
```

### Expected Backend API Endpoints

```
POST /api/execute
- Body: { prompt, model, temperature, max_tokens }
- Response: { content, usage: { prompt_tokens, completion_tokens, total_tokens } }

POST /api/chat
- Body: { messages, model }
- Response: { content, usage }

POST /api/rag
- Body: { query, top_k, model }
- Response: { answer, sources }
```

## 📊 Data Models

### Core Interfaces

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
  latency?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  totalTokens: number;
}

interface PromptExecution {
  id: string;
  prompt: string;
  response: string;
  model: string;
  temperature: number;
  maxTokens: number;
  timestamp: Date;
  latency: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
}
```

## 🎯 Usage Examples

### Starting a New Chat
1. Navigate to "Chat Interface"
2. Select your preferred model
3. Click "Start Chat"
4. Type your message and press Enter

### Comparing Model Responses
1. Navigate to "Response Comparison"
2. Select 2 or more models
3. Adjust temperature and token settings
4. Enter your prompt
5. Click "Compare"
6. View results in side-by-side or metrics view

### Viewing Analytics
1. Navigate to "Evaluation Dashboard"
2. Review key metrics cards
3. Check model usage distribution
4. Analyze activity trends

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

### Deploy to Hosting
The application can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Firebase**: `firebase deploy`
- **AWS S3**: Upload `dist/` contents

## 🔐 Environment Configuration

Create a `.env` file for environment-specific settings:

```env
API_URL=https://your-backend-api.com
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Material Design for the UI components
- OpenAI, Anthropic, and Hugging Face for AI models

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: sushantharishi@gmail.com



---

Built with ❤️ using Angular 17 and TypeScript
