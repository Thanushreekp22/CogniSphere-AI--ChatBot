import "dotenv/config";

const API_KEY = process.env.GEMINI_API_KEY;

// Test 1: List available models
console.log('Testing Gemini API...\n');
console.log('API Key:', API_KEY.substring(0, 20) + '...\n');

async function listModels() {
    try {
        console.log('📋 Fetching available models...');
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        const data = await response.json();
        
        if (data.models) {
            console.log('\n✅ Available models that support generateContent:\n');
            data.models
                .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                .forEach(model => {
                    console.log(`- ${model.name}`);
                    if (model.displayName) console.log(`  Display: ${model.displayName}`);
                });
        } else {
            console.log('❌ Error:', data);
        }
    } catch (err) {
        console.error('❌ Error listing models:', err.message);
    }
}

async function testVision() {
    // Test with a simple model
    const testModels = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b', 
        'gemini-1.5-pro',
        'gemini-pro-vision'
    ];
    
    console.log('\n\n🧪 Testing models with simple request...\n');
    
    for (const modelName of testModels) {
        try {
            console.log(`Testing: ${modelName}`);
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: "Hello" }]
                        }]
                    })
                }
            );
            
            const data = await response.json();
            
            if (response.ok) {
                console.log(`  ✅ ${modelName} - WORKS!\n`);
            } else {
                console.log(`  ❌ ${modelName} - ${data.error?.message || 'Failed'}\n`);
            }
        } catch (err) {
            console.log(`  ❌ ${modelName} - ${err.message}\n`);
        }
    }
}

await listModels();
await testVision();
