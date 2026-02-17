import type { FaceShape, FrameRecommendation, RecommendationContext, Prescription } from '@/types';

interface FrameConfig {
  type: string;
  reason: string;
  priority: 'best' | 'good' | 'okay';
  prescriptionSuitability?: 'excellent' | 'good' | 'limited'; // How well it works with high prescriptions
  ageAppeal?: 'young' | 'mature' | 'universal';
}

const FRAME_SUGGESTION_MAP: Record<FaceShape, FrameConfig[]> = {
  Oval: [
    { type: 'Wayfarer', reason: 'Classic shape that complements your balanced proportions', priority: 'best', prescriptionSuitability: 'excellent', ageAppeal: 'universal' },
    { type: 'Aviator', reason: 'Enhances your natural symmetry with a timeless look', priority: 'best', prescriptionSuitability: 'good', ageAppeal: 'universal' },
    { type: 'Cat Eye', reason: 'Adds stylish lift while maintaining balance', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'young' },
    { type: 'Rectangular', reason: 'Adds structure without overwhelming your features', priority: 'good', prescriptionSuitability: 'excellent', ageAppeal: 'mature' },
    { type: 'Round', reason: 'Creates a soft, harmonious look with your face shape', priority: 'okay', prescriptionSuitability: 'good', ageAppeal: 'young' },
    { type: 'Browline', reason: 'Adds definition to the brow area gracefully', priority: 'okay', prescriptionSuitability: 'excellent', ageAppeal: 'mature' },
  ],
  Round: [
    { type: 'Rectangular', reason: 'Adds angular definition to balance soft curves', priority: 'best', prescriptionSuitability: 'excellent', ageAppeal: 'universal' },
    { type: 'Square', reason: 'Creates contrast and adds structure to round features', priority: 'best', prescriptionSuitability: 'excellent', ageAppeal: 'mature' },
    { type: 'Geometric', reason: 'Sharp angles provide strong visual contrast', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'young' },
    { type: 'Browline', reason: 'Draws attention upward and adds width at the top', priority: 'good', prescriptionSuitability: 'excellent', ageAppeal: 'mature' },
    { type: 'Wayfarer', reason: 'Slightly angular shape provides subtle definition', priority: 'okay', prescriptionSuitability: 'excellent', ageAppeal: 'universal' },
  ],
  Square: [
    { type: 'Round', reason: 'Softens strong angular jawline for a balanced look', priority: 'best', prescriptionSuitability: 'good', ageAppeal: 'universal' },
    { type: 'Oval', reason: 'Curves complement and soften square features', priority: 'best', prescriptionSuitability: 'excellent', ageAppeal: 'universal' },
    { type: 'Aviator', reason: 'Teardrop shape contrasts well with angular jawline', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'universal' },
    { type: 'Rimless', reason: 'Minimalist frame does not add more angularity', priority: 'good', prescriptionSuitability: 'limited', ageAppeal: 'mature' },
    { type: 'Cat Eye', reason: 'Upswept shape softens and lifts square proportions', priority: 'okay', prescriptionSuitability: 'good', ageAppeal: 'young' },
  ],
  Heart: [
    { type: 'Aviator', reason: 'Wider bottom balances a broad forehead perfectly', priority: 'best', prescriptionSuitability: 'good', ageAppeal: 'universal' },
    { type: 'Rimless', reason: 'Lightweight design keeps focus on your best features', priority: 'best', prescriptionSuitability: 'limited', ageAppeal: 'mature' },
    { type: 'Round', reason: 'Soft curves complement a pointed chin line', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'universal' },
    { type: 'Light Bottom-Heavy', reason: 'Adds width to the lower face for symmetry', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'young' },
    { type: 'Oval', reason: 'Gentle curves balance forehead-chin ratio', priority: 'okay', prescriptionSuitability: 'excellent', ageAppeal: 'universal' },
  ],
  Diamond: [
    { type: 'Cat Eye', reason: 'Accentuates cheekbones and adds width at brow level', priority: 'best', prescriptionSuitability: 'good', ageAppeal: 'young' },
    { type: 'Oval', reason: 'Soft curves balance prominent cheekbones', priority: 'best', prescriptionSuitability: 'excellent', ageAppeal: 'universal' },
    { type: 'Semi-Rimless', reason: 'Adds subtle width at the top without bulk', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'mature' },
    { type: 'Rimless', reason: 'Clean lines complement angular features', priority: 'good', prescriptionSuitability: 'limited', ageAppeal: 'mature' },
    { type: 'Browline', reason: 'Adds definition to the forehead area', priority: 'okay', prescriptionSuitability: 'excellent', ageAppeal: 'mature' },
  ],
  Oblong: [
    { type: 'Oversized', reason: 'Wide frames shorten the appearance of face length', priority: 'best', prescriptionSuitability: 'good', ageAppeal: 'young' },
    { type: 'Wayfarer', reason: 'Bold shape adds width and visual breaks to face length', priority: 'best', prescriptionSuitability: 'excellent', ageAppeal: 'universal' },
    { type: 'Square', reason: 'Wide square frames create horizontal balance', priority: 'good', prescriptionSuitability: 'excellent', ageAppeal: 'mature' },
    { type: 'Round', reason: 'Curves break vertical lines and add width', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'universal' },
    { type: 'Aviator', reason: 'Wide lens area covers more vertical space', priority: 'okay', prescriptionSuitability: 'good', ageAppeal: 'universal' },
  ],
  Triangle: [
    { type: 'Cat Eye', reason: 'Wider top frames balance a broader jaw perfectly', priority: 'best', prescriptionSuitability: 'good', ageAppeal: 'young' },
    { type: 'Browline', reason: 'Heavy top gives visual width to the forehead', priority: 'best', prescriptionSuitability: 'excellent', ageAppeal: 'mature' },
    { type: 'Aviator', reason: 'Wide top contrasts and balances jaw width', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'universal' },
    { type: 'Semi-Rimless', reason: 'Bold top half adds needed upper-face definition', priority: 'good', prescriptionSuitability: 'good', ageAppeal: 'mature' },
    { type: 'Round', reason: 'Curved frames soften strong jaw angles', priority: 'okay', prescriptionSuitability: 'good', ageAppeal: 'universal' },
  ],
};

