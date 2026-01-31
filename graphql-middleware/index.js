const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const { parse, print, visit } = require('graphql');
const fs = require('fs');
const PATTERNS_FILE = './learned_patterns.json';

// --- CRASH PREVENTION ---
process.on('uncaughtException', (err) => {
    console.error('💥 CRASH PREVENTED: Uncaught Exception:', err.message);
    console.error(err.stack);
    // Keep the process alive!
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 CRASH PREVENTED: Unhandled Rejection at:', promise, 'reason:', reason);
});
// ------------------------

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const GRAPHQL_BACKEND_URL = process.env.GRAPHQL_BACKEND_URL || 'http://localhost:4000/graphql';

// Feature 1 + 2: Automatic Learning & Per-Screen Profiles
// Globals: Store patterns per SCREEN and per QUERY type
// Structure: { "home_screen": { "user": { "name": 5 } }, "profile_screen": { "user": { "name": 5, "phone": 5 } } }
let screenPatterns = {};
let screenRequestCounts = {};

// --- PERSISTENCE: LOAD ON STARTUP ---
if (fs.existsSync(PATTERNS_FILE)) {
    try {
        const data = fs.readFileSync(PATTERNS_FILE, 'utf8');
        const persisted = JSON.parse(data);
        screenPatterns = persisted.screenPatterns || {};
        screenRequestCounts = persisted.screenRequestCounts || {};
        console.log('📂 Brain Reloaded: Learned patterns restored from file!');
    } catch (e) {
        console.log('⚠️ Brain Corrupted: Starting fresh.');
    }
} else {
    console.log('🧠 Brain Empty: Starting fresh learning session.');
}

// --- PERSISTENCE: SAVE FUNCTION ---
function savePatterns() {
    try {
        const data = JSON.stringify({ screenPatterns, screenRequestCounts }, null, 2);
        fs.writeFileSync(PATTERNS_FILE, data);
    } catch (e) {
        console.error('Error saving brain:', e.message);
    }
}
// ------------------------------------

// Helper: Extract all field paths from response object
function extractAllFields(obj, prefix = '') {
    let fields = [];
    for (let key in obj) {
        // Skip null lists or values
        if (obj[key] === null || obj[key] === undefined) continue;

        const path = prefix ? `${prefix}.${key}` : key;
        fields.push(path);

        if (Array.isArray(obj[key])) {
            // For arrays, check the first item to learn structure (simplified)
            if (obj[key].length > 0 && typeof obj[key][0] === 'object') {
                fields = fields.concat(extractAllFields(obj[key][0], path));
            }
        } else if (typeof obj[key] === 'object') {
            fields = fields.concat(extractAllFields(obj[key], path));
        }
    }
    return fields;
}

// Helper: Track usage from response PER SCREEN
function trackFieldUsage(screenName, queryType, responseData) {
    if (!responseData) return;

    // Initialize storage for this screen if missing
    if (!screenPatterns[screenName]) {
        screenPatterns[screenName] = {};
        screenRequestCounts[screenName] = {};
    }

    // Assume responseData has "data" property usually, or it's the root data
    const dataRoot = responseData.data || responseData;

    // We only track fields under the queryType (e.g. "user")
    const rootFieldData = dataRoot[queryType];

    if (!rootFieldData) return; // Query type might verify, e.g. "users" vs "user"

    const fields = extractAllFields(rootFieldData, queryType); // Prefix with queryType

    // Initialize storage for this query type if missing
    if (!screenPatterns[screenName][queryType]) {
        screenPatterns[screenName][queryType] = {};
        screenRequestCounts[screenName][queryType] = 0;
    }

    screenRequestCounts[screenName][queryType]++;

    fields.forEach(field => {
        screenPatterns[screenName][queryType][field] = (screenPatterns[screenName][queryType][field] || 0) + 1;
    });

    console.log(`🧠 Learned: [Screen: ${screenName}] Request #${screenRequestCounts[screenName][queryType]} for '${queryType}'`);

    // Save to disk after learning!
    savePatterns();
}

// Helper: Decide which fields to keep PER SCREEN
function getOptimizedFields(screenName, queryType) {
    // Check if we have data for this screen
    if (!screenRequestCounts[screenName] || !screenRequestCounts[screenName][queryType]) {
        return null; // No data for this screen yet
    }

    // Wait for at least 3 requests before optimizing (Lower threshold for demo)
    if (screenRequestCounts[screenName][queryType] < 3) {
        return null;
    }

    const patterns = screenPatterns[screenName][queryType];
    const total = screenRequestCounts[screenName][queryType];

    // Keep fields used in > 80% of requests
    const allowed = Object.keys(patterns).filter(field =>
        (patterns[field] / total) > 0.8
    );

    return allowed;
}

