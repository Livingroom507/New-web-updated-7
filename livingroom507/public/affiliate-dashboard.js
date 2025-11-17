// affiliate-dashboard.js

// --- 1. Utility Functions ---

/**
 * Fetches data from a given endpoint.
 * @param {string} endpoint - The API path (e.g., '/api/affiliate/profile').
 * @param {string} email - The user's email for authorization/data filtering.
 * @returns {Promise<Object>} The JSON response data.
 */
async function fetchData(endpoint, email) {
    // NOTE: In a production app, the email would be extracted securely from a session/token.
    const url = `${endpoint}?email=${email}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // Throw error to be caught by the caller
            throw new Error(`Failed to fetch ${endpoint}: ${response.statusText}`);
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        // Display a fallback message on the dashboard
        document.getElementById('plan-details').innerHTML = `<p class="error-msg">Error loading data. Check console.</p>`;
        return null; 
    }
}

// --- 2. Dashboard Population Functions ---

/**
 * Populates user details and plan financials (Overview & My Plan sections).
 */
async function loadProfileAndPlan(email) {
    const data = await fetchData('/api/affiliate/profile', email);
    if (!data) return;

    const { user, subscription, kpis } = data;

    // 1. Update Header and Overview KPIs
    document.querySelector('.user-name').textContent = user.name || 'Affiliate User';
    document.querySelector('.user-role').textContent = subscription.currentTier;
    document.getElementById('kpi-plan').textContent = subscription.currentTier;
    
    document.getElementById('kpi-referrals').textContent = kpis.totalReferrals;
    document.getElementById('kpi-total-earnings').textContent = `$${kpis.totalEarnings.toFixed(2)}` || '$0.00';
    document.getElementById('kpi-rewards').textContent = 'N/A'; // Assuming this is calculated elsewhere

    // 2. Populate My Plan Details section
    const planDetailsDiv = document.getElementById('plan-details');
    if (subscription.financials) {
        planDetailsDiv.innerHTML = `
            <p><strong>Tier:</strong> ${subscription.financials.plan_name}</p>
            <p><strong>Commission Rate:</strong> ${subscription.financials.commission_rate * 100}%</p>
            <p><strong>Description:</strong> ${subscription.financials.description || 'No description available.'}</p>
        `;
    } else {
        planDetailsDiv.innerHTML = '<p>Subscription details not found.</p>';
    }

    // 3. Populate Plan Financials Table (Training Lab)
    // NOTE: This assumes you have data for ALL plans in your 'plans' table.
    // We will need a separate endpoint to fetch ALL plans later, but for now we use the current plan data.
    const plansTableBody = document.querySelector('#plans-table tbody');
    plansTableBody.innerHTML = `
        <tr>
            <td>${subscription.financials.role_type || 'N/A'}</td>
            <td>${subscription.financials.plan_name || 'N/A'}</td>
            <td>$${subscription.financials.monthly_cost || '0'}</td>
            <td>$${subscription.financials.breakeven_flow || '0'}</td>
            <td>${subscription.financials.network_earnings_rate || 'N/A'}</td>
            <td>$${subscription.financials.yearly_capital || '0'}</td>
        </tr>
    `;
}

/**
 * Populates the Referrals and Earnings tables.
 */
async function loadEarningsAndReferrals(email) {
    const data = await fetchData('/api/affiliate/earnings', email);
    if (!data) return;

    const { referrals, totalEarnings } = data;

    // Update the Overview KPI with the real calculated total earnings
    document.getElementById('kpi-total-earnings').textContent = `$${totalEarnings}`;
    document.getElementById('kpi-referrals').textContent = referrals.length;


    // 1. Populate Referrals Table
    const referralsTableBody = document.querySelector('#referrals-table tbody');
    referralsTableBody.innerHTML = ''; // Clear previous content
    
    if (referrals.length === 0) {
        referralsTableBody.innerHTML = '<tr><td colspan="5">No referrals found yet. Get closing!</td></tr>';
    } else {
        referrals.forEach(ref => {
            const row = referralsTableBody.insertRow();
            row.innerHTML = `
                <td>${new Date(ref.date).toLocaleDateString()}</td>
                <td>${ref.referredUser}</td>
                <td>${ref.planChosen}</td>
                <td>$${ref.commissionEarned}</td>
                <td>${ref.status}</td>
            `;
        });
    }

    // 2. Populate Earnings Table (simple summary, matching the structure of the referrals data)
    const earningsTableBody = document.querySelector('#earnings-table tbody');
    earningsTableBody.innerHTML = ''; // Clear previous content
    
    if (referrals.length === 0) {
        earningsTableBody.innerHTML = '<tr><td colspan="5">No earnings to display.</td></tr>';
    } else {
        // Since earnings are calculated in the referrals loop, we map the results for the earnings table
        referrals.forEach(ref => {
            const row = earningsTableBody.insertRow();
            row.innerHTML = `
                <td>${ref.referredUser}</td>
                <td>${ref.planChosen}</td>
                <td>$${ref.commissionEarned}</td>
                <td>N/A</td> <td>$${ref.commissionEarned}</td>
            `;
        });
    }
}


// --- 3. Initialization ---

/**
 * Main function to run when the page loads.
 */
function initDashboard() {
    // IMPORTANT: Replace this with the logic to get the logged-in affiliate's email.
    // For testing, we use the email of the 'Affiliate One' user.
    const affiliateEmail = 'affiliate@livingroom507.com'; 

    // Load data from both core endpoints concurrently
    loadProfileAndPlan(affiliateEmail);
    loadEarningsAndReferrals(affiliateEmail);

    // Initial event listener for the dropdown menu
    document.getElementById('user-profile-trigger').addEventListener('click', function() {
        const dropdown = document.getElementById('user-dropdown-menu');
        dropdown.classList.toggle('hidden');
    });

    // Optionally load training hub data here (requires another function, similar to above)
}

// Start the dashboard loading process when the DOM is ready
document.addEventListener('DOMContentLoaded', initDashboard);