/**
 * Analyze prescription strength to determine frame requirements.
 */
function analyzePrescription(prescription?: Prescription): {
  strength: 'none' | 'low' | 'moderate' | 'high' | 'very-high';
  needsFullRim: boolean;
  notes: string[];
} {
  if (!prescription) {
    return { strength: 'none', needsFullRim: false, notes: [] };
  }

  const notes: string[] = [];
  const right = prescription.rightEye;
  const left = prescription.leftEye;

  // Calculate approximate prescription strength (diopters)
  const rightSph = Math.abs(right.spherical || 0);
  const rightCyl = Math.abs(right.cylindrical || 0);
  const leftSph = Math.abs(left.spherical || 0);
  const leftCyl = Math.abs(left.cylindrical || 0);

  const maxSph = Math.max(rightSph, leftSph);
  const maxCyl = Math.max(rightCyl, leftCyl);
  const totalStrength = maxSph + maxCyl * 0.5; // Cylinder counts less

  let strength: 'none' | 'low' | 'moderate' | 'high' | 'very-high' = 'none';
  let needsFullRim = false;

  if (totalStrength === 0) {
    strength = 'none';
  } else if (totalStrength <= 2.0) {
    strength = 'low';
    notes.push('Your prescription works well with any frame style');
  } else if (totalStrength <= 4.0) {
    strength = 'moderate';
    notes.push('Smaller frames will minimize lens thickness');
    needsFullRim = true;
  } else if (totalStrength <= 6.0) {
    strength = 'high';
    notes.push('Choose full-rim frames to secure thicker lenses');
    notes.push('Smaller, rounder lens shapes reduce edge thickness');
    needsFullRim = true;
  } else {
    strength = 'very-high';
    notes.push('Full-rim frames highly recommended for lens support');
    notes.push('Smaller frames significantly improve appearance');
    notes.push('Consider high-index lenses to reduce thickness');
    needsFullRim = true;
  }

  // Check for prism (adds thickness)
  if ((right.prism && Math.abs(right.prism) > 0) || (left.prism && Math.abs(left.prism) > 0)) {
    notes.push('Prism correction requires sturdy full-rim frames');
    needsFullRim = true;
  }

  // Check for high astigmatism (cylindrical)
  if (maxCyl > 2.0) {
    notes.push('High astigmatism: choose frames with stable lens positioning');
  }

  return { strength, needsFullRim, notes };
}

