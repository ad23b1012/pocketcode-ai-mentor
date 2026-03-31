/**
 * PocketCode AI Mentor — Frontend Application Logic
 * 
 * This handles the interactive demo chat with simulated AI responses.
 * In production, it would connect to the FastAPI backend via SSE streaming.
 */

// ============================================================
// Configuration
// ============================================================
const BACKEND_URL = 'http://localhost:8000';
const USE_BACKEND = false; // Set to true when backend is running

// ============================================================
// State
// ============================================================
let currentMode = 'general';
let conversationHistory = [];
let isStreaming = false;

// ============================================================
// DOM References
// ============================================================
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const clearBtn = document.getElementById('clear-chat');
const chatStatus = document.getElementById('chat-status');
const chatSuggestions = document.getElementById('chat-suggestions');
const codeContext = document.getElementById('code-context');
const errorContext = document.getElementById('error-context');
const promptChips = document.getElementById('prompt-chips');
const modeButtons = document.querySelectorAll('.mode-btn');

// ============================================================
// Simulated AI Responses (for demo without backend)
// ============================================================
const SIMULATED_RESPONSES = {
    general: {
        default: `Great question! In PocketCode, you can create amazing interactive projects using visual programming blocks. 

Here's a quick overview of the main block categories:

**🎭 Looks** — Change costumes, show/hide sprites, add speech bubbles
**🔊 Sound** — Play sounds, adjust volume
**🏃 Motion** — Move sprites, rotate, glide to positions
**🔄 Control** — Loops (forever, repeat), conditions (if/else), waits
**📡 Events** — Triggers like "when tapped" or "when I receive"
**📊 Data** — Variables and lists for storing information

Would you like me to dive deeper into any of these?`,
        variables: `# Variables in PocketCode 📊

A **variable** is like a labeled box that stores a value — a number, text, or anything else.

## Types of Variables:
1. **Local variables** — belong to a single sprite
2. **Global variables** — shared across all sprites

## How to Create One:
\`\`\`
Data → Create a Variable → "score"
\`\`\`

## Common Uses:
- **Score counter**: Set \`score\` to 0, then \`change score by 1\` when goals are met
- **Lives**: Start with \`lives = 3\`, subtract on collision
- **Player name**: Store text input from the user

## Example Script:
\`\`\`
When green flag clicked
  Set [score] to [0]
  Forever
    If <touching [Star]?>
      Change [score] by [1]
      Play sound [collect]
    End
  End
\`\`\`

💡 **Tip**: Use meaningful names like \`playerSpeed\` instead of \`var1\`!`,
    },
    explain: {
        default: `# Understanding Loops in Catrobat 🔄

Loops let you repeat actions without writing the same blocks over and over.

## Types of Loops:

### 1. Forever Loop
Runs continuously until the program stops.
\`\`\`
Forever
  Move [10] steps
  If on edge, bounce
End
\`\`\`

### 2. Repeat Loop
Runs a specific number of times.
\`\`\`
Repeat [10]
  Turn right [36] degrees
  Move [20] steps
End
\`\`\`
This draws a polygon! (360° ÷ 10 = 36° per turn)

### 3. Repeat Until Loop
Runs until a condition becomes true.
\`\`\`
Repeat until <touching [edge]?>
  Move [5] steps
End
\`\`\`

## 🧠 Think of it like:
- **Forever** = "Keep doing this endlessly" (like breathing)
- **Repeat N** = "Do this exactly N times" (like clapping 5 times)
- **Repeat until** = "Keep going until something happens" (like walking until you reach a wall)

Want me to explain nested loops or loop patterns?`,
    },
    debug: {
        default: `# 🐛 Let me help debug your code!

To give you the best help, I need some context. You can:

1. **Paste your script** in the "Code Context" panel on the left
2. **Include any errors** in the "Error Output" panel
3. **Describe the problem** — what should happen vs. what actually happens

## Common PocketCode Bugs:

### Sprite Not Moving?
- Check if the script has a **"When green flag clicked"** event
- Make sure there's no **"hide"** block before the motion blocks
- Verify the sprite isn't at the edge of the stage

### Variables Not Updating?
- Ensure you're using **"change"** not **"set"** for increments
- Check variable scope (local vs. global)
- Look for race conditions with multiple sprites

### Sound Not Playing?
- Confirm the sound file is imported
- Check if another sound is already playing
- Verify volume isn't set to 0

Paste your code and I'll analyze it! 🔍`,
    },
    suggest: {
        default: `# 💡 Code Suggestion: Bouncing Ball Animation

Here's a clean, well-structured script for a sprite that bounces around the screen:

\`\`\`
When green flag clicked
  Set [speedX] to [5]
  Set [speedY] to [3]
  Go to x: [0] y: [0]
  
  Forever
    Change x by [speedX]
    Change y by [speedY]
    
    If <(x position) > [230]> or <(x position) < [-230]>
      Set [speedX] to [speedX * -1]
      Play sound [bounce]
    End
    
    If <(y position) > [170]> or <(y position) < [-170]>
      Set [speedY] to [speedY * -1]
      Play sound [bounce]
    End
  End
\`\`\`

## Design Decisions:
- **Variables for speed** make it easy to adjust behavior
- **Separate X and Y speed** allows diagonal movement
- **Sound feedback** makes the animation feel alive

## Improvements you could add:
1. Add gravity: \`Change [speedY] by [-0.5]\`
2. Add friction: \`Set [speedX] to [speedX * 0.99]\`
3. Add color trail using Pen blocks

Want me to extend this code?`,
    },
    translate: {
        default: `# 🌐 I can translate and explain any PocketCode project!

To get started, you can:

1. **Paste the project XML** in the Code Context panel
2. **Describe the project** you downloaded
3. **Tell me the project name** from the community

## What I'll explain:
- 📋 **Project structure** — all sprites, scenes, and assets
- 🧩 **Script logic** — what each script does, step by step
- 🎯 **Key algorithms** — the clever tricks used
- 🔗 **Sprite interactions** — how sprites communicate
- 💡 **Learning opportunities** — concepts you can learn from it

## Example Analysis:
> "This is a **Pong game** with 2 sprites:
> - **Ball** → moves diagonally, bounces off walls
> - **Paddle** → follows finger/mouse position
> 
> The game uses **variables** for score tracking and **broadcast messages** for game over state."

Which project would you like me to explain?`,
    },
    idea: {
        default: `# ⚡ Project Ideas for You!

Here are some project ideas sorted by difficulty:

---

## 🟢 Beginner (1-2 hours)
### 1. "Catch the Stars" Game
- **Sprites**: Player, Stars, Background
- **Concepts**: Motion, Random positions, Variables (score)  
- **Learn**: Basic movement, collision detection, scoring

### 2. Interactive Greeting Card
- **Sprites**: Characters, Text, Decorations
- **Concepts**: Looks (say blocks), Sound, Animations
- **Learn**: Sequencing, timing, multimedia

---

## 🟡 Intermediate (3-5 hours)
### 3. "Flappy Bird" Clone
- **Sprites**: Bird, Pipes, Ground, Score Display
- **Concepts**: Gravity simulation, Cloning, Game states
- **Learn**: Physics, game loops, difficulty scaling

### 4. Quiz App
- **Sprites**: Questions panel, Buttons, Score tracker
- **Concepts**: Lists, Variables, Broadcasting
- **Learn**: Data structures, user input, state management

---

## 🔴 Advanced (8+ hours)
### 5. Multiplayer Tic-Tac-Toe
- **Sprites**: Grid, X/O markers, Game logic handler
- **Concepts**: 2D arrays, Win detection, AI opponent
- **Learn**: Algorithms, game theory, clean architecture

---

Which idea excites you? I can create a step-by-step plan! 🚀`,
    },
};

