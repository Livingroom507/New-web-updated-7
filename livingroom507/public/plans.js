document.addEventListener('DOMContentLoaded', () => {
  const plansGrid = document.getElementById('plans-grid');
  const networkGoalEl = document.getElementById('network-goal');

  // Fetch plans from the API
  fetch('/api/plans')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(plans => {
      if (plans.length === 0) {
        plansGrid.innerHTML = '<p>No subscription plans are available at the moment.</p>';
        return;
      }
      renderPlans(plans);
      // Assuming the network goal is the same for all plans, taking the first one.
      if (plans.length > 0) {
        networkGoalEl.textContent = plans[0].network_total;
      }
    })
    .catch(error => {
      console.error('Error fetching plans:', error);
      plansGrid.innerHTML = '<p>Error loading subscription plans. Please try again later.</p>';
    });

  // Render plan cards
  function renderPlans(plans) {
    plansGrid.innerHTML = ''; // Clear existing content
    plans.forEach(plan => {
      const planCard = document.createElement('div');
      planCard.classList.add('plan-card');
      if (plan.plan_name.toLowerCase().includes('gold')) {
        planCard.classList.add('gold-plan');
      }

      planCard.innerHTML = `
        <h3>${plan.plan_name}</h3>
        <p class="price">$${plan.monthly_cost}/month</p>
        <ul>
          <li>Network Total: ${plan.network_total}</li>
          <li>Avg Cost Cycle: ${plan.avg_cost_cycle}</li>
          <li>Break Even Flow: ${plan.break_even_flow}</li>
          <li>Network Earnings: ${plan.network_earnings}</li>
          <li>Yearly Capital: ${plan.yearly_capital}</li>
        </ul>
        <a href="checkout.html?plan_id=${plan.id}" class="btn">Choose Plan</a>
      `;
      plansGrid.appendChild(planCard);
    });
  }
});
