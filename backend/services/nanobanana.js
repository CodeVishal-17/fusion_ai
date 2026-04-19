async function callNanoBanana(messages) {
    const startTime = performance.now();
    try {
        if (!process.env.GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        const API_KEY = process.env.GEMINI_API_KEY;
        // Using the nano-banana-pro-preview model identified from the models list
        const url = `https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${API_KEY}`;

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
            console.error("Nano Banana REST Error:", data);
            throw new Error(data.error?.message || `HTTP ${response.status}: ${JSON.stringify(data)}`);
        }

        if (!data.candidates || !data.candidates[0]?.content?.parts[0]?.text) {
             throw new Error("Invalid response format from Nano Banana REST API");
        }

        const text = data.candidates[0].content.parts[0].text;
        const time = Math.round(performance.now() - startTime);
        return { text, time };
    } catch (error) {
        console.error("Nano Banana REST Exception:", error.message);
        const time = Math.round(performance.now() - startTime);
        return { text: `Error: ${error.message}`, time };
    }
}

module.exports = { callNanoBanana };
