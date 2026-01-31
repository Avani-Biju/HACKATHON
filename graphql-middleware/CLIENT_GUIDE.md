# 📱 Member 3 Guide: Mobile App Simulator

## 🎯 Your Goal
You are simulating the **Mobile App**. Your job is to demonstrate "Over-fetching" (wasting data) and then help the middleware fix it.

## 🛠️ What You Need to Do

You have two main tasks:
1. **Send Queries**: Request oversized data (like a lazy developer).
2. **Report Usage**: Tell the middleware what you *actually* used.

---

## 🚀 Option 1: Using Postman (Manual)

### Task 1: The "Over-fetching" Query
Send this to the Middleware to simulate loading a User Profile.

- **Method**: `POST`
- **URL**: `http://10.10.22.206:5000/graphql`
- **Body** (JSON):
```json
{
  "query": "{ user { id name email phone posts { title content likes } } }"
}
```
> **Scenario**: "I asked for everything, but my app screen only shows the Name and Email!"

### Task 2: Report What You Used
After getting the data, tell the middleware you only used specific fields.

- **Method**: `POST`
- **URL**: `http://10.10.22.206:5000/report-usage` (Endpoint doesn't exist yet, will be added in Phase 2)
- **Body** (JSON):
```json
{
  "queryType": "user",
  "usedFields": ["name", "email"]
}
```
> **Message**: "Hey middleware, I only actually displayed the `name` and `email`. The rest was waste."

---

## 💻 Option 2: The "Smart Client" Script (Automated)

Instead of clicking buttons in Postman, run this simple script to simulate the app automatically.

### 1. Create `client-simulator.js`
```javascript
const fetch = require('node-fetch'); // You might need `npm install node-fetch`

const MIDDLEWARE_URL = 'http://10.10.22.206:5000';

async function runMobileAppSimulation() {
    console.log("📱 Mobile App: Starting...");

    // 1. Send the giant query (Over-fetching)
    console.log("📱 Mobile App: Requesting User Profile (asking for EVERYTHING)...");
    const query = `
        {
            user {
                id
                name
                email
                phone
                posts {
                    title
                    content
                    likes
                }
            }
        }
    `;

    const response = await fetch(`${MIDDLEWARE_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });

    const result = await response.json();
    console.log("📱 Mobile App: Got Data! Size:", JSON.stringify(result).length, "bytes");

    // 2. Simulate User Behavior (Only showing Name and Email)
    console.log("📱 Mobile App: Rendering screen... I only need 'name' and 'email'.");
    
    // 3. Report Usage
    console.log("📱 Mobile App: Reporting usage to middleware...");
    await fetch(`${MIDDLEWARE_URL}/report-usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            queryType: 'user',
            usedFields: ['name', 'email']
        })
    });
    
    console.log("📱 Mobile App: done! Middleware should learn from this.");
}

runMobileAppSimulation();
```

---

## 🤝 How It Fits Together (The Demo Flow)

1. **Round 1 (Unoptimized)**
   - You run the script.
   - It fetches huge data.
   - It reports usage ("I only needed name & email").

2. **Round 2 (Optimized)**
   - You run the script *again*.
   - Middleware remembers! It strips out `phone`, `posts`, etc.
   - You get the SAME result for your screen, but the data download is much smaller.
   - **SUCCESS!** 🎉