/**
 * Determine bridge fit based on nose bridge width measurement.
 */
function analyzeBridgeFit(noseBridgeWidthMm: number): 'narrow' | 'standard' | 'wide' {
  if (noseBridgeWidthMm < 16) return 'narrow';
  if (noseBridgeWidthMm > 21) return 'wide';
  return 'standard';
}

/**
 * Enhanced frame recommendations that consider prescription, age, gender, and measurements.
 */
export function getEnhancedRecommendations(context: RecommendationContext): FrameRecommendation[] {
  const baseFrames = FRAME_SUGGESTION_MAP[context.faceShape] || [];
  const prescriptionAnalysis = analyzePrescription(context.prescription);
  const bridgeFit = analyzeBridgeFit(context.measurements.noseBridgeWidthMm);

  // Filter and enhance recommendations
  let recommendations: FrameRecommendation[] = baseFrames.map(frame => {
    const rec: FrameRecommendation = {
      type: frame.type,
      reason: frame.reason,
      priority: frame.priority,
      bridgeFit,
    };

    // Downgrade rimless/semi-rimless if prescription requires full-rim
    if (prescriptionAnalysis.needsFullRim) {
      if (frame.type.toLowerCase().includes('rimless')) {
        rec.priority = 'okay'; // Downgrade priority
        rec.prescriptionNote = 'May not provide adequate support for your prescription strength. Consider full-rim alternatives.';
      } else if (frame.prescriptionSuitability === 'excellent') {
        rec.prescriptionNote = 'Excellent choice for your prescription strength - provides secure lens support.';
      }
    }

    // Add age-based preference notes
    if (context.age) {
      if (context.age < 30 && frame.ageAppeal === 'mature') {
        // Don't penalize, just neutral
      } else if (context.age >= 50 && frame.ageAppeal === 'young') {
        // Slightly lower  priority for very young styles
        if (rec.priority === 'okay') rec.priority = 'okay';
      }
    }

    return rec;
  });

  // Sort: best first, then good, then okay
  // Also prioritize frames suitable for prescription
  recommendations.sort((a, b) => {
    const priorityOrder = { best: 3, good: 2, okay: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];

    if (aPriority !== bPriority) return bPriority - aPriority;

    // If prescription requires full-rim, prioritize frames without warnings
    if (prescriptionAnalysis.needsFullRim) {
      const aHasWarning = a.prescriptionNote?.includes('not provide adequate') ? 1 : 0;
      const bHasWarning = b.prescriptionNote?.includes('not provide adequate') ? 1 : 0;
      if (aHasWarning !== bHasWarning) return aHasWarning - bHasWarning;
    }

    return 0;
  });

  // Add general prescription notes to top recommendation
  if (recommendations.length > 0 && prescriptionAnalysis.notes.length > 0) {
    const topRec = recommendations[0];
    if (!topRec.prescriptionNote) {
      topRec.prescriptionNote = prescriptionAnalysis.notes[0];
    }
  }

  return recommendations;
}

/**
 * Simple wrapper for backward compatibility - returns base suggestions without context.
 */
export function getFrameSuggestions(faceShape: FaceShape): FrameRecommendation[] {
  return FRAME_SUGGESTION_MAP[faceShape].map(f => ({
    type: f.type,
    reason: f.reason,
    priority: f.priority,
  })) || [];
}

/**
 * Calculate frame size in standard optical notation (lens width in mm).
 * Based on estimated face width at the cheekbones in mm, we derive lens width.
 * Standard notation: lens width - bridge width - temple length
 * Cheekbone width ~= total frame width. Lens width ~= (frame width - bridge) / 2
 */
export function calculateFrameSize(cheekboneWidthMm: number): string {
  const bridgeMm = 18;
  const lensWidthMm = Math.round((cheekboneWidthMm - bridgeMm) / 2);

  if (lensWidthMm <= 47) return `Small (${lensWidthMm}mm lens / ${cheekboneWidthMm}mm total)`;
  if (lensWidthMm <= 52) return `Medium (${lensWidthMm}mm lens / ${cheekboneWidthMm}mm total)`;
  if (lensWidthMm <= 57) return `Large (${lensWidthMm}mm lens / ${cheekboneWidthMm}mm total)`;
  return `Extra Large (${lensWidthMm}mm lens / ${cheekboneWidthMm}mm total)`;
}
