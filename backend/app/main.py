"""FastAPI application for the PocketCode AI Mentor."""
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse

from .config import CORS_ORIGINS
from .models import (
    MentorRequest, MentorResponse, HealthResponse,
    AnalyzeProjectRequest, AnalyzeProjectResponse,
)
from .mentor import get_mentor_response, stream_mentor_response, generate_follow_up_suggestions


app = FastAPI(
    title="PocketCode AI Mentor",
    description="AI-powered mentor for PocketCode (Catrobat) students — explains concepts, debugs code, suggests improvements, and more.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse()


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    return HealthResponse()


@app.post("/api/mentor/chat", response_model=MentorResponse)
async def mentor_chat(request: MentorRequest):
    """Send a message to the AI Mentor and get a response."""
    try:
        reply = await get_mentor_response(request)
        suggestions = generate_follow_up_suggestions(request.mode, reply)
        return MentorResponse(
            reply=reply,
            mode=request.mode,
            suggestions=suggestions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mentor error: {str(e)}")


@app.post("/api/mentor/stream")
async def mentor_stream(request: MentorRequest):
    """Stream the AI Mentor response via Server-Sent Events."""
    async def event_generator():
        try:
            async for token in stream_mentor_response(request):
                yield {"event": "token", "data": json.dumps({"token": token})}
            
            suggestions = generate_follow_up_suggestions(request.mode, "")
            yield {
                "event": "done",
                "data": json.dumps({"suggestions": suggestions, "mode": request.mode}),
            }
        except Exception as e:
            yield {"event": "error", "data": json.dumps({"error": str(e)})}
    
    return EventSourceResponse(event_generator())


@app.post("/api/mentor/analyze", response_model=AnalyzeProjectResponse)
async def analyze_project(request: AnalyzeProjectRequest):
    """Analyze a Catrobat project XML and provide insights."""
    try:
        # Use the mentor to analyze the project
        mentor_request = MentorRequest(
            message=f"Analyze this Catrobat project and provide: 1) A brief summary, 2) List of sprites, 3) Complexity score (1-10), 4) Improvement suggestions, 5) Programming concepts used.\n\nProject XML:\n{request.project_xml[:5000]}",
            mode="translate",
        )
        reply = await get_mentor_response(mentor_request)
        
        return AnalyzeProjectResponse(
            summary=reply,
            sprites=[],
            complexity_score=None,
            suggestions=["Upload a full project to get detailed analysis"],
            concepts_used=[],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    from .config import HOST, PORT
    uvicorn.run(app, host=HOST, port=PORT)
