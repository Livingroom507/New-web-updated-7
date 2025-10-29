async function loadPlans() {
    const plansGrid = document.getElementById('plans-grid');
    if (!plansGrid) return;

    try {
        // Using mock data instead of a real API call
        const plans = MOCK_API.plans; // MOCK_API is loaded from mock-api.js
        plansGrid.innerHTML = plans
            .map(plan => `
            <div class="new-plan-card">
                <div class="new-plan-card-header">
                    <h2 class="plan-name">${plan.name}</h2>
                    <p class="plan-price">${plan.monthlyPrice}<span class="price-per-month">/month</span></p>
                    <p class="plan-earnings">Network Earnings: <span class="earnings-amount">${plan.networkEarnings}</span></p>
                </div>
                <div class="new-plan-card-body">
                    <ul class="plan-features">
                        ${plan.description.map(item => `<li class="feature-item">${item}</li>`).join('')}
                    </ul>
                </div>
                <div class="new-plan-card-footer">
                    <button class="btn-choose-plan" data-plan-name="${plan.name}">
                        Choose ${plan.name}
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to the new buttons
        document.querySelectorAll('.btn-choose-plan').forEach(button => {
            button.addEventListener('click', (event) => {
                const planName = event.target.getAttribute('data-plan-name');
                const selectedPlan = MOCK_API.plans.find(p => p.name === planName);
                // Store the selected plan in localStorage to access it on the checkout page
                // We need to rename plan_name to name for checkout.js to work
                const checkoutPlan = { ...selectedPlan, plan_name: selectedPlan.name };
                localStorage.setItem('selectedPlan', JSON.stringify(checkoutPlan));
                // Redirect to the checkout page
                window.location.href = 'checkout.html';
            });
        });
    } catch (error) {
        console.error('Error loading plans:', error);
        plansGrid.innerHTML = '<p>Failed to load subscription plans. Please try again later.</p>';
    }
}

async function loadNetworkGoal() {
    const networkGoalSpan = document.getElementById('network-goal');
    if (!networkGoalSpan) return;

    try {
        // Using mock data instead of a real API call
        const data = MOCK_API.networkGoal;
        networkGoalSpan.textContent = `${data.current_paid_subscriptions} / ${data.target_paid_subscriptions}`;
    } catch (error) {
        console.error('Error loading network goal:', error);
        networkGoalSpan.textContent = 'N/A';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadPlans();
    loadNetworkGoal();
});