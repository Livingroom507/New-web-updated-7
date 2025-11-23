// c:\Users\roblq\OneDrive\Documents\(websites)\New-web-updated-7\livingroom507\public\checkout.js

document.addEventListener('DOMContentLoaded', () => {
    const payWithPaypalBtn = document.getElementById('pay-with-paypal-btn');
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));

    if (!payWithPaypalBtn) {
        return;
    }
    
    // --- Purchase Confirmation API Function ---
    async function handlePurchaseConfirmation(userEmail, planName) {
        try {
            const response = await fetch('/api/affiliate/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail, planName }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Subscription failed on the server.');
            }

            // Success: Notify user and redirect
            alert(`Success! You are now subscribed to ${planName}.`);
            localStorage.removeItem('selectedPlan'); // Clean up local storage
            window.location.href = 'affiliate-dashboard.html'; // Redirect to the dashboard

        } catch (error) {
            console.error('Purchase Error:', error);
            // Re-enable button on failure
            payWithPaypalBtn.disabled = false;
            alert('Purchase failed: ' + error.message);
        }
    }

    // --- Event Listener ---
    payWithPaypalBtn.addEventListener('click', async () => {
        
        if (!selectedPlan || !selectedPlan.name) {
            alert('Please select a plan first.');
            return;
        }

        // Disable button immediately to prevent double-clicks
        payWithPaypalBtn.disabled = true;

        // CRITICAL: Use the D1-verified test user email
        const currentUserEmail = 'roblq123@gmail.com'; 

        // Call the asynchronous function and await its result
        await handlePurchaseConfirmation(currentUserEmail, selectedPlan.name);
    });
});