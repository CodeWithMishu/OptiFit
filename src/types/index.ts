export interface PrescriptionEye {
  spherical: number | null;
  cylindrical: number | null;
  axis: number | null;
  prism: number | null;
  base: string;
}

export interface Prescription {
  rightEye: PrescriptionEye;
  leftEye: PrescriptionEye;
}

export interface UserFormData {
  name: string;
  age: number;
  dob: string;
  gender: string;
  address: string;
  wardNo: string;
  boothNo: string;
  mobile: string;
  prescription: Prescription;
}

export interface FaceDetectionResult {
  faceShape: FaceShape;
  frameSize: string;
  frameSuggestion: FrameRecommendation[];
  faceImage: string;
  measurements: FaceMeasurements;
  confidence: number;
  ratios: FaceRatios;
  poseWarnings?: string[];
  poseQuality?: number;
}

export interface FaceMeasurements {
  faceLengthMm: number;
  foreheadWidthMm: number;
  cheekboneWidthMm: number;
  jawWidthMm: number;
  templeWidthMm: number;
  noseBridgeWidthMm: number;
}

export interface FaceRatios {
  lengthToWidth: number;
  foreheadToJaw: number;
  cheekToJaw: number;
  foreheadToCheek: number;
  jawAngleSharpness: number;
}

export type FaceShape = 'Oval' | 'Round' | 'Square' | 'Heart' | 'Diamond' | 'Oblong' | 'Triangle';

export interface FrameRecommendation {
  type: string;
  reason: string;
  priority: 'best' | 'good' | 'okay';
  bridgeFit?: 'narrow' | 'standard' | 'wide';
  prescriptionNote?: string;
}

export interface RecommendationContext {
  faceShape: FaceShape;
  measurements: FaceMeasurements;
  prescription?: Prescription;
  age?: number;
  gender?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  message?: string;
  errors?: Array<{ msg: string; path: string }>;
}
