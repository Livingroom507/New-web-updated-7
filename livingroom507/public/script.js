// --- JAVASCRIPT BLOCK FOR CLIENT-SIDE (e.g., in index.html <script> tag) ---

// NOTE: This must match the URL where your DO Worker is exposed.
// Replace 'yourdomain.com' with your actual Cloudflare Pages domain.
const COLLAB_ENDPOINT_ROOT = 'wss://yourdomain.com/ws/'; 

// In a live system, this Session ID MUST be passed securely to the client 
// (e.g., via a secure cookie or a unique URL parameter) when the session starts.
const CURRENT_CLIENT_SESSION_ID = 'SESSION_XYZ_123'; 

// --------------------------------------------------------
// 1. VISUAL FEEDBACK FUNCTION (Called by the WebSocket)
// --------------------------------------------------------
function updateSelectionStatus(categoryId, message, color) {
    const statusElement = document.getElementById(`status-${categoryId}`);
    const productContainer = document.querySelector(`[data-category-id="${categoryId}"]`);
    
    if (statusElement && productContainer) {
        // Update the Collaboration Status card content
        statusElement.querySelector('p').textContent = message;
        statusElement.style.backgroundColor = color;
        statusElement.style.color = 'white'; 
        
        // Apply the visual border highlight to the entire product container
        if (color === 'green') {
            productContainer.style.border = '3px solid #4CAF50'; // Confirmed color
            productContainer.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.7)';
        }
    }
}


// --------------------------------------------------------
// 2. DURABLE OBJECT (DO) CONNECTION LOGIC
// --------------------------------------------------------
function connectToCollabRoom(sessionId) {
    if (!sessionId || typeof WebSocket === 'undefined') {
        console.error("Collaboration failed: Missing Session ID or WebSocket support.");
        return;
    }

    // Connect to the specific DO instance using the session ID
    // We append the /websocket path which the DO worker is listening for
    const ws = new WebSocket(COLLAB_ENDPOINT_ROOT + sessionId + '/websocket');

    ws.onopen = () => {
        console.log(`[Collab] Connected to session ${sessionId}. Ready for Admin updates.`);
    };

    ws.onmessage = (event) => {
        try {
            // Data received from the Admin via the DO broadcast
            const data = JSON.parse(event.data);
            if (data.action === 'confirm_selection') {
                // Instantly update the client's screen
                updateSelectionStatus(data.category, data.message, data.color);
            }
        } catch (e) {
            console.error('[Collab] Error parsing message:', e);
        }
    };

    ws.onclose = () => {
        console.warn('[Collab] Connection closed. Attempting to reconnect in 5s...');
        // Simple reconnection logic for stability
        setTimeout(() => connectToCollabRoom(sessionId), 5000); 
    };

    ws.onerror = (e) => {
        console.error('[Collab] WebSocket Error:', e);
    };
}


// --------------------------------------------------------
// 3. EXECUTION HOOK: Update the existing showPage function
// --------------------------------------------------------

// Assuming you have an existing showPage function similar to this:
function showPage(pageId) {
    const allPages = document.querySelectorAll('.page');
    allPages.forEach(page => page.classList.add('hidden'));

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
    }
    
    // START THE COLLABORATION WHEN THE TARGET PAGE IS VISIBLE
    if (pageId === 'business-plan-desc') {
        connectToCollabRoom(CURRENT_CLIENT_SESSION_ID);
    }
}

// And this function for the client to signal interest back to the Admin
function sendClientSignal(categoryId) {
    // This is the client's button handler (e.g., "This Looks Right")
    console.log(`Client signaled interest in: ${categoryId}`);
    updateSelectionStatus(categoryId, 'Client signaled interest.', 'orange');
    
    // In a final implementation, you would send a message back to the Admin via the DO 
    // to notify them that the client has acknowledged the selection.
}
