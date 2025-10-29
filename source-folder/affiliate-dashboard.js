async function loadOverview() {
  // MOCK IMPLEMENTATION
  const data = MOCK_API.overview;
  document.getElementById('kpi-referrals').textContent = data.totalReferrals || '0';
  document.getElementById('kpi-plan').textContent = data.currentPlan || '--';
  document.getElementById('kpi-earnings').textContent = `$${(data.monthlyEarnings || 0).toFixed(2)}`;
  document.getElementById('kpi-rewards').textContent = `$${(data.compoundedRewards || 0).toFixed(2)}`;
}

async function loadPlanDetails() {
  // MOCK IMPLEMENTATION
  const data = MOCK_API.userPlan;
  document.getElementById('plan-details').innerHTML = `
    <p><strong>Role:</strong> ${data.role}</p>
    <p><strong>Plan:</strong> ${data.plan_name}</p>
    <p><strong>Monthly Cost:</strong> $${data.monthly_cost.toFixed(2)}</p>
    <p><strong>Yearly Capital:</strong> $${data.yearly_capital.toFixed(2)}</p>
  `;

  // Also update the header user info
  document.querySelector('.user-role').textContent = data.plan_name;
}

async function loadTable(data, tableId, columns) {
  const tbody = document.getElementById(tableId).querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(item => {
    return `<tr>${columns.map(col => `<td>${item[col]}</td>`).join('')}</tr>`;
  }).join('');
}

async function loadTrainingHub() {
    // MOCK IMPLEMENTATION
    const trainingItems = MOCK_API.training;
    const trainingList = document.getElementById('training-list');
    if (!trainingList) return;

    trainingList.innerHTML = trainingItems.map(item => `
        <a href="${item.url}" class="training-item">
            <div class="training-icon">
                <i class="fas ${item.type === 'Video' ? 'fa-play-circle' : 'fa-file-alt'}"></i>
            </div>
            <div class="training-title">${item.title}</div>
        </a>
    `).join('');
}

async function loadPlanFinancials() {
  // In the future, this would be: const plans = await fetchJSON('/api/plans');
  // For now, we use the mock data
  const plans = MOCK_API.plans;
  const tbody = document.querySelector('#plans-table tbody');
  if (!tbody) return;

  tbody.innerHTML = plans.map(p => `
    <tr>
      <td>${p.role}</td>
      <td>${p.plan_name}</td>
      <td>$${p.monthly_cost.toFixed(2)}</td>
      <td>$${p.break_even_flow.toFixed(2)}</td>
      <td>$${p.network_earnings.toFixed(2)}</td>
      <td>$${p.yearly_capital.toFixed(2)}</td>
    </tr>
  `).join('');
}

async function initDashboard() {
  try {
    await loadOverview();
    await loadPlanDetails();
    await loadPlanFinancials();
    // MOCK IMPLEMENTATION for tables
    await loadTable(MOCK_API.referrals, 'referrals-table', ['date', 'referred_user', 'plan_chosen', 'commission', 'status']);
    await loadTable(MOCK_API.earnings, 'earnings-table', ['date', 'amount', 'type', 'status']);
    await loadTrainingHub();
    // NOTE: Graph section is not loaded with data yet, only its HTML structure is added.
  } catch(err) {
    console.error('Dashboard loading error:', err);
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);