# GraphQL Middleware Proxy

A lightweight Node.js middleware that sits between GraphQL clients and the backend GraphQL server. This middleware acts as a transparent proxy, forwarding all queries unchanged while logging request/response information.

## 🎯 Purpose

This middleware is the **first step** in building an intelligent GraphQL query optimizer. Currently, it:
- ✅ Forwards all GraphQL queries to the backend server
- ✅ Maintains backward compatibility (no breaking changes)
- ✅ Logs query patterns and response metrics
- ✅ Adds minimal latency (<50ms)

**Future optimization features** will be added to reduce over-fetching and improve bandwidth efficiency.

---

## 🏗️ Architecture

```
[Mobile App Client] 
       ↓
  POST /graphql
       ↓
[Middleware Proxy - Port 5000]
       ↓
  Forwards query unchanged
       ↓
[Backend GraphQL Server - Port 4000]
       ↓
  Returns full response
       ↓
[Middleware Proxy]
       ↓
  Logs metrics & returns data
       ↓
[Mobile App Client]
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v14 or higher)
- npm
- Backend GraphQL server running on port 4000

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Middleware
```bash
npm start
```

Or using Node directly:
```bash
node index.js
```

### 3. Verify It's Running
You should see:
```
============================================================
🚀 GraphQL Middleware Proxy Server Started
============================================================
📍 Middleware URL: http://localhost:5000/graphql
🔗 Backend URL: http://localhost:4000/graphql
💚 Health Check: http://localhost:5000/health
============================================================

⏳ Waiting for GraphQL queries...
```

---

## 📡 Endpoints

### `POST /graphql`
Main GraphQL proxy endpoint.

**Request Format:**
```json
{
  "query": "{ user { id name email } }",
  "variables": {}
}
```

**Response:**
Returns the exact response from the backend GraphQL server.

### `GET /health`
Health check endpoint to verify the middleware is running.

**Response:**
```json
{
  "status": "ok",
  "message": "GraphQL Middleware Proxy is running"
}
```

---

## 🧪 Testing

### Using curl

#### Get User Data
```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"{ user { id name email } }\"}"
```

#### Get Users with Posts (Nested Query)
```bash
curl -X POST http://localhost:5000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"{ users { id name posts { title } } }\"}"
```

#### Health Check
```bash
curl http://localhost:5000/health
```

### Using Postman

1. **Create a new POST request** to `http://localhost:5000/graphql`
2. **Set Headers:**
   - `Content-Type: application/json`
3. **Set Body (raw JSON):**
   ```json
   {
     "query": "{ user { id name email phone posts { title content likes } } }"
   }
   ```
4. **Send** and verify the response

### Using JavaScript/Fetch

```javascript
fetch('http://localhost:5000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
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
  .then(data => console.log(data));
```

---

## 📊 Console Logging

The middleware logs detailed information about each request:

### Incoming Query Log
```
--- Incoming GraphQL Query ---
Query: { user { id name email } }
------------------------------
```

### Response Metrics Log
```
--- Response from Backend ---
Latency: 23ms
Response size: 142 bytes
-----------------------------
```

This logging helps track:
- Which fields are being requested
- Response times
- Payload sizes
- Access patterns (for future optimization)

---

## 🔧 Configuration

### Change Ports

Edit `index.js`:
```javascript
const PORT = 5000; // Middleware port
const GRAPHQL_BACKEND_URL = 'http://localhost:4000/graphql'; // Backend URL
```

### Disable CORS

If you don't need cross-origin support, comment out:
```javascript
// app.use(cors());
```

---

## 🛡️ Error Handling

The middleware handles three types of errors:

1. **Backend Server Errors** (4xx/5xx from GraphQL server)
   - Returns the error response from backend
   
2. **Backend Unreachable** (connection refused)
   - Returns 503 with message: "Backend GraphQL server is not reachable"
   
3. **Middleware Internal Errors**
   - Returns 500 with error details

---

## 📈 Next Steps (Future Optimization)

This middleware will be enhanced with:
- [ ] Field usage tracking (which fields are actually rendered)
- [ ] Query optimization (pruning unused fields)
- [ ] Redis caching for access patterns
- [ ] Response size reduction metrics
- [ ] Smart query rewriting

---

## 🌐 Deployment Ready (Member 2)

The middleware is configured for easy deployment on **Render.com**.

### 🛠️ Configuration
Use these **Environment Variables** in the Render Dashboard:
*   `PORT`: The port Render provides (default: 5000).
*   `GRAPHQL_BACKEND_URL`: The URL of your teammate's deployed backend (e.g., `https://backend.onrender.com/graphql`).

### 🚀 To Deploy
1. Push this code to GitHub.
2. Create a new **Web Service** on Render.
3. Use Build Command: `npm install`
4. Use Start Command: `npm start`

---

## 🤝 Usage with Backend Server

### Step 1: Start Backend Server (Port 4000)
```bash
cd ../backend-server  # Your teammate's server
npm install
npm start
```

### Step 2: Start Middleware (Port 5000)
```bash
cd ../graphql-middleware
npm install
npm start
```

### Step 3: Point Your Client to Middleware
Update your mobile app or client to use:
```
http://localhost:5000/graphql  # Instead of http://localhost:4000/graphql
```

---

## 📝 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `axios` | HTTP client for backend requests |
| `cors` | Enable cross-origin requests |
| `body-parser` | Parse JSON request bodies |

---

## 📄 License

MIT
