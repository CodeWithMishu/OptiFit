import type { FaceShape, FaceMeasurements, FaceRatios, FaceDetectionResult } from '@/types';
import { getFrameSuggestions, calculateFrameSize } from './frameLogic';

// ─── MediaPipe Face Mesh Landmark Indices ────────────────────────────
// Using precise anatomical landmark positions for accuracy.
// Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png
const L = {
  // Vertical face boundaries
  FOREHEAD_TOP: 10,        // Highest point of forehead hairline
  CHIN_BOTTOM: 152,        // Lowest point of chin

  // Forehead width (measured at eyebrow level for consistency)
  LEFT_FOREHEAD_OUTER: 70,
  RIGHT_FOREHEAD_OUTER: 300,

  // Temple width (widest at temporal bone)
  LEFT_TEMPLE: 127,
  RIGHT_TEMPLE: 356,

  // Cheekbone / Zygomatic width (the widest facial measurement)
  LEFT_CHEEKBONE: 234,
  RIGHT_CHEEKBONE: 454,

  // Jaw width (at gonion / jaw angle)
  LEFT_JAW_ANGLE: 172,
  RIGHT_JAW_ANGLE: 397,

  // Jaw contour points for angle sharpness
  LEFT_JAW_MID: 136,
  RIGHT_JAW_MID: 365,
  LEFT_JAW_LOWER: 150,
  RIGHT_JAW_LOWER: 379,

  // Nose bridge (for bridge width measurement)
  NOSE_BRIDGE_LEFT: 193,
  NOSE_BRIDGE_RIGHT: 417,

  // Extra cheek points for secondary validation
  LEFT_CHEEK_INNER: 116,
  RIGHT_CHEEK_INNER: 345,

  // Mid-face points
  NOSE_TIP: 1,
  LEFT_EYE_OUTER: 33,
  RIGHT_EYE_OUTER: 263,
  LEFT_EYE_INNER: 133,
  RIGHT_EYE_INNER: 362,

  // Face contour (silhouette)
  CONTOUR: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109, 10,
  ],
} as const;

// Average interpupillary distance (IPD) in mm — used for pixel-to-mm calibration.
// Average adult IPD is 63mm. This gives results in approximate real-world mm.
const AVERAGE_IPD_MM = 63;