function getSimulatedResponse(mode, message) {
    const modeResponses = SIMULATED_RESPONSES[mode] || SIMULATED_RESPONSES.general;
    
    // Check for keyword matches
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes('variable')) return modeResponses.variables || modeResponses.default;
    
    return modeResponses.default;
}

// ============================================================
// Chat Functions
// ============================================================
function addMessage(content, isUser = false) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'message-user' : 'message-ai'}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? '👤' : '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMarkdown(content);
    
    div.appendChild(avatar);
    div.appendChild(contentDiv);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return contentDiv;
}

function addTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message message-ai';
    div.id = 'typing-indicator';
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
        <div class="typing-indicator">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    div.appendChild(avatar);
    div.appendChild(contentDiv);
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function formatMarkdown(text) {
    // Simple markdown formatting
    let html = text
        // Code blocks
        .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.+)$/gm, '<h4>$1</h4>')
        .replace(/^## (.+)$/gm, '<h3>$1</h3>')
        .replace(/^# (.+)$/gm, '<h2>$1</h2>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr>')
        // Unordered lists
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        // Blockquotes
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        // Line breaks → paragraphs
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Wrap loose <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
        if (!match.startsWith('<ul>')) return '<ul>' + match + '</ul>';
        return match;
    });
    
    return html;
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || isStreaming) return;
    
    // Add user message
    addMessage(message, true);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Update state
    isStreaming = true;
    sendBtn.disabled = true;
    chatStatus.textContent = 'Thinking...';
    chatStatus.style.color = 'var(--accent-yellow)';
    chatSuggestions.style.display = 'none';
    
    // Add to history
    conversationHistory.push({ role: 'user', content: message });
    
    if (USE_BACKEND) {
        await streamFromBackend(message);
    } else {
        await simulateResponse(message);
    }
}

