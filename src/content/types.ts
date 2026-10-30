/** Relative point/box on the source image: 0..1 of its natural width/height. */
export interface RelPoint {
  x: number;
  y: number;
}

export interface RelBox extends RelPoint {
  w: number;
  h: number;
}

export interface Hotspot {
  id: string;
  /** Accessible name and label of the duplicate button in the panel. */
  label: string;
  /** Marker position on the freeze frame. */
  marker: RelPoint;
  /** Area highlighted when the hotspot is active. */
  region: RelBox;
  title: string;
  text: string;
}

export interface MediaConfig {
  id: string;
  /** Accessible name of the video element. */
  title: string;
  src: string;
  poster: string;
  freezeFrame: string;
  /** Video stops here and the freeze frame takes over. Chosen after viewing the clip. */
  pauseAtSeconds: number;
  /** Natural size of the clip; replaced by real metadata once loaded. */
  width: number;
  height: number;
  /** The clip has an audio track. Playback always starts muted. */
  hasAudio: boolean;
  /** Text alternative: describes only what is visible in the clip. */
  transcript: string[];
  hotspots: Hotspot[];
}

export interface DecisionOption {
  id: string;
  label: string;
  correct: boolean;
  feedback: string;
}

export interface Decision {
  heading: string;
  scenario: string;
  question: string;
  options: DecisionOption[];
}

export interface Summary {
  title: string;
  text: string;
}

export interface LegalSource {
  label: string;
  title: string;
  href: string;
}

/** One finished fragment of the lesson: video → freeze → analysis → decision → complete. */
export interface Segment {
  id: string;
  stage: 'verstehen' | 'unterscheiden' | 'anwenden';
  intro: {
    caption: string;
    title: string;
    lead: string;
    meta: string;
    cta: string;
    mediaNote: string;
  };
  scene: {
    heading: string;
    context: string;
  };
  analysis: {
    heading: string;
    instruction: string;
    premise: string;
    summary: Summary;
  };
  media: MediaConfig;
  decision: Decision;
  /** Label of the button that leads to the next episode after the feedback. */
  nextLabel: string;
}

export type Stage = Segment['stage'];

export interface ChoiceOption {
  id: string;
  label: string;
}

/** Episode "Dachziegel": observe → continuation → compare → § 228. */
export interface RoofEpisode {
  id: string;
  stage: Stage;
  scene: { heading: string; context: string };
  media: MediaConfig;
  continuation: { heading: string; text: string };
  compare: {
    heading: string;
    instruction: string;
    /** Revealed one after another; both mark the same area of the frame. */
    items: { label: string; text: string; highlightLabel: string }[];
    region: RelBox;
    question: string;
    options: DecisionOption[];
    submitLabel: string;
  };
  rule: { heading: string; text: string };
  consequences: { heading: string; application: string; addition: string; note: string };
  nextLabel: string;
}

/** Optional continuation clip of a branch. `available: false` → text continuation only. */
export interface BranchVideo {
  src: string;
  poster?: string;
  available: boolean;
  /** Playback (and replay) starts here, e.g. to skip an unnatural opening. The file stays untouched. */
  startAt?: number;
}

export interface DoorBranch {
  id: string;
  choice: string;
  heading: string;
  text: string;
  feedback: string;
  /** Matches the legal assessment under the given conditions. Used for styling + icon only. */
  consistent: boolean;
  video: BranchVideo;
}

/** Episode "Verschlossene Tür": observe → conditions → choice → branch → § 904. */
export interface DoorEpisode {
  id: string;
  stage: Stage;
  scene: { heading: string; context: string };
  media: MediaConfig;
  conditions: { heading: string; items: string[] };
  question: string;
  submitLabel: string;
  branches: DoorBranch[];
  rule: { heading: string; text: string; application: string; purpose: string; consequence: string };
  comparison: string[];
  comparisonNote: string;
  nextLabel: string;
}

// ---------- Abschluss: Perspektiven, Fall „Hund und Flasche“, Selbstcheck ----------

export interface PerspectivesScreen {
  heading: string;
  text: string;
  blocks: { norm: string; text: string }[];
  conclusion: string;
  cta: string;
}

/** The eight scored decisions of the final check. */
export type DecisionId =
  | 'dog_basis'
  | 'bottle_basis'
  | 'defensive_conditions'
  | 'aggressive_conditions'
  | 'compensation'
  | 'notwehr_basis'
  | 'criminal_perspective'
  | 'civil_perspective';

export interface ScoredDecision {
  id: DecisionId;
  /** Short name in the result list and in the repetition. */
  label: string;
  /** Question or row label shown above the options. */
  prompt: string;
  options: ChoiceOption[];
  correct: string;
  /** One text for every answer, or one per chosen option. Absent: the task's shared feedback. */
  feedback?: string | Record<string, string>;
}

export type TaskId = 'assign' | 'conditions' | 'compensation' | 'notwehr' | 'perspectives';

export interface FinalTask {
  id: TaskId;
  heading: string;
  instruction?: string;
  scenario?: string;
  decisions: DecisionId[];
  submitLabel: string;
  /** Shared feedback after checking, shown once for the whole task. */
  feedback?: string;
  /** Show the case still as a small image for context. */
  showCaseImage?: boolean;
}

export interface FinalCheck {
  stage: Stage;
  scene: { heading: string; context: string };
  media: MediaConfig;
  continuation: { heading: string; text: string };
  conditions: { heading: string; items: string[] };
  kicker: string;
  tasks: FinalTask[];
  decisions: Record<DecisionId, ScoredDecision>;
  result: {
    heading: string;
    allCorrect: string;
    memoHeading: string;
    memo: string[];
    reviewLabel: string;
    restartLabel: string;
    restartConfirm: string;
    restartCheckLabel: string;
    restartCourseLabel: string;
  };
}