function dist(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

/**
 * Validate face pose to ensure frontal alignment for accurate measurements.
 * Returns quality score 0-100 and warnings.
 */
function validateFacePose(
  landmarks: Array<{ x: number; y: number; z: number }>
): { score: number; warnings: string[] } {
  const warnings: string[] = [];
  let score = 100;

  // Check horizontal symmetry (face rotation left/right)
  const leftEyeX = landmarks[L.LEFT_EYE_OUTER].x;
  const rightEyeX = landmarks[L.RIGHT_EYE_OUTER].x;
  const noseX = landmarks[L.NOSE_TIP].x;
  const expectedNoseX = (leftEyeX + rightEyeX) / 2;
  const horizontalDeviation = Math.abs(noseX - expectedNoseX) / Math.abs(rightEyeX - leftEyeX);

  if (horizontalDeviation > 0.15) {
    warnings.push('Face appears rotated. Please face the camera directly.');
    score -= 30;
  } else if (horizontalDeviation > 0.08) {
    warnings.push('Slight face rotation detected. Center your face for best results.');
    score -= 15;
  }

  // Check vertical tilt (face up/down)
  const foreheadTop = landmarks[L.FOREHEAD_TOP].y;
  const chin = landmarks[L.CHIN_BOTTOM].y;
  const noseY = landmarks[L.NOSE_TIP].y;
  const expectedNoseY = foreheadTop + (chin - foreheadTop) * 0.55; // Nose should be ~55% down
  const verticalDeviation = Math.abs(noseY - expectedNoseY) / (chin - foreheadTop);

  if (verticalDeviation > 0.12) {
    warnings.push('Face is tilted. Keep your head level.');
    score -= 25;
  } else if (verticalDeviation > 0.06) {
    score -= 10;
  }

  // Check face size in frame (too close/far affects accuracy)
  const faceWidth = Math.abs(rightEyeX - leftEyeX);
  if (faceWidth < 0.2) {
    warnings.push('Move closer to the camera.');
    score -= 20;
  } else if (faceWidth > 0.7) {
    warnings.push('Move back slightly from the camera.');
    score -= 15;
  }

  // Check z-depth variation (profile vs frontal)
  const avgZLeft = (landmarks[L.LEFT_CHEEKBONE].z + landmarks[L.LEFT_TEMPLE].z) / 2;
  const avgZRight = (landmarks[L.RIGHT_CHEEKBONE].z + landmarks[L.RIGHT_TEMPLE].z) / 2;
  const zDeviation = Math.abs(avgZLeft - avgZRight);

  if (zDeviation > 0.05) {
    warnings.push('Face depth asymmetry detected. Ensure even lighting and frontal pose.');
    score -= 20;
  }

  return { score: Math.max(0, score), warnings };
}

/**
 * Convert normalized landmark distance to approximate millimeters
 * using interpupillary distance as a calibration reference.
 */
function toMm(normalizedDist: number, ipdNormalized: number): number {
  if (ipdNormalized === 0) return 0;
  return (normalizedDist / ipdNormalized) * AVERAGE_IPD_MM;
}

export function extractMeasurements(
  landmarks: Array<{ x: number; y: number; z: number }>
): { measurements: FaceMeasurements; ratios: FaceRatios } {
  // Calibration: measure interpupillary distance
  const ipdNormalized = dist(landmarks[L.LEFT_EYE_OUTER], landmarks[L.RIGHT_EYE_OUTER]);

  // ─── Raw normalized distances ───
  const faceLengthRaw = dist(landmarks[L.FOREHEAD_TOP], landmarks[L.CHIN_BOTTOM]);
  const foreheadWidthRaw = dist(landmarks[L.LEFT_FOREHEAD_OUTER], landmarks[L.RIGHT_FOREHEAD_OUTER]);
  const cheekboneWidthRaw = dist(landmarks[L.LEFT_CHEEKBONE], landmarks[L.RIGHT_CHEEKBONE]);
  const jawWidthRaw = dist(landmarks[L.LEFT_JAW_ANGLE], landmarks[L.RIGHT_JAW_ANGLE]);
  const templeWidthRaw = dist(landmarks[L.LEFT_TEMPLE], landmarks[L.RIGHT_TEMPLE]);
  const noseBridgeWidthRaw = dist(landmarks[L.NOSE_BRIDGE_LEFT], landmarks[L.NOSE_BRIDGE_RIGHT]);

  // ─── Convert to millimeters ───
  const measurements: FaceMeasurements = {
    faceLengthMm: Math.round(toMm(faceLengthRaw, ipdNormalized)),
    foreheadWidthMm: Math.round(toMm(foreheadWidthRaw, ipdNormalized)),
    cheekboneWidthMm: Math.round(toMm(cheekboneWidthRaw, ipdNormalized)),
    jawWidthMm: Math.round(toMm(jawWidthRaw, ipdNormalized)),
    templeWidthMm: Math.round(toMm(templeWidthRaw, ipdNormalized)),
    noseBridgeWidthMm: Math.round(toMm(noseBridgeWidthRaw, ipdNormalized)),
  };

  // ─── Compute ratios ───
  const jawAngleLeft = computeJawAngle(landmarks, 'left');
  const jawAngleRight = computeJawAngle(landmarks, 'right');
  const avgJawAngle = (jawAngleLeft + jawAngleRight) / 2;

  const ratios: FaceRatios = {
    lengthToWidth: faceLengthRaw / cheekboneWidthRaw,
    foreheadToJaw: foreheadWidthRaw / jawWidthRaw,
    cheekToJaw: cheekboneWidthRaw / jawWidthRaw,
    foreheadToCheek: foreheadWidthRaw / cheekboneWidthRaw,
    jawAngleSharpness: avgJawAngle,
  };

  return { measurements, ratios };
}

/**
 * Compute jaw angle sharpness (in degrees).
 * Sharp angles (< 120deg) = Square/Angular jaw
 * Rounded angles (> 140deg) = Round/Soft jaw
 */
function computeJawAngle(
  landmarks: Array<{ x: number; y: number; z: number }>,
  side: 'left' | 'right'
): number {
  const midIdx = side === 'left' ? L.LEFT_JAW_MID : L.RIGHT_JAW_MID;
  const angleIdx = side === 'left' ? L.LEFT_JAW_ANGLE : L.RIGHT_JAW_ANGLE;
  const lowerIdx = side === 'left' ? L.LEFT_JAW_LOWER : L.RIGHT_JAW_LOWER;

  const a = landmarks[midIdx];
  const b = landmarks[angleIdx]; // vertex
  const c = landmarks[lowerIdx];

  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  if (magBA === 0 || magBC === 0) return 150; // default to rounded if degenerate

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

/**
 * Multi-score face shape classification with refined weights.
 * Each shape gets a score based on how well the ratios match.
 * The shape with the highest score wins. Confidence reflects both match quality and separation from alternatives.
 */
export function classifyFaceShape(ratios: FaceRatios): { shape: FaceShape; confidence: number } {
  const { lengthToWidth, foreheadToJaw, cheekToJaw, foreheadToCheek, jawAngleSharpness } = ratios;

  const scores: Record<FaceShape, number> = {
    Oval: 0,
    Round: 0,
    Square: 0,
    Heart: 0,
    Diamond: 0,
    Oblong: 0,
    Triangle: 0,
  };

  // ─── OVAL ─── (Balanced, proportional face)
  // Face moderately longer than wide (1.3-1.5), forehead slightly wider than jaw, rounded jaw
  if (lengthToWidth >= 1.3 && lengthToWidth <= 1.5) scores.Oval += 4;
  else if (lengthToWidth >= 1.2 && lengthToWidth <= 1.6) scores.Oval += 2;
  else if (lengthToWidth >= 1.15 && lengthToWidth <= 1.7) scores.Oval += 1;

  if (foreheadToJaw >= 1.05 && foreheadToJaw <= 1.25) scores.Oval += 3;
  else if (foreheadToJaw >= 1.0 && foreheadToJaw <= 1.3) scores.Oval += 1;

  if (foreheadToCheek >= 0.85 && foreheadToCheek <= 0.98) scores.Oval += 2;
  if (cheekToJaw >= 1.05 && cheekToJaw <= 1.25) scores.Oval += 2;
  if (jawAngleSharpness > 130 && jawAngleSharpness < 145) scores.Oval += 2; // softly rounded jaw

  // ─── ROUND ─── (Width nearly equals length)
  // Face length approximately equals width, all widths similar, very rounded jaw
  if (lengthToWidth >= 1.0 && lengthToWidth <= 1.2) scores.Round += 4;
  else if (lengthToWidth >= 0.9 && lengthToWidth <= 1.3) scores.Round += 2;
  else if (lengthToWidth < 0.9 || lengthToWidth > 1.3) scores.Round -= 1;

  if (Math.abs(foreheadToJaw - 1) < 0.1) scores.Round += 3;
  else if (Math.abs(foreheadToJaw - 1) < 0.15) scores.Round += 1;

  if (cheekToJaw >= 1.0 && cheekToJaw <= 1.12) scores.Round += 2;
  if (Math.abs(foreheadToCheek - 1) < 0.1) scores.Round += 1;
  if (jawAngleSharpness > 140) scores.Round += 3; // very rounded jaw
  else if (jawAngleSharpness > 135) scores.Round += 1;

  // ─── SQUARE ─── (Strong angular features)
  // Face width close to length, strong angular jaw, forehead and jaw nearly equal width
  if (lengthToWidth >= 1.0 && lengthToWidth <= 1.25) scores.Square += 3;
  else if (lengthToWidth >= 0.9 && lengthToWidth <= 1.3) scores.Square += 1;

  if (Math.abs(foreheadToJaw - 1) < 0.08) scores.Square += 4; // Key indicator
  else if (Math.abs(foreheadToJaw - 1) < 0.12) scores.Square += 2;

  if (cheekToJaw >= 0.95 && cheekToJaw <= 1.1) scores.Square += 2;
  if (Math.abs(foreheadToCheek - 1) < 0.1) scores.Square += 1;

  if (jawAngleSharpness < 120) scores.Square += 4; // sharp angular jaw (key feature)
  else if (jawAngleSharpness < 130) scores.Square += 2;
  else if (jawAngleSharpness > 135) scores.Square -= 2; // penalize rounded jaw

  // ─── HEART ─── (Wide forehead, narrow pointed chin)
  // Wide forehead, progressively narrowing to pointed chin
  if (foreheadToJaw > 1.3) scores.Heart += 4; // Key indicator
  else if (foreheadToJaw > 1.2) scores.Heart += 2;
  else if (foreheadToJaw > 1.1) scores.Heart += 1;

  if (foreheadToCheek > 0.95) scores.Heart += 2; // forehead nearly as wide as cheeks
  else if (foreheadToCheek > 0.88) scores.Heart += 1;

  if (cheekToJaw > 1.25) scores.Heart += 2;
  else if (cheekToJaw > 1.15) scores.Heart += 1;

  if (lengthToWidth >= 1.2 && lengthToWidth <= 1.6) scores.Heart += 1;
  if (jawAngleSharpness > 125) scores.Heart += 1; // pointed/narrow chin

  // ─── DIAMOND ─── (Prominent cheekbones, narrow forehead and jaw)
  // Cheekbones are distinctly the widest, narrow forehead AND narrow jaw
  if (foreheadToCheek < 0.82) scores.Diamond += 4; // forehead much narrower than cheeks (key)
  else if (foreheadToCheek < 0.88) scores.Diamond += 2;
  else if (foreheadToCheek < 0.92) scores.Diamond += 1;

  if (cheekToJaw > 1.25) scores.Diamond += 3; // cheeks wider than jaw (key)
  else if (cheekToJaw > 1.15) scores.Diamond += 2;

  if (foreheadToJaw > 1.02 && foreheadToJaw < 1.2) scores.Diamond += 2; // both narrow
  if (lengthToWidth >= 1.25 && lengthToWidth <= 1.6) scores.Diamond += 1;

  // ─── OBLONG ─── (Long narrow face)
  // Face significantly longer than wide, similar widths across (parallel sides)
  if (lengthToWidth > 1.6) scores.Oblong += 5; // Key indicator
  else if (lengthToWidth > 1.5) scores.Oblong += 3;
  else if (lengthToWidth > 1.4) scores.Oblong += 1;
  else if (lengthToWidth < 1.3) scores.Oblong -= 1;

  if (Math.abs(foreheadToJaw - 1) < 0.12) scores.Oblong += 2; // parallel sides
  else if (Math.abs(foreheadToJaw - 1) < 0.18) scores.Oblong += 1;

  if (Math.abs(foreheadToCheek - 1) < 0.1) scores.Oblong += 1;
  if (Math.abs(cheekToJaw - 1) < 0.12) scores.Oblong += 1;

  // ─── TRIANGLE / PEAR ─── (Narrow forehead, wide jaw)
  // Jaw wider than forehead - opposite of heart shape
  if (foreheadToJaw < 0.8) scores.Triangle += 5; // Key indicator
  else if (foreheadToJaw < 0.9) scores.Triangle += 3;
  else if (foreheadToJaw < 0.95) scores.Triangle += 1;

  if (cheekToJaw < 1.08) scores.Triangle += 2; // jaw nearly as wide as cheeks
  else if (cheekToJaw < 1.15) scores.Triangle += 1;

  if (foreheadToCheek < 0.9) scores.Triangle += 1; // narrow forehead
  if (lengthToWidth >= 1.1 && lengthToWidth <= 1.5) scores.Triangle += 1;

  // ─── Find winner ───
  const sorted = (Object.entries(scores) as [FaceShape, number][]).sort((a, b) => b[1] - a[1]);
  const bestShape = sorted[0][0];
  const bestScore = sorted[0][1];
  const secondScore = sorted[1][1];
  const thirdScore = sorted[2][1];

  // Enhanced confidence calculation:
  // 1. Absolute score quality (how well it matches)
  // 2. Separation from second-best (margin)
  // 3. Separation from third (clear winner vs ambiguous)
  const maxPossible = 15; // Adjusted for new scoring weights
  const margin1 = Math.max(0, bestScore - secondScore);
  const margin2 = Math.max(0, secondScore - thirdScore);

  // Base confidence from absolute score
  const baseConfidence = Math.min(60, (bestScore / maxPossible) * 60);

  // Bonus from clear separation
  const marginBonus = Math.min(30, (margin1 / 5) * 30);

  // Small bonus if second is also clearly ahead of third (reduces ambiguity)
  const clarityBonus = Math.min(10, (margin2 / 3) * 10);

  const confidence = Math.round(baseConfidence + marginBonus + clarityBonus);

  // Clamp confidence between 35-98 (never 100% certain, never too low if we got a match)
  return { shape: bestShape, confidence: Math.max(35, Math.min(98, confidence)) };
}

export function processFaceDetection(
  landmarks: Array<{ x: number; y: number; z: number }>,
  imageWidth: number,
  capturedImage: string
): FaceDetectionResult {
  // Validate face pose and quality
  const poseValidation = validateFacePose(landmarks);

  // Extract measurements and ratios
  const { measurements, ratios } = extractMeasurements(landmarks);

  // Classify face shape
  let { shape: faceShape, confidence } = classifyFaceShape(ratios);

  // Adjust confidence based on pose quality
  // Poor pose reduces confidence even if shape match is good
  confidence = Math.round(confidence * (poseValidation.score / 100));

  // Get frame suggestions and size
  const frameSuggestion = getFrameSuggestions(faceShape);
  const frameSize = calculateFrameSize(measurements.cheekboneWidthMm);

  return {
    faceShape,
    frameSize,
    frameSuggestion,
    faceImage: capturedImage,
    measurements,
    confidence: Math.max(25, confidence), // Floor at 25%
    ratios,
    poseWarnings: poseValidation.warnings,
    poseQuality: poseValidation.score,
  };
}

/** Returns the face contour landmark indices for overlay drawing */
export function getFaceContourIndices(): readonly number[] {
  return L.CONTOUR;
}

/** Returns key measurement landmark pairs for overlay drawing */
export function getMeasurementLandmarks() {
  return {
    faceLength: [L.FOREHEAD_TOP, L.CHIN_BOTTOM],
    foreheadWidth: [L.LEFT_FOREHEAD_OUTER, L.RIGHT_FOREHEAD_OUTER],
    cheekboneWidth: [L.LEFT_CHEEKBONE, L.RIGHT_CHEEKBONE],
    jawWidth: [L.LEFT_JAW_ANGLE, L.RIGHT_JAW_ANGLE],
    templeWidth: [L.LEFT_TEMPLE, L.RIGHT_TEMPLE],
    noseBridge: [L.NOSE_BRIDGE_LEFT, L.NOSE_BRIDGE_RIGHT],
    eyes: [L.LEFT_EYE_OUTER, L.RIGHT_EYE_OUTER],
  };
}
