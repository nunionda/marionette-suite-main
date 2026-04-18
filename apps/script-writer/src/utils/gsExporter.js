/**
 * GS (Global Studios Standard) Exporter
 *
 * Bridges MS (Marionette Studios / script-writer) deliverables
 * to GS Disney 6-Stage Pipeline format.
 *
 * Reference: global-studios-standard/docs/disney-pipeline-standard.md §10.4
 */

import { GS_PIPELINE } from '../config/projectCategories';

/**
 * Calculate Stage Gate readiness for a project.
 * Returns { total, completed, percent, items[] }
 */
export function calculateGateReadiness(project, pipelineData, category) {
  const pipeline = GS_PIPELINE[category];
  if (!pipeline) return { total: 0, completed: 0, percent: 0, items: [] };

  const items = pipeline.deliverables.map(d => {
    let content = null;

    if (d.source === 'logline') {
      content = project.logline;
    } else if (pipelineData && d.source) {
      content = pipelineData[d.source];
    }

    const hasContent = !!(content && typeof content === 'string' && content.trim().length > 50);

    return {
      id: d.id,
      label: d.label,
      agent: d.agent,
      sub: d.sub,
      format: d.format,
      status: d.source === null ? 'planned' : hasContent ? 'complete' : 'empty',
    };
  });

  const completed = items.filter(i => i.status === 'complete').length;
  const total = items.filter(i => i.status !== 'planned').length;

  return {
    total,
    completed,
    percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    items,
    gate: pipeline.gate,
    gateReady: completed === total && total > 0,
    gateChecklist: pipeline.gateChecklist || [],
  };
}

/**
 * Generate GS Dispatch XML for a project's deliverables.
 */
export function generateDispatchXML(project, pipelineData, category) {
  const pipeline = GS_PIPELINE[category];
  if (!pipeline) return '';

  const readiness = calculateGateReadiness(project, pipelineData, category);
  const completedDeliverables = readiness.items
    .filter(i => i.status === 'complete')
    .map(i => `    <deliverable id="${i.id}" agent="${i.agent}" sub="${i.sub}" format="${i.format}">${i.label}</deliverable>`)
    .join('\n');

  return `<dispatch agent="CINE" task="STAGE_1_REVIEW" project="${project.title}">
  <stage>${pipeline.stage}</stage>
  <division>${pipeline.division}</division>
  <gate>${pipeline.gate}</gate>
  <gate_readiness>${readiness.percent}%</gate_readiness>
  <deliverables count="${readiness.completed}/${readiness.total}">
${completedDeliverables}
  </deliverables>
  <category>${category}</category>
  <genre>${project.genre}</genre>
  <output format="pdf" destination="./outputs/"/>
</dispatch>`;
}

/**
 * Map a MS tab key to its GS deliverable name.
 */
export function getGSLabel(tabKey, category) {
  const pipeline = GS_PIPELINE[category];
  if (!pipeline) return tabKey;

  const match = pipeline.deliverables.find(d => {
    if (d.source === tabKey) return true;
    if (d.source === tabKey.toLowerCase()) return true;
    return false;
  });

  return match ? match.label : tabKey;
}