// Helper: Detect main query type (simplistic: first field name)
function detectQueryType(query) {
    try {
        const ast = parse(query);
        const firstDef = ast.definitions[0];
        if (firstDef.kind === 'OperationDefinition' && firstDef.operation === 'query') {
            if (firstDef.selectionSet && firstDef.selectionSet.selections.length > 0) {
                const firstSelection = firstDef.selectionSet.selections[0];
                if (firstSelection.kind === 'Field') {
                    return firstSelection.name.value;
                }
            }
        }
    } catch (e) {
        console.error("Error detecting query type:", e.message);
    }
    return null;
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'GraphQL Middleware Proxy is running' });
});

// Updated optimizeQuery to accept specific allowed fields list
const optimizeQuery = (originalQuery, allowedFields) => {
    try {
        // If no specific fields provided, or empty, return original
        if (!allowedFields || allowedFields.length === 0) return originalQuery;

        const ast = parse(originalQuery);
        let optimizationApplied = false;

        // RE-IMPLEMENTING PRUNE LOGIC WITH DOT PATHS
        // For the sake of the hackathon demo, we will use a simpler approach:
        // We will assume 1-level nesting optimization for now to keep `visit` simple, 
        // OR we just use the array to filter.

        // Let's rely on the previous logic style but adapted:
        // We look at the top definition.

        const deepPrune = (selectionSet, parentPath) => {
            if (!selectionSet) return;

            const initialSelectionCount = selectionSet.selections.length;

            const validSelections = selectionSet.selections.filter(selection => {
                if (selection.kind !== 'Field') return true; // Keep fragments, etc.
                if (selection.name.value === '__typename') return true;

                const currentPath = parentPath ? `${parentPath}.${selection.name.value}` : selection.name.value;

                // Keep if this path is in allowed list, OR if it's a prefix of an allowed path (meaning it has children we need)
                const isAllowed = allowedFields.includes(currentPath);
                const isParentOfAllowed = allowedFields.some(f => f.startsWith(currentPath + '.'));

                return isAllowed || isParentOfAllowed;
            });

            if (validSelections.length !== initialSelectionCount) {
                optimizationApplied = true;
            }

            selectionSet.selections = validSelections;

            // Recurse
            selectionSet.selections.forEach(sel => {
                if (sel.kind === 'Field' && sel.selectionSet) {
                    const currentPath = parentPath ? `${parentPath}.${sel.name.value}` : sel.name.value;
                    deepPrune(sel.selectionSet, currentPath);
                }
            });
        };

        ast.definitions.forEach(def => {
            if (def.kind === 'OperationDefinition' && def.operation === 'query') {
                // We don't prune the root op, start with internal selections
                // But our paths start with "user", so we pass empty parentPath
                deepPrune(def.selectionSet, '');
            }
        });

        if (optimizationApplied) {
            return print(ast);
        }
        return originalQuery;

    } catch (error) {
        console.error("Optimization failed:", error.message);
        return originalQuery;
    }
};

// Main GraphQL proxy endpoint
app.post('/graphql', async (req, res) => {
    try {
        const { query, variables } = req.body;
        const screenName = req.headers['x-screen-name'] || 'default_screen'; // Feature 2 header

        // 1. Detect Type
        const queryType = detectQueryType(query);

        // 2. Check for Auto-Optimization for THIS Screen
        let queryToSend = query;
        let wasOptimized = false;

        if (queryType) {
            const optimizedFields = getOptimizedFields(screenName, queryType);
            if (optimizedFields) {
                console.log(`🤖 [${screenName}] Auto-optimizing '${queryType}'...`);
                queryToSend = optimizeQuery(query, optimizedFields);
                wasOptimized = query.replace(/\s+/g, '') !== queryToSend.replace(/\s+/g, '');
            }
        }

        // Log incoming query 
        console.log(`\n--- Request: ${queryType} | Screen: ${screenName} ---`);
        if (wasOptimized) console.log('✨ OPTIMIZED based on screen profile!');

        // 3. Forward to Backend
        const startTime = Date.now();
        const response = await axios.post(GRAPHQL_BACKEND_URL, {
            query: queryToSend,
            variables
        }, { headers: { 'Content-Type': 'application/json' } });

        const latency = Date.now() - startTime;
        const originalSizeEst = JSON.stringify(response.data).length;

        // 4. LEARN from Response (Feature 1 + 2)
        if (queryType && response.data) {
            // Pass the screen name to track per screen!
            trackFieldUsage(screenName, queryType, response.data);
        }

        console.log(`Latency: ${latency}ms | Size: ${originalSizeEst} bytes`);
        if (wasOptimized) console.log(`🎉 SAVED BANDWIDTH!`);
        console.log('-----------------------------\n');

        // Return backend response to client
        res.json(response.data);

    } catch (error) {
        // ... Error handling (kept simple) ...
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start the server (listen on all network interfaces)
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log('🚀 GraphQL Smart Middleware Server Started');
    console.log('='.repeat(60));
    console.log(`📍 Local URL: http://localhost:${PORT}/graphql`);
    console.log(`🔗 Target Backend: ${GRAPHQL_BACKEND_URL}`);
    console.log(`🧠 Persistence: ${PATTERNS_FILE}`);
    console.log('='.repeat(60));
    console.log('✅ Deployment Ready (Bound to 0.0.0.0)');
    console.log('='.repeat(60));
});
