let affiliateEmail = '';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  return await res.json();
}

async function loadOverview(email) {
  const data = await fetchJSON(`/api/affiliate/overview?email=${email}`);
  document.getElementById('kpi-referrals').textContent = data.referral_count || '0';
  document.getElementById('kpi-total-earnings').textContent = `$${(data.total_earnings || 0).toFixed(2)}`;
}

async function loadPlanDetails(email) {
  const data = await fetchJSON(`/api/affiliate/plan?email=${email}`);
  document.getElementById('kpi-plan').textContent = data.name || '--';
  document.getElementById('plan-details').innerHTML = `
    <p><strong>Plan:</strong> ${data.name}</p>
    <p><strong>Commission Rate:</strong> ${data.commission_rate * 100}%</p>
    <p><strong>Features:</strong></p>
    <ul>
      ${data.features.map(feature => `<li>${feature}</li>`).join('')}
    </ul>
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

async function loadEarnings(email) {
  const data = await fetchJSON(`/api/affiliate/earnings?email=${email}`);
  document.getElementById('kpi-total-earnings').textContent = `$${data.total_earnings || '0.00'}`;

  // This part needs to be adjusted based on the actual data structure for earnings breakdown
  const tbody = document.getElementById('earnings-table').querySelector('tbody');
  tbody.innerHTML = `<tr><td colspan="5">Earnings breakdown not yet implemented in this view.</td></tr>`;
}

async function initDashboard() {
  affiliateEmail = prompt('Please enter your affiliate email:');
  if (!affiliateEmail) {
    alert('Affiliate email is required to load the dashboard.');
    return;
  }

  try {
    await loadOverview(affiliateEmail);
    await loadPlanDetails(affiliateEmail);
    await loadPlanFinancials();
    await loadTable(`/api/affiliate/referrals?email=${affiliateEmail}`, 'referrals-table', 
      ['created_at','name','email','status']);
    await loadEarnings(affiliateEmail);
  } catch(err) {
    console.error('Dashboard loading error:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    setupDropdown();
    setupSettingsForm();
});
