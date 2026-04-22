/**
 * Pose Analyzer — real-time posture feedback using MediaPipe landmarks.
 * Calculates joint angles and validates against exercise-specific rules.
 *
 * MediaPipe Pose landmark indices (33 points):
 * 11=left_shoulder, 12=right_shoulder
 * 13=left_elbow,    14=right_elbow
 * 15=left_wrist,    16=right_wrist
 * 23=left_hip,      24=right_hip
 * 25=left_knee,     26=right_knee
 * 27=left_ankle,    28=right_ankle
 */

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PoseFeedback {
  isGood: boolean;
  messages: string[];       // Active issues ("Joelho muito para dentro!")
  positives: string[];      // Correct aspects ("Boa profundidade!")
  overallScore: number;     // 0-100
}

export interface ExercisePoseRule {
  name: string;
  check: (landmarks: PoseLandmark[]) => { ok: boolean; message: string; positive?: string };
}

// ─── Geometry helpers ─────────────────────────────────────────────────────────

function angleBetween(a: PoseLandmark, b: PoseLandmark, c: PoseLandmark): number {
  const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(radians * (180 / Math.PI));
  if (angle > 180) angle = 360 - angle;
  return angle;
}

function isVisible(lm: PoseLandmark, threshold = 0.5): boolean {
  return (lm.visibility ?? 1) >= threshold;
}

function avgLandmark(a: PoseLandmark, b: PoseLandmark): PoseLandmark {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1) };
}

// ─── Exercise-specific rule sets ──────────────────────────────────────────────

const SQUAT_RULES: ExercisePoseRule[] = [
  {
    name: 'knee_depth',
    check(lm) {
      if (!isVisible(lm[25]) || !isVisible(lm[23]) || !isVisible(lm[27])) return { ok: true, message: '' };
      const angle = angleBetween(lm[23], lm[25], lm[27]); // hip-knee-ankle
      if (angle > 160) return { ok: false, message: 'Desça mais — tente chegar a 90°' };
      if (angle < 60)  return { ok: false, message: 'Descida excessiva — risco lombar' };
      return { ok: true, message: '', positive: 'Boa profundidade! ✓' };
    },
  },
  {
    name: 'knee_valgus',
    check(lm) {
      if (!isVisible(lm[23]) || !isVisible(lm[25]) || !isVisible(lm[27])) return { ok: true, message: '' };
      const hipX  = lm[23].x;
      const kneeX = lm[25].x;
      const ankleX = lm[27].x;
      const deviation = Math.abs(kneeX - (hipX + ankleX) / 2);
      if (deviation > 0.06) return { ok: false, message: 'Joelho caindo para dentro — empurre os joelhos para fora' };
      return { ok: true, message: '', positive: 'Alinhamento do joelho ótimo ✓' };
    },
  },
  {
    name: 'torso_angle',
    check(lm) {
      if (!isVisible(lm[11]) || !isVisible(lm[23])) return { ok: true, message: '' };
      const shoulder = avgLandmark(lm[11], lm[12]);
      const hip = avgLandmark(lm[23], lm[24]);
      const angleFromVertical = Math.abs(Math.atan2(shoulder.x - hip.x, hip.y - shoulder.y) * (180 / Math.PI));
      if (angleFromVertical > 45) return { ok: false, message: 'Tronco muito inclinado — mantenha o peito alto' };
      return { ok: true, message: '' };
    },
  },
];

const PUSH_RULES: ExercisePoseRule[] = [
  {
    name: 'elbow_angle',
    check(lm) {
      if (!isVisible(lm[11]) || !isVisible(lm[13]) || !isVisible(lm[15])) return { ok: true, message: '' };
      const angle = angleBetween(lm[11], lm[13], lm[15]); // shoulder-elbow-wrist
      if (angle < 50)  return { ok: false, message: 'Cotovelo muito fechado — abra levemente' };
      if (angle > 110) return { ok: false, message: 'Cotovelo muito aberto — risco de ombro' };
      return { ok: true, message: '', positive: 'Ângulo de cotovelo ideal ✓' };
    },
  },
  {
    name: 'wrist_alignment',
    check(lm) {
      if (!isVisible(lm[13]) || !isVisible(lm[15])) return { ok: true, message: '' };
      const elbowX = lm[13].x;
      const wristX = lm[15].x;
      if (Math.abs(wristX - elbowX) > 0.08) return { ok: false, message: 'Punho desalinhado com o cotovelo' };
      return { ok: true, message: '' };
    },
  },
];

