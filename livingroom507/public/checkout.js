document.addEventListener('DOMContentLoaded', () => {
    const orderSummaryDiv = document.getElementById('order-summary');
    const payNowBtn = document.getElementById('pay-now-btn');

    // Retrieve the selected plan from localStorage
    const selectedPlan = JSON.parse(localStorage.getItem('selectedPlan'));

    if (selectedPlan) {
        orderSummaryDiv.innerHTML = `
            <h3>${selectedPlan.plan_name}</h3>
            <p><strong>Price:</strong> $${selectedPlan.monthly_cost.toFixed(2)} / month</p>
            <p>${selectedPlan.description}</p>
        `;
    } else {
        orderSummaryDiv.innerHTML = '<p>No plan selected. Please <a href="plans.html">go back</a> and choose a plan.</p>';
        payNowBtn.disabled = true;
    }

    payNowBtn.addEventListener('click', () => {
        // Simulate a successful payment
        alert(`Payment successful for ${selectedPlan.plan_name}! Redirecting to your dashboard.`);

        // In a real app, the backend would confirm payment and then redirect.
        // Here, we just redirect after the alert.

        // Clean up localStorage
        localStorage.removeItem('selectedPlan');

        window.location.href = 'affiliate-dashboard.html';
    });
});