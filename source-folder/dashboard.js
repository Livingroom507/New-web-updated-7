// helper to fetch data
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error('Network error: ' + res.status);
  return await res.json();
}

async function loadPlans() {
  let plans;
  try {
    // Update API endpoint path to match serverless function
    plans = await fetchJSON('/api/plans');
  } catch(err) {
    console.warn('API fetch failed, using mock data.', err);
    plans = mockPlans;
  }

  const grid = document.getElementById('plans-grid');
  grid.innerHTML = '';

  plans.forEach(plan => {
    const card = document.createElement('div');
    card.className = 'plan-card';
    
    // Add description array based on plan data
    const description = [
      `Subscriptions: $${plan.monthly_cost} monthly`,
      `Network Total: $${plan.network_total}`,
      `Average Cost Cycle: $${plan.avg_cost_cycle}`,
      `Break Even Flow: $${plan.break_even_flow}`,
      `Yearly Capital: $${plan.yearly_capital}`
    ];

    card.innerHTML = `
      <div class="header">
        <h2>${plan.plan_name}</h2>
        <p class="monthly">$${plan.monthly_cost.toFixed(2)}/month</p>
        <p class="text-lg text-gray-700 mb-4">Estimated Network Earnings: <span class="font-semibold text-green-600">$${plan.network_earnings.toFixed(2)}</span></p>
      </div>
      <div class="content">
        <ul>
          ${description.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
      <div class="footer">
        <button data-plan-id="${plan.id}" class="choose-plan">Choose ${plan.plan_name}</button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll('.choose-plan').forEach(btn => {
    btn.addEventListener('click', () => {
      const planId = btn.getAttribute('data-plan-id');
      alert('You chose plan ID: ' + planId);
    });
  });
}

// initialize UI
document.addEventListener('DOMContentLoaded', () => {
  loadPlans();
});