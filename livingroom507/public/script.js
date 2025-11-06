document.addEventListener('DOMContentLoaded', () => {

    // --- Page Navigation Logic ---
    const navLinks = document.querySelectorAll('nav a, .btn, .back-link');
    const pages = document.querySelectorAll('.page');

    function showPage(pageId) {
        const targetId = pageId.startsWith('#') ? pageId.substring(1) : pageId;

        pages.forEach(page => {
            if (page.id === targetId) {
                page.classList.remove('hidden');
            } else {
                page.classList.add('hidden');
            }
        });
        window.scrollTo(0, 0);

        if (targetId === 'business-plan-desc') {
            connectToCollabRoom(CURRENT_CLIENT_SESSION_ID);
        }
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                event.preventDefault();
                window.location.hash = href;
            }
        });
    });

    window.addEventListener('hashchange', () => {
        const hash = window.location.hash || '#home';
        showPage(hash);
    });

    const initialHash = window.location.hash || '#home';
    showPage(initialHash);

    // --- WebSocket Collaboration Logic ---
    const COLLAB_ENDPOINT_ROOT = 'wss://yourdomain.com/ws/'; 
    const CURRENT_CLIENT_SESSION_ID = 'SESSION_XYZ_123'; 

    function updateSelectionStatus(categoryId, message, color) {
        const statusElement = document.getElementById(`status-${categoryId}`);
        const productContainer = document.querySelector(`[data-category-id="${categoryId}"]`);
        
        if (statusElement && productContainer) {
            statusElement.querySelector('p').textContent = message;
            statusElement.style.backgroundColor = color;
            statusElement.style.color = 'white'; 
            
            if (color === 'green') {
                productContainer.style.border = '3px solid #4CAF50';
                productContainer.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.7)';
            }
        }
    }

    function connectToCollabRoom(sessionId) {
        if (!sessionId || typeof WebSocket === 'undefined') {
            console.error("Collaboration failed: Missing Session ID or WebSocket support.");
            return;
        }

        const ws = new WebSocket(COLLAB_ENDPOINT_ROOT + sessionId + '/websocket');

        ws.onopen = () => {
            console.log(`[Collab] Connected to session ${sessionId}. Ready for Admin updates.`);
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.action === 'confirm_selection') {
                    updateSelectionStatus(data.category, data.message, data.color);
                }
            } catch (e) {
                console.error('[Collab] Error parsing message:', e);
            }
        };

        ws.onclose = () => {
            console.warn('[Collab] Connection closed. Attempting to reconnect in 5s...');
            setTimeout(() => connectToCollabRoom(sessionId), 5000); 
        };

        ws.onerror = (e) => {
            console.error('[Collab] WebSocket Error:', e);
        };
    }

    window.sendClientSignal = function(categoryId) {
        console.log(`Client signaled interest in: ${categoryId}`);
        updateSelectionStatus(categoryId, 'Client signaled interest.', 'orange');
    }
});