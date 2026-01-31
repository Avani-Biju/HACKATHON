# 🌐 Network Configuration Summary

## ✅ Configuration Complete!

Your middleware is now configured to work across the WiFi network!

---

## 📍 IP Addresses

| Device | IP Address | Port | Role |
|--------|------------|------|------|
| **Teammate's Computer** | `10.10.23.38` | 4000 | Backend GraphQL Server |
| **Your Computer** | `10.10.22.206` | 5000 | Middleware Proxy |
| **Mobile App** | Any device on WiFi | - | Client |

---

## 🔗 Connection Flow

```
[Mobile App]
    ↓
http://10.10.22.206:5000/graphql  ← Your Middleware
    ↓
http://10.10.23.38:4000/graphql   ← Teammate's Backend
```

---

## 📱 URLs for Mobile App

The mobile app should use:
```
http://10.10.22.206:5000/graphql
```

---

## 🧪 Testing the Connection

### 1. Ask your teammate to start her backend server
She should run on her computer:
```bash
npm start
```
And confirm it's running on port 4000

### 2. Your middleware is already running!
It's now listening on:
- **Local**: `http://localhost:5000/graphql`
- **Network**: `http://10.10.22.206:5000/graphql`

### 3. Test from your browser
Open: `http://10.10.22.206:5000/health`

You should see:
```json
{"status":"ok","message":"GraphQL Middleware Proxy is running"}
```

### 4. Test a GraphQL query
Use PowerShell or any HTTP client:

```powershell
Invoke-WebRequest -Uri "http://10.10.22.206:5000/graphql" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"{ user { id name email } }"}'
```

Or using curl (if installed):
```bash
curl -X POST http://10.10.22.206:5000/graphql \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"{ user { id name email } }\"}"
```

---

## 🔥 Quick Test Commands

### Health Check
```
http://10.10.22.206:5000/health
```

### From Another Computer on WiFi
Anyone on the same WiFi network can access:
```
http://10.10.22.206:5000/graphql
```

---

## ⚠️ Important Notes

1. **Both computers must be on the same WiFi network**
2. **Windows Firewall**: You may need to allow Node.js through the firewall
   - If you get connection errors, temporarily disable firewall or add an exception for port 5000
3. **Backend must be running first**: Your teammate's backend on port 4000 must be running before testing

---

## 🎯 For Your Hackathon Demo

When presenting:
1. Show the backend running on one laptop
2. Show the middleware running on your laptop
3. Connect mobile app to `http://10.10.22.206:5000/graphql`
4. Demonstrate the query optimization and bandwidth savings!

---

## 🚀 Next Steps

1. ✅ Middleware configured for network access
2. ⏳ Wait for teammate to start backend server
3. 🧪 Test the connection
4. 📱 Connect mobile app
5. 🎨 Add optimization features (field tracking, query pruning)
