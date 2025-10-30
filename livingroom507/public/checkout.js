document.addEventListener('DOMContentLoaded', () => {
    const orderSummaryDiv = document.getElementById('order-summary');
    const payWithPaypalBtn = document.getElementById('pay-with-paypal-btn');

    // Retrieve the selected plan from localStorage
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));

    if (selectedPlan) {
        orderSummaryDiv.innerHTML = `
            <h3>Order Summary: ${selectedPlan.name}</h3>
            <p><strong>Price:</strong> $${selectedPlan.monthly_cost.toFixed(2)} / month</p>
            <p><strong>Network Earnings:</strong> ${selectedPlan.networkEarnings}</p>
            <p><strong>Description:</strong></p>
            <ul>
                ${selectedPlan.description.map(item => `<li>${item}</li>`).join('')}
            </ul>
        `;
    } else {
        orderSummaryDiv.innerHTML = '<p>No plan selected. Please <a href="plans.html">go back</a> and choose a plan.</p>';
        payWithPaypalBtn.disabled = true;
    }

    payWithPaypalBtn.addEventListener('click', () => {
        if (!selectedPlan) {
            alert('Please select a plan first.');
            return;
        }
        // In a real application, this would make an AJAX call to your backend (Cloudflare Worker)
        // Your backend would then interact with PayPal's API to create an order/subscription.
        // PayPal would return a redirect URL, and your frontend would navigate to it.
        alert(`Simulating PayPal checkout for ${selectedPlan.name} ($${selectedPlan.monthly_cost.toFixed(2)}/month).\n\n` +
              `In a real scenario, you would now be redirected to PayPal to complete the payment.`);

        // For now, we'll just simulate success and redirect after a short delay
        setTimeout(() => {
            localStorage.removeItem('selectedPlan'); // Clear selected plan
            window.location.href = 'affiliate-dashboard.html'; // Redirect to dashboard
        }, 2000); // Simulate network delay
    });
});