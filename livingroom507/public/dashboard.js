async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) {
        // Log the error and throw a more descriptive one
        const errorText = await res.text();
        console.error(`API Error from ${url}: ${res.status} - ${errorText}`);
        throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return await res.json();
}

async function loadPlans() {
    const plansGrid = document.getElementById('plans-grid');
    if (!plansGrid) return;

    try {
        const plans = await fetchJSON('/api/plans');
        // Using mock data instead of a real API call
        const plans = MOCK_API.plans;
        plansGrid.innerHTML = plans.map(plan => `
            <div class="card plan-card">
                <h3>${plan.name}</h3>
                <p>${plan.description}</p>
                <p><strong>Monthly Cost:</strong> $${plan.monthly_cost.toFixed(2)}</p>
                <p><strong>Yearly Capital:</strong> $${plan.yearly_capital.toFixed(2)}</p>
                <h4>Benefits:</h4>
                <ul>
                    ${plan.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                </ul>
                <button class="btn">Select Plan</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading plans:', error);
        plansGrid.innerHTML = '<p>Failed to load subscription plans. Please try again later.</p>';
    }
}

async function loadNetworkGoal() {
    const networkGoalSpan = document.getElementById('network-goal');
    if (!networkGoalSpan) return;

    try {
        const data = await fetchJSON('/api/network-goal');
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