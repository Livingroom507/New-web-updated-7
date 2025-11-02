export async function onRequestGet({ env }) {
    try {
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

        const kpiData = {
            closingRatio: closingRatio,
            pipelineValue: proposalSent.count, // Assuming value of 1 per deal for now
            nurturingLeads: nurturingLeads.count,
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
