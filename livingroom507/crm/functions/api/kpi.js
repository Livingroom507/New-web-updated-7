export async function onRequestGet({ env }) {
    try {
        // Existing KPIs
        const { results: closedWon } = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM deals WHERE pipeline_stage = 'Closed/Won'"
        ).first();

        const { results: diagnosticComplete } = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM deals WHERE pipeline_stage = 'Diagnostic Complete'"
        ).first();

        const { results: proposalSent } = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM deals WHERE pipeline_stage = 'Proposal Sent'"
        ).first();

        const { results: nurturingLeads } = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM deals WHERE pipeline_stage = 'Lost/Nurture'"
        ).first();

        const closingRatio = diagnosticComplete.count > 0 ? Math.round((closedWon.count / diagnosticComplete.count) * 100) : 0;

        // New KPIs
        const revenuePerPlanResult = await env.DB.prepare(
            `SELECT d.purchased_plan, SUM(p.subscription_cost) as total_revenue
             FROM deals d
             JOIN plans p ON d.purchased_plan = p.plan_name
             WHERE d.purchased_plan IS NOT NULL
             GROUP BY d.purchased_plan`
        ).all();

        const affiliatePerformanceResult = await env.DB.prepare(
            `SELECT referring_affiliate, COUNT(*) as deal_count
             FROM deals
             WHERE referring_affiliate IS NOT NULL
             GROUP BY referring_affiliate
             ORDER BY deal_count DESC
             LIMIT 5`
        ).all();

        const campaignCycleTrackerResult = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM deals WHERE purchased_plan IS NOT NULL"
        ).first();

        const kpiData = {
            closingRatio: closingRatio,
            pipelineValue: proposalSent.count, // Assuming value of 1 per deal for now
            nurturingLeads: nurturingLeads.count,
            revenuePerPlan: revenuePerPlanResult.results,
            affiliatePerformance: affiliatePerformanceResult.results,
            campaignCycleTracker: campaignCycleTrackerResult.results.count
        };

        return new Response(JSON.stringify(kpiData), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
