const { performance } = require('perf_hooks');

const MODEL_STYLES = {
    openai:   'photorealistic, ultra detailed, professional photography, 8K HDR, sharp focus',
    deepseek: 'digital art, futuristic cyberpunk, neon glow, dark aesthetic, highly detailed',
    meta:     'cinematic, dramatic IMAX lighting, epic composition, movie still, shallow depth of field',
    gemini:   'oil painting, impressionist, vibrant brushstrokes, museum quality, warm rich colors',
};

async function generateImagePollinations(prompt, modelKey) {
    const startTime = performance.now();
    try {
        const style = MODEL_STYLES[modelKey] || MODEL_STYLES.openai;
        const fullPrompt = `${prompt}, ${style}`;
        const seed = Math.floor(Math.random() * 999999);
        const encodedPrompt = encodeURIComponent(fullPrompt);
        // Return URL immediately — browser loads on demand (Pollinations caches on first GET)
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&seed=${seed}&width=1024&height=1024&nologo=true&enhance=true`;
        
        const time = Math.round(performance.now() - startTime);
        return {
            text: `![${prompt}](${imageUrl})`,
            imageUrl,
            time,
            tokens: 80,
            status: "success",
            isImage: true
        };
    } catch (error) {
        console.error(`Pollinations Error (${modelKey}):`, error.message);
        const time = Math.round(performance.now() - startTime);
        return { text: `Image generation failed: ${error.message}`, time, tokens: 0, status: "error" };
    }
}

module.exports = { generateImagePollinations };
