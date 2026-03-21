import { LocationBreakdown, CastBreakdown, VFXRequirement, BudgetEstimate } from '../domain/ProductionBreakdown';

const LOCATION_COST_PER_DAY = { INT: 5000, EXT: 15000 };
const CAST_COST: Record<string, number> = {
  Protagonist: 500000,
  Antagonist: 300000,
  Supporting: 100000,
  Minor: 10000,
};
const VFX_COST_PER_HOUR = 300;
const CREW_COST_PER_DAY = 50000;
const FRINGE_MULTIPLIER = 1.4;
const POST_PRODUCTION_PER_DAY = 20000;

export class BudgetEstimator {
  estimate(
    locations: LocationBreakdown[],
    cast: CastBreakdown[],
    vfxRequirements: VFXRequirement[],
    shootingDays: number,
  ): BudgetEstimate {
    const locationCost = locations.reduce((sum, loc) => {
      const rate = loc.setting === 'EXT' ? LOCATION_COST_PER_DAY.EXT : LOCATION_COST_PER_DAY.INT;
      return sum + rate * loc.frequency;
    }, 0);

    const castCost = cast.reduce((sum, c) => {
      return sum + (CAST_COST[c.role] || CAST_COST.Minor);
    }, 0);

    const vfxHours = vfxRequirements.reduce((sum, r) => sum + r.estimatedHours, 0);
    const vfxCost = vfxHours * VFX_COST_PER_HOUR;

    const crewCost = Math.round(shootingDays * CREW_COST_PER_DAY * FRINGE_MULTIPLIER);

    const postProduction = shootingDays * POST_PRODUCTION_PER_DAY;

    const likely = locationCost + castCost + vfxCost + crewCost + postProduction;

    return {
      low: Math.round(likely * 0.8),
      likely: Math.round(likely),
      high: Math.round(likely * 1.3),
      breakdown: {
        cast: castCost,
        locations: locationCost,
        vfx: vfxCost,
        crew: crewCost,
        postProduction,
      },
    };
  }
}
