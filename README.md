# Multi-AI Comparator

A full-stack MVP to compare responses and response times across 3 different AI provider limits: **OpenAI**, **Google Gemini**, and **Anthropic Claude**.

## Architecture & Tech Stack

**Frontend:** Next.js, Tailwind CSS (\`frontend/\`)
**Backend:** Node.js, Express (\`backend/\`)

## Setup Instructions

### 1. Prerequisites
Make sure you have Node installed (v18+ recommended). Have your API keys for OpenAI, Gemini, and Anthropic Claude ready.

### 2. Backend Setup
1. CD into the backend directory:
   \`\`\`bash
   cd backend
   \`\`\`
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Set up the Environment Variables:
   - Copy the example config:
     \`\`\`bash
     cp .env.example .env
     \`\`\`
   - Open \`.env\` and paste in your real API keys.
4. Run the server:
   \`\`\`bash
   npm start
   \`\`\`
   *(The backend runs on http://localhost:4000)*

### 3. Frontend Setup
1. CD into the frontend directory:
   \`\`\`bash
   cd ../frontend
   \`\`\`
2. Install dependencies (if not executed automatically during generation):
   \`\`\`bash
   npm install
   \`\`\`
3. Run the application:
   \`\`\`bash
   npm run dev
   \`\`\`
   *(The frontend runs on http://localhost:3000)*

## Usage
Simply type a prompt into the input and hit "Compare". The Express backend will concurrently fan out your request to all three services directly. If you don't enter valid API keys, the backend error handling will capture those and show them directly in the frontend cards.
