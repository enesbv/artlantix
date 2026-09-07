import { ComplexityTier, TurnaroundSpeed, PricingCalculation } from './types';

/**
 * ARTLANTIX PRICING & SPECIFICATION ENGINE CONFIGURATION
 * All pricing rates, tiers, add-ons, and speed multipliers are isolated here.
 */

// 1. Base Geometry Pricing by Complexity Tier
export const BASE_PRICES: Record<ComplexityTier, number> = {
  simple: 25,    // Basic geometric shapes, flat silhouettes, single color
  standard: 45,  // Multi-color logos, standard badges, crests, standard curves
  complex: 75,   // Intricate hand-drawn artwork, mascots, detailed engravings
};

// 2. Add-On Services
export const ADDON_PRICING = {
  // Font & Typographic Reconstruction
  FONT_LETTERING_REBUILD: 15, // Identifying authentic typeface, typesetting & custom bezier lettering

  // Geometry Damage & Missing Parts Reconstruction
  MODERATE_RECONSTRUCTION: 20, // Rebuilding missing/blurred elements from low-res scans
  HEAVY_RECONSTRUCTION: 35,    // Deep manual reconstruction for severely degraded artwork

  // Color Count & Trapping Separations
  COLOR_SEPARATIONS: {
    '1-2': 0,        // 1-2 Spot colors included in base
    '3-5': 5,        // 3-5 Spot colors separation
    '6+': 15,        // 6+ Spot colors separation
    'gradient': 15,  // Shaded multi-gradient vector trapping
  } as Record<string, number>,
};

// 3. Turnaround Speed Modifiers
export const SPEED_CONFIG = {
  STANDARD_HOURS: '24-48h',
  STANDARD_MULTIPLIER: 1.0,
  EXPRESS_HOURS: '<12-16h',
  EXPRESS_MULTIPLIER: 1.35, // +35% surcharge for rush queue dispatch
};

// 4. Complexity Threshold Guard Rules
export const THRESHOLD_GUARD = {
  COMPLEXITY_TRIGGER: 'complex' as ComplexityTier,
  MESSAGE:
    'This complex artwork combines intricate manual geometry, damaged lettering, and deep reconstruction. Our senior art director will review it to confirm the lowest exact price.',
  SUBMIT_WITHOUT_CHARGE: true,
};

export interface PricingInput {
  complexity: ComplexityTier;
  hasText: boolean;
  reconstructionNeeded: boolean;
  heavyReconstruction?: boolean;
  colorCount: '1-2' | '3-5' | '6+' | 'gradient';
  turnaround: TurnaroundSpeed;
  artworkType?: string;
}

/**
 * Calculates itemized pricing and detects if manual review is required.
 */
export function calculatePricing(
  input: PricingInput,
  customBasePrices?: Partial<Record<ComplexityTier, number>>
): PricingCalculation {
  const activeBasePrices = {
    ...BASE_PRICES,
    ...(customBasePrices || {}),
  };
  const basePrice = activeBasePrices[input.complexity] ?? activeBasePrices.simple;
  const breakdown: { label: string; amount: number }[] = [
    {
      label: `${input.complexity.charAt(0).toUpperCase() + input.complexity.slice(1)} Geometry Base`,
      amount: basePrice,
    },
  ];

  // Font Reconstruction Add-on
  let textReconstruction = 0;
  if (input.hasText) {
    textReconstruction = ADDON_PRICING.FONT_LETTERING_REBUILD;
    breakdown.push({
      label: 'Font & Custom Lettering Rebuild',
      amount: textReconstruction,
    });
  }

  // Geometry Missing Details Reconstruction Add-on
  let geometryReconstruction = 0;
  if (input.heavyReconstruction) {
    geometryReconstruction = ADDON_PRICING.HEAVY_RECONSTRUCTION;
    breakdown.push({
      label: 'Heavy Missing Geometry Reconstruction',
      amount: geometryReconstruction,
    });
  } else if (input.reconstructionNeeded) {
    geometryReconstruction = ADDON_PRICING.MODERATE_RECONSTRUCTION;
    breakdown.push({
      label: 'Reconstruct Missing/Blurred Details',
      amount: geometryReconstruction,
    });
  }

  // Color Count Add-on
  const colorAddon = ADDON_PRICING.COLOR_SEPARATIONS[input.colorCount] || 0;
  if (colorAddon > 0) {
    breakdown.push({
      label:
        input.colorCount === 'gradient'
          ? 'Complex Gradients Separation'
          : `${input.colorCount} Spot Colors Separation`,
      amount: colorAddon,
    });
  }

  const subtotal = basePrice + textReconstruction + geometryReconstruction + colorAddon;

  // Turnaround Speed Surcharge
  const isExpress = input.turnaround === 'express';
  const speedMultiplier = isExpress ? SPEED_CONFIG.EXPRESS_MULTIPLIER : SPEED_CONFIG.STANDARD_MULTIPLIER;

  if (isExpress) {
    const expressSurcharge = Math.round(subtotal * speedMultiplier) - subtotal;
    breakdown.push({
      label: `Priority Express Dispatch (${SPEED_CONFIG.EXPRESS_HOURS})`,
      amount: expressSurcharge,
    });
  }

  const total = Math.round(subtotal * speedMultiplier);

  // Complexity Threshold Guard
  const isHighComplexity = input.complexity === THRESHOLD_GUARD.COMPLEXITY_TRIGGER;
  const hasSevereReconstruction = input.heavyReconstruction || input.reconstructionNeeded;
  const hasCustomText = input.hasText;

  const needsManualReview = isHighComplexity && hasSevereReconstruction && hasCustomText;
  const manualReviewReason = needsManualReview ? THRESHOLD_GUARD.MESSAGE : undefined;

  return {
    basePrice,
    textReconstruction,
    geometryReconstruction,
    colorAddon,
    speedMultiplier,
    subtotal,
    total,
    needsManualReview,
    manualReviewReason,
    breakdown,
  };
}
