async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

async function loadOverview() {
  const data = await fetchJSON('/api/affiliate/overview');
  document.getElementById('kpi-referrals').textContent = data.totalReferrals || '0';
  document.getElementById('kpi-plan').textContent = data.currentPlan || '--';
  document.getElementById('kpi-rewards').textContent = `$${(data.compoundedRewards || 0).toFixed(2)}`;
}

async function loadPlanDetails() {
  const data = await fetchJSON('/api/affiliate/plan');
  document.getElementById('plan-details').innerHTML = `
    <p><strong>Role:</strong> ${data.role}</p>
    <p><strong>Plan:</strong> ${data.plan_name}</p>
    <p><strong>Monthly Cost:</strong> $${data.monthly_cost.toFixed(2)}</p>
    <p><strong>Yearly Capital:</strong> $${data.yearly_capital.toFixed(2)}</p>
  `;
}

async function loadTable(url, tableId, columns) {
  const data = await fetchJSON(url);
  const tbody = document.getElementById(tableId).querySelector('tbody');
  tbody.innerHTML = data.map(item => {
    return `<tr>${columns.map(col => `<td>${item[col]}</td>`).join('')}</tr>`;
  }).join('');
}

async function loadPlanFinancials() {
  // In the future, this would be: const plans = await fetchJSON('/api/plans');
  // For now, we use the mock data loaded in plans.html
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

function setupDropdown() {
    const trigger = document.getElementById('user-profile-trigger');
    const menu = document.getElementById('user-dropdown-menu');

    if (!trigger || !menu) return;

    trigger.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents the window click event from firing immediately
        menu.classList.toggle('hidden');
    });

    // Close dropdown if clicking outside
    window.addEventListener('click', () => {
        if (!menu.classList.contains('hidden')) {
            menu.classList.add('hidden');
        }
    });

    menu.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents window click from closing menu if clicking inside
    });
}

function setupSettingsForm() {
    const avatarInput = document.getElementById('setting-avatar');
    const avatarPreview = document.getElementById('avatar-preview');

    if (!avatarInput || !avatarPreview) return;

    avatarInput.addEventListener('change', () => {
        const file = avatarInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                avatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

async function loadEarnings() {
  //TODO: a dynamic affiliate id should be used instead of a hardcoded one
  const data = await fetchJSON('/api/affiliate/earnings?affiliate_id=1');
  document.getElementById('kpi-total-earnings').textContent = `$${data.totalEarnings || '0.00'}`;

  const tbody = document.getElementById('earnings-table').querySelector('tbody');
  tbody.innerHTML = data.earningsBreakdown.map(item => {
    return `<tr>
        <td>${item.referred_user_id}</td>
        <td>${item.plan}</td>
        <td>$${item.subscription_commission}</td>
        <td>$${item.purchase_commission}</td>
        <td>$${item.total_commission}</td>
      </tr>`;
  }).join('');
}

async function initDashboard() {
  try {
    await loadOverview();
    await loadPlanDetails();
    await loadPlanFinancials();
    await loadTable('/api/affiliate/referrals', 'referrals-table', 
      ['date','referred_user','plan_chosen','commission','status']);
    await loadEarnings();
  } catch(err) {
    console.error('Dashboard loading error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupDropdown();
    setupSettingsForm();
});
async function fetchJSON(url) {
  const res = await fetch(url); // This is a real API call
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

async function loadOverview() {
  // This function expects a live '/api/affiliate/overview' endpoint
  const data = await fetchJSON('/api/affiliate/overview'); 
  // ...
}