const PULL_RULES: ExercisePoseRule[] = [
  {
    name: 'elbow_pulldown',
    check(lm) {
      if (!isVisible(lm[11]) || !isVisible(lm[13])) return { ok: true, message: '' };
      const shoulderY = lm[11].y;
      const elbowY    = lm[13].y;
      if (elbowY < shoulderY) return { ok: false, message: 'Puxe mais — cotovelo deve passar pelo ombro' };
      return { ok: true, message: '', positive: 'Boa amplitude de puxada ✓' };
    },
  },
  {
    name: 'shoulder_retraction',
    check(lm) {
      if (!isVisible(lm[11]) || !isVisible(lm[12])) return { ok: true, message: '' };
      const shoulderWidth = Math.abs(lm[11].x - lm[12].x);
      if (shoulderWidth < 0.15) return { ok: false, message: 'Retraia as escápulas — abra mais o peito' };
      return { ok: true, message: '', positive: 'Boa retração escapular ✓' };
    },
  },
];

const HINGE_RULES: ExercisePoseRule[] = [
  {
    name: 'spine_neutral',
    check(lm) {
      if (!isVisible(lm[11]) || !isVisible(lm[23]) || !isVisible(lm[25])) return { ok: true, message: '' };
      const shoulder = avgLandmark(lm[11], lm[12]);
      const hip      = avgLandmark(lm[23], lm[24]);
      const knee     = avgLandmark(lm[25], lm[26]);
      const spineAngle = angleBetween(shoulder, hip, knee);
      if (spineAngle < 120) return { ok: false, message: 'Coluna arredondada — mantenha a coluna neutra!' };
      return { ok: true, message: '', positive: 'Coluna neutra ✓' };
    },
  },
  {
    name: 'hip_hinge',
    check(lm) {
      if (!isVisible(lm[23]) || !isVisible(lm[25])) return { ok: true, message: '' };
      const hipY  = lm[23].y;
      const kneeY = lm[25].y;
      if (hipY > kneeY + 0.05) return { ok: false, message: 'Empurre o quadril mais para trás' };
      return { ok: true, message: '' };
    },
  },
];

const PLANK_RULES: ExercisePoseRule[] = [
  {
    name: 'hip_alignment',
    check(lm) {
      if (!isVisible(lm[11]) || !isVisible(lm[23]) || !isVisible(lm[27])) return { ok: true, message: '' };
      const shoulder = avgLandmark(lm[11], lm[12]);
      const hip      = avgLandmark(lm[23], lm[24]);
      const ankle    = avgLandmark(lm[27], lm[28]);
      const bodyAngle = angleBetween(shoulder, hip, ankle);
      if (bodyAngle < 160) return { ok: false, message: 'Quadril caindo — eleve o quadril e contraia o glúteo' };
      if (bodyAngle > 200) return { ok: false, message: 'Quadril muito alto — alinhe com o corpo' };
      return { ok: true, message: '', positive: 'Alinhamento perfeito ✓' };
    },
  },
];

// ─── Rule registry by padrao_motor ────────────────────────────────────────────

const RULES_BY_PATTERN: Record<string, ExercisePoseRule[]> = {
  squat:  SQUAT_RULES,
  hinge:  HINGE_RULES,
  push:   PUSH_RULES,
  pull:   PULL_RULES,
  core:   PLANK_RULES,
};

// ─── Main analyzer ────────────────────────────────────────────────────────────

/**
 * Analyze MediaPipe pose landmarks for a given exercise motor pattern.
 * Call this on every MediaPipe onResults frame.
 *
 * @param landmarks - Array of 33 PoseLandmark from MediaPipe
 * @param padrao_motor - Exercise type: 'squat' | 'hinge' | 'push' | 'pull' | 'core'
 */
export function analyzePose(landmarks: PoseLandmark[], padrao_motor: string): PoseFeedback {
  const rules = RULES_BY_PATTERN[padrao_motor] || [];
  const messages: string[] = [];
  const positives: string[] = [];
  let issueCount = 0;

  for (const rule of rules) {
    const result = rule.check(landmarks);
    if (!result.ok && result.message) {
      messages.push(result.message);
      issueCount++;
    } else if (result.positive) {
      positives.push(result.positive);
    }
  }

  const totalRules = rules.length || 1;
  const overallScore = Math.round(((totalRules - issueCount) / totalRules) * 100);

  return {
    isGood: issueCount === 0,
    messages,
    positives,
    overallScore,
  };
}

/**
 * Get CSS color class for overlay based on score.
 */
export function getFeedbackColor(score: number): string {
  if (score >= 85) return '#22c55e'; // green
  if (score >= 60) return '#f59e0b'; // yellow
  return '#ef4444';                  // red
}

/**
 * Get human-readable label for a padrao_motor type.
 */
export function getPatternLabel(padrao_motor: string): string {
  const labels: Record<string, string> = {
    squat: 'Agachamento',
    hinge: 'Dobradiça de Quadril',
    push:  'Empurrar',
    pull:  'Puxar',
    core:  'Core / Prancha',
    cardio:'Cardio',
  };
  return labels[padrao_motor] || padrao_motor;
}
