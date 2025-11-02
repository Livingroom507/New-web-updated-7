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
}
