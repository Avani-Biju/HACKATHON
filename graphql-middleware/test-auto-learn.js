const axios = require('axios');

const MIDDLEWARE_URL = 'http://localhost:5000/graphql';

async function testAutoLearning() {
    console.log("🤖 Testing Feature 1: Automatic Learning");
    console.log("-----------------------------------------");

    // 1. Teach the Middleware (5 requests with only name & email)
    console.log("📚 Phase 1: Teaching (Sending 5 clean requests)...");
    const goodQuery = `{ user { name email } }`;

    for (let i = 1; i <= 5; i++) {
        process.stdout.write(`   Request ${i}... `);
        try {
            await axios.post(MIDDLEWARE_URL, { query: goodQuery });
            console.log("Done.");
        } catch (e) {
            console.log("Error:", e.message);
        }
    }

    console.log("\n-----------------------------------------");

    // 2. Test Optimization (1 request asking for everything)
    console.log("⚡ Phase 2: Testing Optimization");
    console.log("   Sending 'Bad' Query: { user { name email phone posts { title } } }");
    console.log("   (Middleware should prune 'phone' and 'posts' because they are rare!)");

    const badQuery = `{ user { name email phone posts { title } } }`;

    const response = await fetch(MIDDLEWARE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: badQuery })
    });

    const result = await response.json();
    console.log("\n📦 Result Data Keys:", Object.keys(result.data.user));

    // Check if phone is missing
    if (!result.data.user.phone) {
        console.log("✅ SUCCESS! 'phone' was pruned!");
    } else {
        console.log("❌ FAIL. 'phone' is still there.");
    }

    console.log("-----------------------------------------");
    console.log("Check middleware logs to see '✨ OPTIMIZED!' message.");
}

testAutoLearning();
