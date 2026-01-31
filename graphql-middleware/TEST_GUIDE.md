# Test Commands for GraphQL Middleware

## Quick Tests

### 1. Health Check (simplest test)
```bash
curl http://localhost:5000/health
```
**Expected output:**
```json
{"status":"ok","message":"GraphQL Middleware Proxy is running"}
```

---

### 2. Simple User Query
```bash
curl -X POST http://localhost:5000/graphql -H "Content-Type: application/json" -d "{\"query\":\"{ user { id name email } }\"}"
```

---

### 3. Nested Query (Users with Posts)
```bash
curl -X POST http://localhost:5000/graphql -H "Content-Type: application/json" -d "{\"query\":\"{ users { name posts { title likes } } }\"}"
```

---

## Using the Test Scripts

We have created specialized scripts to test the new features.

### 1. Automatic Learning (Feature 1)
Run this to see the middleware learn from clean requests and then prune a heavy one:
```bash
node test-auto-learn.js
```

### 2. Per-Screen Profiles (Feature 2)
Run this to see different optimizations for 'Home' vs 'Profile' screens:
```bash
node test-feature-2.js
```

---

## Legacy Tests
### Basic Connectivity Test
```bash
node test.js
```

---

## Using Postman or Bruno

1. **Method:** POST
2. **URL:** `http://localhost:5000/graphql`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "query": "{ user { id name email phone posts { title content likes } } }"
}
```

---

## Browser Console Test

Open your browser console (F12) and paste:

```javascript
fetch('http://localhost:5000/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `{
      user {
        id
        name
        email
      }
    }`
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

---

## ⚠️ Important Notes

**Before testing, make sure:**

1. ✅ Backend GraphQL server is running on port **4000**
2. ✅ Middleware server is running on port **5000** (already started!)

**If you get "Backend GraphQL server is not reachable" error:**
- The backend server on port 4000 is not running
- Start your teammate's backend server first
