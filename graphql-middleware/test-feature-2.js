const axios = require('axios');

const MIDDLEWARE_URL = 'http://localhost:5000/graphql';

async function testPerScreenProfiles() {
    console.log("📱 Testing Feature 2: Per-Screen Profiles");
    console.log("-----------------------------------------");

    // Scenario:
    // Screen A: "HOME_SCREEN" -> Only needs User Name
    // Screen B: "PROFILE_SCREEN" -> Needs User Name + Email + Phone

    // 1. Train HOME SCREEN
    console.log("\n🏠 Training 'HOME_SCREEN' (Needs only name)...");
    const homeQuery = `{ user { name } }`;
    for (let i = 0; i < 3; i++) {
        process.stdout.write('.');
        await axios.post(MIDDLEWARE_URL, { query: homeQuery }, { headers: { 'x-screen-name': 'HOME_SCREEN' } });
    }
    console.log(" Done.");

    // 2. Train PROFILE SCREEN
    console.log("\n👤 Training 'PROFILE_SCREEN' (Needs name, email, phone)...");
    const profileQuery = `{ user { name email phone } }`;
    for (let i = 0; i < 3; i++) {
        process.stdout.write('.');
        await axios.post(MIDDLEWARE_URL, { query: profileQuery }, { headers: { 'x-screen-name': 'PROFILE_SCREEN' } });
    }
    console.log(" Done.");

    console.log("\n-----------------------------------------");
    console.log("⚡ Testing Optimization (Sending HEAVY Query for both)");
    const heavyQuery = `{ user { name email phone posts { title } } }`;

    // 3. Test HOME Optimization
    console.log("\n1️⃣  Sending Heavy Query as 'HOME_SCREEN'...");
    const homeRes = await axios.post(MIDDLEWARE_URL, { query: heavyQuery }, { headers: { 'x-screen-name': 'HOME_SCREEN' } });
    const homeData = homeRes.data.data.user;
    console.log("   Result Fields:", Object.keys(homeData));

    if (!homeData.email && !homeData.phone && homeData.name) {
        console.log("   ✅ SUCCESS! Home screen pruned email/phone!");
    } else {
        console.log("   ❌ FAIL! Did not optimize correctly for Home.");
    }

    // 4. Test PROFILE Optimization
    console.log("\n2️⃣  Sending Heavy Query as 'PROFILE_SCREEN'...");
    const profileRes = await axios.post(MIDDLEWARE_URL, { query: heavyQuery }, { headers: { 'x-screen-name': 'PROFILE_SCREEN' } });
    const profileData = profileRes.data.data.user;
    console.log("   Result Fields:", Object.keys(profileData));

    if (profileData.email && profileData.phone && !profileData.posts) {
        console.log("   ✅ SUCCESS! Profile screen kept email/phone but pruned posts!");
    } else {
        console.log("   ❌ FAIL! Did not optimize correctly for Profile.");
    }
}

testPerScreenProfiles();