async function simulateResponse(message) {
    addTypingIndicator();
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));
    
    removeTypingIndicator();
    
    const response = getSimulatedResponse(currentMode, message);
    
    // Simulate streaming
    const contentDiv = addMessage('', false);
    let currentText = '';
    
    chatStatus.textContent = 'Responding...';
    chatStatus.style.color = 'var(--accent-blue)';
    
    for (let i = 0; i < response.length; i++) {
        currentText += response[i];
        contentDiv.innerHTML = formatMarkdown(currentText);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Variable speed for realistic feeling
        const delay = response[i] === '\n' ? 30 : (response[i] === ' ' ? 15 : 8);
        await new Promise(r => setTimeout(r, delay));
    }
    
    // Done
    conversationHistory.push({ role: 'assistant', content: response });
    finishResponse();
}

async function streamFromBackend(message) {
    addTypingIndicator();
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/mentor/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: message,
                mode: currentMode,
                code_context: codeContext.value || null,
                output_context: errorContext.value || null,
                conversation_history: conversationHistory.slice(-10),
            }),
        });
        
        removeTypingIndicator();
        
        const contentDiv = addMessage('', false);
        let fullText = '';
        
        chatStatus.textContent = 'Responding...';
        chatStatus.style.color = 'var(--accent-blue)';
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        if (data.token) {
                            fullText += data.token;
                            contentDiv.innerHTML = formatMarkdown(fullText);
                            chatMessages.scrollTop = chatMessages.scrollHeight;
                        }
                        if (data.suggestions) {
                            showSuggestions(data.suggestions);
                        }
                    } catch (e) {}
                }
            }
        }
        
        conversationHistory.push({ role: 'assistant', content: fullText });
        finishResponse();
    } catch (error) {
        removeTypingIndicator();
        addMessage(`⚠️ Could not connect to the backend. Make sure the server is running at \`${BACKEND_URL}\`\n\nError: ${error.message}`, false);
        finishResponse();
    }
}

function finishResponse() {
    isStreaming = false;
    sendBtn.disabled = false;
    chatStatus.textContent = 'Ready';
    chatStatus.style.color = 'var(--accent-green)';
    
    // Show default suggestions
    const suggestions = getSuggestions(currentMode);
    showSuggestions(suggestions);
}

function getSuggestions(mode) {
    const map = {
        general: ['What are variables?', 'How do events work?', 'Show me a cool trick'],
        explain: ['Explain broadcasting', 'What are clones?', 'How does the Pen work?'],
        debug: ['My sprite won\'t move', 'Variable isn\'t updating', 'Sound not playing'],
        suggest: ['Make a jumping mechanic', 'Create a timer', 'Add particle effects'],
        translate: ['What does this project do?', 'Explain the main sprites', 'What can I learn from this?'],
        idea: ['Beginner game ideas', 'Art project ideas', 'Music project ideas'],
    };
    return map[mode] || map.general;
}

function showSuggestions(suggestions) {
    chatSuggestions.innerHTML = '';
    chatSuggestions.style.display = 'flex';
    
    suggestions.forEach(text => {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = text;
        btn.addEventListener('click', () => {
            chatInput.value = text;
            sendMessage();
        });
        chatSuggestions.appendChild(btn);
    });
}

// ============================================================
// Event Listeners
// ============================================================

// Send message
sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});

