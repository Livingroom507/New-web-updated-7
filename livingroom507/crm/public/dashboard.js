document.addEventListener('DOMContentLoaded', () => {
    fetchKpiData();
});

async function fetchKpiData() {
    try {
        const response = await fetch('/api/kpi');
        if (!response.ok) {
            throw new Error('Failed to fetch KPI data');
        }
        const kpiData = await response.json();
        updateDashboard(kpiData);
    } catch (error) {
        console.error('Error fetching KPI data:', error);
    }
}

function updateDashboard(kpiData) {
    document.getElementById('closing-ratio').textContent = `${kpiData.closingRatio}%`;
    document.getElementById('pipeline-value').textContent = `$${kpiData.pipelineValue}`;
    document.getElementById('nurturing-leads').textContent = kpiData.nurturingLeads;

    // Revenue per Plan
    const revenuePerPlanDiv = document.getElementById('revenue-per-plan');
    let revenueHtml = '<ul>';
    for (const plan of kpiData.revenuePerPlan) {
        revenueHtml += `<li>${plan.purchased_plan}: $${plan.total_revenue.toFixed(2)}</li>`;
    }
    revenueHtml += '</ul>';
    revenuePerPlanDiv.innerHTML = revenueHtml;

    // Affiliate Performance
    const affiliatePerformanceDiv = document.getElementById('affiliate-performance');
    let affiliateHtml = '<ol>';
    for (const affiliate of kpiData.affiliatePerformance) {
        affiliateHtml += `<li>${affiliate.referring_affiliate}: ${affiliate.deal_count} deals</li>`;
    }
    affiliateHtml += '</ol>';
    affiliatePerformanceDiv.innerHTML = affiliateHtml;

    // Campaign Cycle Tracker
    document.getElementById('campaign-cycle-tracker').textContent = `${kpiData.campaignCycleTracker}/253`;
}
