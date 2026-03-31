"""Core AI Mentor logic - prompt construction and LLM interaction."""
import os
from typing import AsyncGenerator
from google import genai
from google.genai import types
from .config import GEMINI_API_KEY, MODEL_NAME, CATROBAT_SYSTEM_PROMPT
from .models import MentorRequest, MentorMode


# Initialize Gemini client
client = genai.Client(api_key=GEMINI_API_KEY)

# Mode-specific prompt augmentations
MODE_PROMPTS = {
    MentorMode.EXPLAIN: (
        "\n\nThe student wants you to EXPLAIN a programming concept. "
        "Break it down step by step, use analogies, and provide examples in Catrobat's visual block syntax. "
        "Adapt your explanation to the student's level."
    ),
    MentorMode.DEBUG: (
        "\n\nThe student needs help DEBUGGING. Analyze the provided code and error context carefully. "
        "Identify the root cause, explain WHY the bug occurs, and suggest a specific fix. "
        "Show the corrected code blocks."
    ),
    MentorMode.SUGGEST: (
        "\n\nThe student wants code SUGGESTIONS. Based on their description or existing code, "
        "propose clean, well-structured Catrobat code. Explain your design choices and "
        "suggest best practices for naming and organization."
    ),
    MentorMode.TRANSLATE: (
        "\n\nThe student wants you to TRANSLATE/EXPLAIN an existing project. "
        "Analyze the project structure, explain what each sprite and script does, "
        "and describe the overall program flow in simple terms."
    ),
    MentorMode.IDEA: (
        "\n\nThe student wants PROJECT IDEAS. Suggest creative, fun projects appropriate for their skill level. "
        "For each idea, outline the key sprites, scripts, and concepts they'd learn. "
        "Include a difficulty rating and estimated time."
    ),
    MentorMode.GENERAL: "",
}


def build_system_instruction(request: MentorRequest) -> str:
    """Construct the system instruction for Gemini."""
    system_prompt = CATROBAT_SYSTEM_PROMPT
    system_prompt += MODE_PROMPTS.get(request.mode, "")
    
    if request.student_level:
        level_map = {
            "beginner": "The student is a BEGINNER. Use simple language, avoid jargon, and provide lots of examples.",
            "intermediate": "The student has INTERMEDIATE skills. They understand basic concepts but need help with more complex patterns.",
            "advanced": "The student is ADVANCED. You can use technical terms and discuss design patterns, optimization, and architecture.",
        }
        system_prompt += f"\n\n{level_map.get(request.student_level, '')}"
        
    return system_prompt


def build_contents(request: MentorRequest) -> list[types.Content]:
    """Construct the conversation history and user content for Gemini."""
    contents = []
    
    # Add conversation history
    for msg in request.conversation_history:
        # Map roles if necessary (user -> user, assistant -> model)
        role = "model" if msg.role == "assistant" else "user"
        contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
    
    # Build the user message with context
    user_content = request.message
    
    if request.code_context:
        user_content += f"\n\n--- Code Context ---\n{request.code_context}"
    
    if request.output_context:
        user_content += f"\n\n--- Output/Errors ---\n{request.output_context}"
    
    if request.system_context:
        user_content += f"\n\n--- Additional Context ---\n{request.system_context}"
    
    contents.append(types.Content(role="user", parts=[types.Part.from_text(text=user_content)]))
    
    return contents


async def get_mentor_response(request: MentorRequest) -> str:
    """Get a complete response from the AI mentor."""
    system_instruction = build_system_instruction(request)
    contents = build_contents(request)
    
    # Configure Gemini
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
        max_output_tokens=2048,
    )
    
    response = await client.aio.models.generate_content(
        model=MODEL_NAME,
        contents=contents,
        config=config,
    )
    
    return response.text or "I'm sorry, I couldn't generate a response. Please try again."


async def stream_mentor_response(request: MentorRequest) -> AsyncGenerator[str, None]:
    """Stream the AI mentor response token by token."""
    system_instruction = build_system_instruction(request)
    contents = build_contents(request)
    
    config = types.GenerateContentConfig(
        system_instruction=system_instruction,
        temperature=0.7,
        max_output_tokens=2048,
    )
    
    stream = await client.aio.models.generate_content_stream(
        model=MODEL_NAME,
        contents=contents,
        config=config,
    )
    
    async for chunk in stream:
        if chunk.text:
            yield chunk.text


def generate_follow_up_suggestions(mode: MentorMode, response_text: str) -> list[str]:
    """Generate contextual follow-up suggestions based on the mode and response."""
    suggestions_map = {
        MentorMode.EXPLAIN: [
            "Can you show me an example?",
            "How does this relate to other concepts?",
            "Can you explain it in simpler terms?",
        ],
        MentorMode.DEBUG: [
            "Why did this bug happen?",
            "How can I prevent this in the future?",
            "Are there other issues in my code?",
        ],
        MentorMode.SUGGEST: [
            "Can you improve this code further?",
            "What about error handling?",
            "How would I add more features?",
        ],
        MentorMode.TRANSLATE: [
            "Can you explain this sprite's scripts?",
            "How could I modify this project?",
            "What concepts does this project use?",
        ],
        MentorMode.IDEA: [
            "Can you give me a step-by-step plan?",
            "What's a simpler version of this idea?",
            "How do I start building this?",
        ],
        MentorMode.GENERAL: [
            "Tell me more about this",
            "Can you give me an example?",
            "What should I learn next?",
        ],
    }
    return suggestions_map.get(mode, suggestions_map[MentorMode.GENERAL])
