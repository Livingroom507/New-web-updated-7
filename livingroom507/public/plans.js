document.addEventListener('DOMContentLoaded', () => {
  const plansGrid = document.getElementById('plans-grid');
  const notificationBox = document.querySelector('.notification-box');

  // Render Commission Breakdown & Network Goal
  const networkGoal = MOCK_API.networkGoal;
  const networkGoalEl = document.createElement('p');
  networkGoalEl.innerHTML = `The network goal or full network total (Paid subscriptions) is <strong>${networkGoal.current_paid_subscriptions} / ${networkGoal.target_paid_subscriptions}</strong>. Once this count is met, the system will reset and recycle the campaign (Release Payment).`;
  notificationBox.appendChild(networkGoalEl);


  // Render plans
  const plans = MOCK_API.plans;
  if (plans.length === 0) {
    plansGrid.innerHTML = '<p>No subscription plans are available at the moment.</p>';
    return;
  }
  renderPlans(plans);

  function renderPlans(plans) {
    plansGrid.innerHTML = ''; // Clear existing content
    plans.forEach(plan => {
      const planCard = document.createElement('div');
      planCard.classList.add('plan-card');

      planCard.innerHTML = `
        <h3>${plan.name}</h3>
        <p class="price">${plan.monthlyPrice}/month</p>
        <p class="network-earnings">Network Earnings: ${plan.networkEarnings}</p>
        <ul>
          ${plan.description.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <a href="checkout.html" class="btn choose-plan-btn" data-plan='${JSON.stringify(plan)}'>Choose ${plan.name}</a>
      `;
      plansGrid.appendChild(planCard);
    });

    // Add event listeners to the choose plan buttons
    const choosePlanBtns = document.querySelectorAll('.choose-plan-btn');
    choosePlanBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planData = e.target.getAttribute('data-plan');
        localStorage.setItem('selectedPlan', planData);
      });
    });
  }
});