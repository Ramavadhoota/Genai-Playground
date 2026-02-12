# Quick Start Guide - GenAI Playground

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd genai-playground
npm install
```

### Step 2: Start Development Server
```bash
npm start
```

### Step 3: Open Browser
Navigate to: `http://localhost:4200`

That's it! The app is now running with mock data. 🎉

---

## 📱 Explore the Features

### Feature 1: Prompt Playground
**URL**: `http://localhost:4200/playground`
- Select a model (GPT-4, GPT-3.5, Claude, Mistral)
- Adjust temperature and max tokens
- Enter a prompt and click "Execute"
- View response with metrics

### Feature 2: Chat Interface
**URL**: `http://localhost:4200/chat`
- Click "Start Chat"
- Select your model
- Type messages and press Enter
- Have a multi-turn conversation

### Feature 3: Conversation History
**URL**: `http://localhost:4200/history`
- Browse all your chat conversations
- Search by content or title
- Expand to see full message history
- Export or delete conversations

### Feature 4: Response Comparison
**URL**: `http://localhost:4200/comparison`
- Select 2+ models to compare
- Enter a prompt
- Click "Compare"
- View side-by-side or metrics table

### Feature 5: Evaluation Dashboard
**URL**: `http://localhost:4200/dashboard`
- View key metrics and statistics
- See model usage distribution
- Check 7-day activity chart
- Review recent activity

---

## 🔧 Common Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Generate new component
ng generate component components/my-component --standalone

# Generate new service
ng generate service services/my-service
```

---

## 🔌 Connect to Real Backend (Optional)

### Option 1: Python FastAPI Backend

1. **Install Python dependencies**:
```bash
pip install fastapi uvicorn openai anthropic python-dotenv
```

2. **Create .env file** with your API keys:
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

3. **Run the backend**:
```bash
python backend_example.py
```

4. **Update Angular app**:
In `src/app/services/genai.service.ts`, line 20:
```typescript
private apiUrl = 'http://localhost:8000/api';
```

Then replace the mock methods with real HTTP calls (examples in comments).

### Option 2: Use Mock Data (Current Setup)
The app works perfectly with simulated data. No backend needed!

---

## 📚 Documentation

- **README.md**: Complete feature documentation
- **SETUP.md**: Development and deployment guide
- **PROJECT_OVERVIEW.md**: Comprehensive project overview
- **backend_example.py**: Python backend example code

---

## 🎨 Customization

### Change Theme Colors
Edit component SCSS files:
```scss
// Example: prompt-playground.component.scss
.prompt-playground {
  background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

### Add New AI Models
Edit `src/app/services/genai.service.ts`:
```typescript
availableModels: ModelConfig[] = [
  // Add your model here
  {
    name: 'model-id',
    provider: 'provider-name',
    displayName: 'Display Name',
    maxTokens: 4096,
    supportsStreaming: true
  }
];
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Use a different port
ng serve --port 4300
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors (when using real backend)
Make sure your backend has CORS enabled for `http://localhost:4200`

---

## 📦 Project Structure

```
genai-playground/
├── src/app/
│   ├── components/          # 5 main features
│   ├── services/           # API & state management
│   ├── models/            # TypeScript interfaces
│   └── app.component.ts   # Main app with navigation
├── README.md              # Main docs
├── SETUP.md              # Setup guide
├── backend_example.py    # Python backend
└── package.json          # Dependencies
```

---

## ✅ What's Included

✅ **5 Complete Features** (all working out of the box)
✅ **Beautiful UI** with Material Design
✅ **Mock Data** for immediate testing
✅ **Backend Example** (Python FastAPI)
✅ **Full Documentation** (4 comprehensive guides)
✅ **Responsive Design** (works on all devices)
✅ **TypeScript** (full type safety)
✅ **Production Ready** (error handling, loading states)

---

## 🎯 Next Steps

1. ✅ **Explore Features**: Try all 5 features with mock data
2. 🔧 **Customize**: Change colors, add models, modify UI
3. 🔌 **Connect Backend**: Use the Python example or build your own
4. 🚀 **Deploy**: Build and deploy to Vercel, Netlify, or your platform

---

## 💡 Tips

- **Save Your Work**: All data is stored in localStorage
- **Clear Data**: Use the dashboard to clear all stored data
- **Export Conversations**: Download conversations as JSON
- **Keyboard Shortcuts**: Press Enter to send in chat (Shift+Enter for new line)

---

## 🆘 Need Help?

- Read the **README.md** for detailed feature documentation
- Check **SETUP.md** for development and deployment guide
- Review **PROJECT_OVERVIEW.md** for architecture details
- Look at code comments for implementation examples

---

## 🎉 You're All Set!

Your Angular 17 GenAI Playground is ready to use!

**Start exploring**: `http://localhost:4200`

Happy experimenting! 🚀

---

**Made with** ❤️ **using Angular 17 + TypeScript + Material Design**
