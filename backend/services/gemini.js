const { performance } = require('perf_hooks');
async function callGemini(messages) {
    const startTime = performance.now();
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        const API_KEY = process.env.GEMINI_API_KEY;
        
        // Detect if the user wants to generate an image
        const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
        const promptText = lastUserMessage ? lastUserMessage.content.toLowerCase() : "";
        const isImageRequest = promptText.includes("generate image") || 
                              promptText.includes("draw") || 
                              promptText.includes("create image") || 
                              promptText.includes("make an image") ||
                              promptText.includes("pic") ||
                              promptText.includes("picture") ||
                              promptText.includes("photo") ||
                              (promptText === "yes" && messages.some(m => m.role === 'assistant' && m.content.toLowerCase().includes("image")));

        // Switch model based on request type
        // Note: Switched to gemini-3.1-flash-image-preview as gemini-3-pro-image hit quota limits
        const modelName = isImageRequest ? "gemini-3.1-flash-image-preview" : "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

        if (isImageRequest) {
            console.log(`[Gemini] Redirecting image request to ${modelName}...`);
        }

        // Separate system messages from the conversation history
        const systemMessage = messages.find(m => m.role === 'system');
        const chatMessages = messages.filter(m => m.role !== 'system');

        const contents = chatMessages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        const payload = { contents };

        if (systemMessage) {
            payload.system_instruction = {
                parts: [{ text: systemMessage.content }]
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini/NanoBanana REST Error:", data);
            throw new Error(data.error?.message || `HTTP ${response.status}: ${JSON.stringify(data)}`);
        }

        if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
             throw new Error("Invalid response format from Gemini REST API");
        }

        let text = data.candidates[0].content.parts[0].text;
        
        // If it was an image request, we might want to wrap it in markdown if it returned a raw URL
        if (isImageRequest && text.startsWith("http")) {
            text = `![Generated Image](${text})`;
        }

        const time = Math.round(performance.now() - startTime);
        const tokens = Math.round(text.length / 4);
        return { text, time, tokens, status: "success" };
    } catch (error) {
        console.error("Gemini/NanoBanana Exception:", error.message);
        const time = Math.round(performance.now() - startTime);
        return { text: `Error: ${error.message}`, time, tokens: 0, status: "error" };
    }
}

module.exports = { callGemini };
