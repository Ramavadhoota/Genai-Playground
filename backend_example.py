# Python Backend Example for GenAI Playground
# This is a sample FastAPI backend that the Angular frontend can connect to

"""
Installation:
pip install fastapi uvicorn openai anthropic langchain python-dotenv

Run:
uvicorn backend:app --reload --port 8000
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="GenAI Playground Backend")

# CORS configuration for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],  # Angular dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class ExecuteRequest(BaseModel):
    prompt: str
    model: str
    temperature: float = 0.7
    max_tokens: int = 1000

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    model: str

class RAGRequest(BaseModel):
    query: str
    top_k: int = 5
    model: str

class ExecuteResponse(BaseModel):
    content: str
    usage: Dict[str, int]

class ChatResponse(BaseModel):
    content: str
    usage: Dict[str, int]

class RAGResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]]

# Mock functions (replace with real API calls)
def call_openai(prompt: str, model: str, temperature: float, max_tokens: int) -> Dict[str, Any]:
    """
    Replace with actual OpenAI API call:
    
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    
    response = openai.ChatCompletion.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        temperature=temperature,
        max_tokens=max_tokens
    )
    
    return {
        "content": response.choices[0].message.content,
        "usage": {
            "prompt_tokens": response.usage.prompt_tokens,
            "completion_tokens": response.usage.completion_tokens,
            "total_tokens": response.usage.total_tokens
        }
    }
    """
    # Mock response
    return {
        "content": f"Mock response from {model}: {prompt[:100]}...",
        "usage": {
            "prompt_tokens": len(prompt.split()),
            "completion_tokens": 50,
            "total_tokens": len(prompt.split()) + 50
        }
    }

def call_anthropic(prompt: str, model: str, temperature: float, max_tokens: int) -> Dict[str, Any]:
    """
    Replace with actual Anthropic API call:
    
    import anthropic
    
    client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    message = client.messages.create(
        model=model,
        max_tokens=max_tokens,
        temperature=temperature,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return {
        "content": message.content[0].text,
        "usage": {
            "prompt_tokens": message.usage.input_tokens,
            "completion_tokens": message.usage.output_tokens,
            "total_tokens": message.usage.input_tokens + message.usage.output_tokens
        }
    }
    """
    # Mock response
    return {
        "content": f"Mock Claude response: {prompt[:100]}...",
        "usage": {
            "prompt_tokens": len(prompt.split()),
            "completion_tokens": 50,
            "total_tokens": len(prompt.split()) + 50
        }
    }

# API Endpoints
@app.post("/api/execute", response_model=ExecuteResponse)
async def execute_prompt(request: ExecuteRequest):
    """Execute a single prompt with specified model and parameters"""
    try:
        start_time = time.time()
        
        # Route to appropriate model provider
        if request.model.startswith("gpt"):
            result = call_openai(
                request.prompt,
                request.model,
                request.temperature,
                request.max_tokens
            )
        elif request.model.startswith("claude"):
            result = call_anthropic(
                request.prompt,
                request.model,
                request.temperature,
                request.max_tokens
            )
        else:
            # Hugging Face or other models
            result = {
                "content": f"Response from {request.model}",
                "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30}
            }
        
        latency = int((time.time() - start_time) * 1000)
        
        return ExecuteResponse(
            content=result["content"],
            usage=result["usage"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Handle multi-turn chat conversation"""
    try:
        # Format messages for the model
        messages_formatted = [
            {"role": msg.role, "content": msg.content}
            for msg in request.messages
        ]
        
        # Get the last user message for processing
        last_message = request.messages[-1].content
        
        # Call appropriate model
        if request.model.startswith("gpt"):
            result = call_openai(last_message, request.model, 0.7, 1000)
        else:
            result = call_anthropic(last_message, request.model, 0.7, 1000)
        
        return ChatResponse(
            content=result["content"],
            usage=result["usage"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag", response_model=RAGResponse)
async def rag_query(request: RAGRequest):
    """
    RAG (Retrieval-Augmented Generation) query
    
    This should:
    1. Retrieve relevant documents from vector database
    2. Format them as context
    3. Send to LLM with the query
    4. Return answer and sources
    
    Example using LangChain:
    
    from langchain.vectorstores import Chroma
    from langchain.embeddings import OpenAIEmbeddings
    from langchain.chains import RetrievalQA
    from langchain.llms import OpenAI
    
    vectordb = Chroma(persist_directory="./chroma_db", embedding_function=OpenAIEmbeddings())
    qa_chain = RetrievalQA.from_chain_type(
        llm=OpenAI(),
        retriever=vectordb.as_retriever(search_kwargs={"k": request.top_k})
    )
    
    result = qa_chain({"query": request.query})
    """
    try:
        # Mock RAG response
        mock_sources = [
            {
                "content": "Sample document content relevant to the query...",
                "metadata": {"source": "document1.pdf", "page": 5},
                "score": 0.92
            },
            {
                "content": "Another relevant piece of information...",
                "metadata": {"source": "document2.pdf", "page": 12},
                "score": 0.87
            }
        ]
        
        answer = f"Based on the retrieved documents, here's the answer to '{request.query}'..."
        
        return RAGResponse(
            answer=answer,
            sources=mock_sources
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": time.time()}

@app.get("/api/models")
async def get_available_models():
    """Get list of available models"""
    return {
        "models": [
            {
                "name": "gpt-4",
                "provider": "openai",
                "displayName": "GPT-4",
                "maxTokens": 8192
            },
            {
                "name": "gpt-3.5-turbo",
                "provider": "openai",
                "displayName": "GPT-3.5 Turbo",
                "maxTokens": 4096
            },
            {
                "name": "claude-3-opus",
                "provider": "anthropic",
                "displayName": "Claude 3 Opus",
                "maxTokens": 4096
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
