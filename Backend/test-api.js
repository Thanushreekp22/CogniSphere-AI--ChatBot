// Quick test script for the chat API
const testChatAPI = async () => {
    console.log("🧪 Testing Chat API...\n");
    
    const testData = {
        threadId: "test-" + Date.now(),
        message: "Hello, can you hear me?",
        userId: "test@example.com",
        userEmail: "test@example.com"
    };
    
    console.log("📤 Sending request:", testData);
    
    try {
        const response = await fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(testData)
        });
        
        console.log("\n📊 Response status:", response.status);
        
        const data = await response.json();
        console.log("\n📦 Response data:", data);
        
        if (data.reply) {
            console.log("\n✅ SUCCESS! AI replied:", data.reply);
        } else if (data.error) {
            console.log("\n❌ ERROR:", data.error);
        }
    } catch (error) {
        console.error("\n❌ Request failed:", error.message);
    }
};

testChatAPI();