// Clear chat
clearBtn.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    conversationHistory = [];
    chatSuggestions.style.display = 'none';
    
    // Add welcome message back
    addMessage(`Hey there! 👋 I'm your **PocketCode AI Mentor**.

I can help you with:
- 📖 **Explaining** programming concepts
- 🐛 **Debugging** your Catrobat scripts
- 💡 **Suggesting** code improvements
- 🌐 **Translating** community projects
- ⚡ **Generating** project ideas

Select a mode and ask me anything!`, false);
});

// Mode selection
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        
        // Update quick prompts based on mode
        updateQuickPrompts(currentMode);
    });
});

// Quick prompts
promptChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (chip) {
        chatInput.value = chip.dataset.prompt;
        sendMessage();
    }
});

// Feature cards → set mode
document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('click', () => {
        const mode = card.dataset.mode;
        if (mode) {
            currentMode = mode;
            modeButtons.forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-mode="${mode}"]`)?.classList.add('active');
            
            // Scroll to demo
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

function updateQuickPrompts(mode) {
    const prompts = {
        general: [
            { label: 'Variables', prompt: 'What are variables in PocketCode?' },
            { label: 'Loops', prompt: 'Explain how loops work in Catrobat' },
            { label: 'Movement', prompt: 'How do I make a sprite move?' },
            { label: 'Events', prompt: 'What are broadcast messages?' },
            { label: 'Cloning', prompt: 'How to add clones in PocketCode?' },
            { label: 'Game Ideas', prompt: 'Suggest a beginner game project idea' },
        ],
        explain: [
            { label: 'Variables', prompt: 'Explain variables with examples' },
            { label: 'Conditionals', prompt: 'How do if/else blocks work?' },
            { label: 'Broadcasting', prompt: 'Explain broadcast messages' },
            { label: 'Cloning', prompt: 'How does cloning work?' },
            { label: 'Lists', prompt: 'What are lists and how to use them?' },
            { label: 'User Bricks', prompt: 'What are User Bricks?' },
        ],
        debug: [
            { label: 'Not Moving', prompt: 'My sprite is not moving when I tap start' },
            { label: 'Wrong Score', prompt: 'My score variable is not counting correctly' },
            { label: 'Collision', prompt: 'Collision detection is not working' },
            { label: 'No Sound', prompt: 'The sound is not playing in my project' },
            { label: 'Clone Bug', prompt: 'My clones are not appearing' },
            { label: 'Performance', prompt: 'My project is running very slowly' },
        ],
        suggest: [
            { label: 'Jump', prompt: 'Suggest code for a jump mechanic' },
            { label: 'Timer', prompt: 'How to create a countdown timer?' },
            { label: 'Animation', prompt: 'Smooth sprite animation code' },
            { label: 'Parallax', prompt: 'Create a parallax scrolling background' },
            { label: 'Save Data', prompt: 'How to save game progress?' },
            { label: 'Menu', prompt: 'Create a start menu screen' },
        ],
        translate: [
            { label: 'Overview', prompt: 'Give me an overview of this project' },
            { label: 'Sprites', prompt: 'What does each sprite do?' },
            { label: 'Logic', prompt: 'Explain the main game logic' },
            { label: 'Concepts', prompt: 'What concepts does this project teach?' },
            { label: 'Modify', prompt: 'How could I modify this project?' },
            { label: 'Structure', prompt: 'Explain the project architecture' },
        ],
        idea: [
            { label: 'Easy Game', prompt: 'Suggest a simple game for beginners' },
            { label: 'Art', prompt: 'Creative art project idea' },
            { label: 'Music', prompt: 'Interactive music project idea' },
            { label: 'Story', prompt: 'Interactive story project idea' },
            { label: 'Advanced', prompt: 'Challenge project for advanced students' },
            { label: 'Educational', prompt: 'Educational app project idea' },
        ],
    };
    
    const modePrompts = prompts[mode] || prompts.general;
    promptChips.innerHTML = '';
    
    modePrompts.forEach(p => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.dataset.prompt = p.prompt;
        chip.textContent = p.label;
        promptChips.appendChild(chip);
    });
}

// ============================================================
// Smooth scroll for nav links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ============================================================
// Intersection Observer for animations
// ============================================================
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .tech-card, .arch-layer').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

console.log('🚀 PocketCode AI Mentor Demo loaded');
