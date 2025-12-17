async function loadOverview() {
  // MOCK IMPLEMENTATION
  const data = MOCK_API.overview;
  document.getElementById('kpi-referrals').textContent = data.totalReferrals || '0';
  document.getElementById('kpi-plan').textContent = data.currentPlan || '--';
  document.getElementById('kpi-earnings').textContent = `$${(data.monthlyEarnings || 0).toFixed(2)}`;
  document.getElementById('kpi-rewards').textContent = `$${(data.compoundedRewards || 0).toFixed(2)}`;
}
/**
 * Fetches all necessary profile data from the server and populates the dashboard.
 */
async function loadProfileData() {
  try {
    // In a real app, you would get the user's email from an authentication context.
    const currentUserEmail = 'roblq123@gmail.com'; 
    const response = await fetch(`/api/affiliate/profile?email=${currentUserEmail}`);
    const profileData = await response.json();

    // --- Populate Header ---
    document.querySelector('.user-name').textContent = profileData.fullName || 'Affiliate';
    document.querySelector('.user-role').textContent = profileData.currentPlanName || 'No Plan';
    if (profileData.profilePictureUrl) {
      document.querySelector('.avatar').src = profileData.profilePictureUrl;
    }

    // --- Populate KPI Cards ---
    document.getElementById('kpi-plan').textContent = profileData.currentPlanName || '--';
    // NOTE: The following KPIs need their own API endpoints to be calculated.
    // This data is not included in the /profile response.
    document.getElementById('kpi-referrals').textContent = '0'; // Placeholder
    document.getElementById('kpi-earnings').textContent = '$0.00'; // Placeholder
    document.getElementById('kpi-rewards').textContent = '$0.00'; // Placeholder

    // --- Populate "My Plan Details" ---
    const planDetailsEl = document.getElementById('plan-details');
    if (planDetailsEl) {
      planDetailsEl.innerHTML = `
        <p><strong>Plan:</strong> ${profileData.currentPlanName || 'N/A'}</p>
        <p><strong>Purchase Unit:</strong> $${(profileData.purchaseUnit || 0).toFixed(2)}</p>
        <p><strong>Earning per Unit:</strong> $${(profileData.purchaseEarning || 0).toFixed(2)}</p>
      `;
    }
  } catch (error) {
    console.error('Error loading profile data:', error);
  }
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
    if (!response.ok) {
      // Try to parse the error response from the server, if it's JSON
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      } catch (jsonError) {
        // If the error response isn't JSON, throw a generic error
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    }

  // Also update the header user info
  document.querySelector('.user-role').textContent = data.plan_name;
}
    const profileData = await response.json();

async function loadTable(data, tableId, columns) {
  const tbody = document.getElementById(tableId).querySelector('tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(item => {
    return `<tr>${columns.map(col => `<td>${item[col]}</td>`).join('')}</tr>`;
  }).join('');
}
    // --- Populate Header ---
    document.querySelector('.user-name').textContent = profileData.fullName || 'Affiliate';
    document.querySelector('.user-role').textContent = profileData.currentPlanName || 'No Plan';
    if (profileData.profilePictureUrl) {
      document.querySelector('.avatar').src = profileData.profilePictureUrl;
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
  } catch (error) {
    console.error('Dashboard loading error:', error);
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="card"><h2>Error</h2><p>Could not load dashboard data. Please try again later.</p><p><small>Details: ${error.message}</small></p></div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', initDashboard);
document.addEventListener('DOMContentLoaded', loadProfileData);