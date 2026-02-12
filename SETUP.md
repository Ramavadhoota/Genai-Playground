# Setup & Development Guide

## Quick Start

### 1. Prerequisites
- Node.js 18+ and npm 9+
- Angular CLI 17
- (Optional) Python 3.9+ for backend integration

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd genai-playground

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:4200` in your browser.

## Development Workflow

### Running the Application

```bash
# Development server with hot reload
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint code
ng lint
```

### Project Structure Explained

```
src/app/
├── components/          # Feature components
│   ├── prompt-playground/
│   ├── chat-interface/
│   ├── conversation-history/
│   ├── response-comparison/
│   └── evaluation-dashboard/
├── services/           # Business logic and API calls
│   └── genai.service.ts
├── models/            # TypeScript interfaces
│   └── interfaces.ts
└── shared/            # Shared utilities and components
```

### Creating New Components

```bash
# Generate a new component
ng generate component components/my-feature --standalone

# Generate a new service
ng generate service services/my-service
```

### Adding New Features

1. **Create Component**: Use Angular CLI to scaffold
2. **Define Models**: Add interfaces in `models/interfaces.ts`
3. **Implement Service**: Add business logic in appropriate service
4. **Add Route**: Register in `app.routes.ts`
5. **Update Navigation**: Add to `app.component.ts` navItems

## Backend Integration

### Option 1: Use Mock Data (Current Setup)
The application works out of the box with mock data. No backend required.

### Option 2: Python FastAPI Backend

1. **Install Python dependencies**:
```bash
pip install fastapi uvicorn openai anthropic langchain python-dotenv
```

2. **Set up environment variables**:
Create `.env` file:
```
OPENAI_API_KEY=your-key
ANTHROPIC_API_KEY=your-key
```

3. **Run the backend**:
```bash
python backend_example.py
```

4. **Update Angular service**:
In `genai.service.ts`, change:
```typescript
private apiUrl = 'http://localhost:8000/api';
```

Then replace mock methods with real HTTP calls.

### Option 3: Node.js/Express Backend

Create `server.js`:
```javascript
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/execute', async (req, res) => {
  const { prompt, model, temperature, max_tokens } = req.body;
  
  // Call your LLM API here
  const response = await callLLMAPI(prompt, model);
  
  res.json({
    content: response.content,
    usage: response.usage
  });
});

app.listen(8000, () => {
  console.log('Backend running on port 8000');
});
```

## Customization Guide

### Changing Color Themes

Edit component SCSS files to change gradient backgrounds:

```scss
// prompt-playground.component.scss
.prompt-playground {
  background: linear-gradient(135deg, #your-color1 0%, #your-color2 100%);
}
```

### Adding New Models

Update `genai.service.ts`:

```typescript
availableModels: ModelConfig[] = [
  // ... existing models
  {
    name: 'your-model-name',
    provider: 'your-provider',
    displayName: 'Your Model Display Name',
    maxTokens: 4096,
    supportsStreaming: true
  }
];
```

### Customizing Metrics

Add new metrics in `evaluation-dashboard.component.ts`:

```typescript
interface DashboardStats {
  // ... existing metrics
  yourNewMetric: number;
}
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --include='**/genai.service.spec.ts'
```

### E2E Tests

```bash
# Install Cypress (if not installed)
npm install --save-dev cypress

# Run E2E tests
npx cypress open
```

## Performance Optimization

### Lazy Loading Routes

Update `app.routes.ts`:

```typescript
export const routes: Routes = [
  {
    path: 'playground',
    loadComponent: () => import('./components/prompt-playground/prompt-playground.component')
      .then(m => m.PromptPlaygroundComponent)
  }
];
```

### OnPush Change Detection

Update component decorator:

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Optimizing Bundle Size

```bash
# Analyze bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/genai-playground/stats.json
```

## Deployment

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Netlify

```bash
# Build
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist/genai-playground/browser
```

### Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/genai-playground/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t genai-playground .
docker run -p 80:80 genai-playground
```

## Troubleshooting

### Common Issues

**1. Module not found errors**
```bash
npm install
npm start
```

**2. CORS errors when connecting to backend**
Ensure backend has CORS enabled:
```python
# FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**3. Material theme issues**
Ensure you have the theme import in `styles.scss`:
```scss
@import '@angular/material/prebuilt-themes/indigo-pink.css';
```

## Best Practices

### Code Organization
- Keep components focused and single-purpose
- Use services for business logic
- Define clear interfaces for data models
- Use RxJS operators for data transformation

### State Management
- Use BehaviorSubjects for shared state
- Leverage Angular signals for reactive updates
- Persist important data to localStorage

### Error Handling
- Always use try-catch in async operations
- Provide user-friendly error messages
- Log errors for debugging

### TypeScript
- Enable strict mode
- Define explicit types
- Use interfaces over classes for data models

## Resources

- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Documentation](https://rxjs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- Check the README.md for feature documentation
- Review example code in component files
- Open an issue on GitHub
- Contact maintainers

---

Happy coding! 🚀
