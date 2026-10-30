import type { DecisionId, FinalCheck, Hotspot, MediaConfig, PerspectivesScreen, ScoredDecision } from './types';

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

export const perspectivesScreen: PerspectivesScreen = {
  heading: 'Ein Vorfall – zwei rechtliche Perspektiven',
  text: 'Notwehr ist sowohl im Strafrecht als auch im Zivilrecht geregelt.',
  blocks: [
    { norm: '§ 32 StGB', text: 'Strafrechtliche Rechtfertigung.' },
    { norm: '§ 227 BGB', text: 'Zivilrechtliche Rechtfertigung, etwa bei Schadensersatzforderungen.' },
  ],
  conclusion: 'Sind die Voraussetzungen erfüllt, ist die gebotene Verteidigung nicht rechtswidrig.',
  cta: 'Wissen anwenden',
};

/** Markers for task 1, placed on dog-freeze.jpg (frame at 2.6 s, 1920×1080). */
export const caseHotspots: Pick<Hotspot, 'id' | 'label' | 'marker' | 'region'>[] = [
  {
    id: 'dog_basis',
    label: 'Einwirkung auf den Hund',
    // Dog body ≈ x 60–790 px, y 640–1000 px; marker on the shoulder.
    marker: { x: 0.27, y: 0.66 },
    region: { x: 0.025, y: 0.585, w: 0.39, h: 0.345 },
  },
  {
    id: 'bottle_basis',
    label: 'Verwendung der Glasflasche',
    // Green bottle in the guest's hand ≈ x 1485–1640 px, y 580–690 px.
    marker: { x: 0.815, y: 0.585 },
    region: { x: 0.768, y: 0.528, w: 0.092, h: 0.116 },
  },
];

/**
 * Clip: public/media/dog-bottle.mp4 (copy of dog-bottle.mp4 from the project root), 1920×1080, ~5 s.
 * The dog shows its teeth and moves towards the colleague between ~1.5 and 3 s, then calms down;
 * the freeze at 2.6 s keeps the threat and the bottle visible.
 */
const caseMedia: MediaConfig = {
  id: 'dog',
  title: 'Video: Ein Vorfall am Eingang',
  src: media('dog-bottle.mp4'),
  poster: media('dog-poster.jpg'),
  freezeFrame: media('dog-freeze.jpg'),
  pauseAtSeconds: 2.6,
  width: 1920,
  height: 1080,
  hasAudio: true,
  transcript: [
    'Vor dem Eingang eines Gebäudes nähert sich ein Hund dem Sicherheitsmitarbeiter drohend und zeigt die Zähne.',
    'Ein unbeteiligter Gast steht daneben und hält eine Glasflasche.',
    'Die Szene wird angehalten, während der Hund droht.',
  ],
  hotspots: [],
};

const basisOptions = [
  { id: 'notwehr', label: 'Notwehr · § 227 BGB' },
  { id: 'defensive', label: 'Defensiver Notstand · § 228 BGB' },
  { id: 'aggressive', label: 'Aggressiver Notstand · § 904 BGB' },
];

const perspectiveOptions = [
  { id: 'stgb', label: '§ 32 StGB' },
  { id: 'bgb', label: '§ 227 BGB' },
];

const decisions: Record<DecisionId, ScoredDecision> = {
  dog_basis: {
    id: 'dog_basis',
    label: 'Einwirkung auf den Hund',
    prompt: 'Einwirkung auf den Hund',
    options: basisOptions,
    correct: 'defensive',
    feedback:
      'Die Gefahr geht vom Hund aus. Für die Einwirkung auf ihn ist der defensive Notstand nach § 228 BGB zu prüfen. Tiere sind keine Sachen; die Vorschriften über Sachen gelten grundsätzlich entsprechend (§ 90a BGB).',
  },
  bottle_basis: {
    id: 'bottle_basis',
    label: 'Verwendung der Glasflasche',
    prompt: 'Verwendung der Glasflasche',
    options: basisOptions,
    correct: 'aggressive',
    feedback:
      'Von der Flasche geht keine Gefahr aus. Sie ist eine unbeteiligte Sache. Für ihre Verwendung zur Gefahrenabwehr ist § 904 BGB zu prüfen.',
  },
  defensive_conditions: {
    id: 'defensive_conditions',
    label: 'Voraussetzung des § 228 BGB',
    prompt: 'Welche Voraussetzung gehört zu § 228 BGB?',
    options: [
      { id: 'required', label: 'Die Abwehr ist erforderlich; der Schaden steht nicht außer Verhältnis zur Gefahr.' },
      { id: 'any', label: 'Sobald eine Gefahr besteht, ist jede Abwehrmaßnahme erlaubt.' },
    ],
    correct: 'required',
    feedback:
      'Eine Gefahr allein genügt nicht. Die Abwehr muss erforderlich sein; der Schaden darf nicht außer Verhältnis zur Gefahr stehen.',
  },
  aggressive_conditions: {
    id: 'aggressive_conditions',
    label: 'Voraussetzung des § 904 BGB',
    prompt: 'Welche Voraussetzung gehört zu § 904 BGB?',
    options: [
      { id: 'equal', label: 'Der Sachschaden und der drohende Schaden müssen ungefähr gleich groß sein.' },
      {
        id: 'disproportionate',
        label:
          'Der Eingriff ist zur Abwehr der gegenwärtigen Gefahr notwendig; der drohende Schaden ist gegenüber dem Sachschaden unverhältnismäßig groß.',
      },
    ],
    correct: 'disproportionate',
    feedback:
      'Bei § 904 muss der drohende Schaden gegenüber dem Schaden an der unbeteiligten Sache unverhältnismäßig groß sein. Ungefähr gleiche Schäden genügen dafür nicht.',
  },
  compensation: {
    id: 'compensation',
    label: 'Ersatzansprüche',
    prompt: 'Welche Aussage trifft unter den beschriebenen Voraussetzungen zu?',
    options: [
      { id: 'a', label: 'War das Handeln gerechtfertigt, kann niemand Ersatz verlangen.' },
      {
        id: 'b',
        label:
          'Die Abwehr gegenüber dem Hund ist gerechtfertigt. Für einen entstandenen Schaden an der Flasche kann ihr Eigentümer nach § 904 BGB Ersatz verlangen.',
      },
      { id: 'c', label: 'Die Forderung des Hundehalters beweist, dass die Abwehr rechtswidrig war.' },
    ],
    correct: 'b',
    feedback: {
      a: 'Eine gerechtfertigte Einwirkung schließt Ersatzansprüche nicht immer aus. § 904 BGB sieht einen Ersatzanspruch des Eigentümers vor.',
      b: 'Richtig. Im Fall sind die Voraussetzungen des § 228 erfüllt und Sie haben die Gefahr nicht selbst verschuldet. Der Eigentümer der unbeteiligten Flasche kann dennoch Ersatz eines tatsächlich entstandenen Schadens verlangen.',
      c: 'Eine Forderung allein beweist keine Rechtswidrigkeit. Entscheidend sind die Voraussetzungen der jeweiligen Norm.',
    },
  },
  notwehr_basis: {
    id: 'notwehr_basis',
    label: 'Grundlage bei einem menschlichen Angriff',
    prompt: 'Welche Grundlage passt?',
    options: [
      { id: 'aggressive', label: 'Aggressiver Notstand · § 904 BGB' },
      { id: 'nothilfe', label: 'Notwehr in Form der Nothilfe · § 227 BGB' },
      { id: 'defensive', label: 'Defensiver Notstand · § 228 BGB' },
    ],
    correct: 'nothilfe',
    feedback:
      'Sie wehren einen gegenwärtigen rechtswidrigen Angriff auf eine andere Person ab. Diese Form der Notwehr heißt Nothilfe.',
  },
  criminal_perspective: {
    id: 'criminal_perspective',
    label: 'Strafrechtliche Rechtfertigung',
    prompt: 'Strafrechtliche Rechtfertigung der Notwehr',
    options: perspectiveOptions,
    correct: 'stgb',
  },
  civil_perspective: {
    id: 'civil_perspective',
    label: 'Zivilrechtliche Rechtfertigung',
    prompt: 'Zivilrechtliche Rechtfertigung, etwa bei Schadensersatzforderungen',
    options: perspectiveOptions,
    correct: 'bgb',
  },
};

export const finalCheck: FinalCheck = {
  stage: 'anwenden',
  scene: {
    heading: 'Ein Vorfall am Eingang',
    context: 'Sie sind als Sicherheitsmitarbeiter im Einsatz. Beobachten Sie die Situation.',
  },
  media: caseMedia,
  continuation: {
    heading: 'Der weitere Verlauf',
    text: 'Sie nehmen dem Gast die Glasflasche aus der Hand und schlagen damit den Hund. Der Hund stirbt. Sein Halter verlangt Schadensersatz.',
  },
  conditions: {
    heading: 'Für diese Aufgabe gilt:',
    items: [
      'Es drohte eine schwere Verletzung.',
      'Eine gleich wirksame, weniger schädliche Abwehr stand nicht zur Verfügung.',
      'Sie handelten, um die Gefahr abzuwehren.',
      'Sie haben die Gefahr nicht selbst verschuldet.',
      'Der Hund wurde nicht von einem Menschen zum Angriff eingesetzt.',
    ],
  },
  kicker: 'Selbstcheck',
  tasks: [
    {
      id: 'assign',
      heading: 'Ordnen Sie die beiden Eingriffe rechtlich zu.',
      decisions: ['dog_basis', 'bottle_basis'],
      submitLabel: 'Zuordnung prüfen',
      showCaseImage: true,
    },
    {
      id: 'conditions',
      heading: 'Die Rechtsgrundlage allein reicht nicht.',
      decisions: ['defensive_conditions', 'aggressive_conditions'],
      submitLabel: 'Begründungen prüfen',
      showCaseImage: true,
    },
    {
      id: 'compensation',
      heading: 'Wer kann Ersatz verlangen?',
      decisions: ['compensation'],
      submitLabel: 'Antwort prüfen',
      showCaseImage: true,
    },
    {
      id: 'notwehr',
      heading: 'Und bei einem menschlichen Angriff?',
      scenario:
        'Ein Besucher versucht gerade, einen Gast rechtswidrig zu schlagen. Sie wehren den Schlag mit einer erforderlichen und gebotenen Verteidigung ab.',
      decisions: ['notwehr_basis'],
      submitLabel: 'Antwort prüfen',
    },
    {
      id: 'perspectives',
      heading: 'Warum zwei Gesetze?',
      instruction: 'Ordnen Sie die rechtliche Perspektive zu.',
      decisions: ['criminal_perspective', 'civil_perspective'],
      submitLabel: 'Zuordnung prüfen',
      feedback:
        '§ 32 StGB betrifft die strafrechtliche, § 227 BGB die zivilrechtliche Rechtfertigung der Notwehr. Ein Vorfall kann aus beiden Perspektiven beurteilt werden.',
    },
  ],
  decisions,
  result: {
    heading: 'Ihr Ergebnis',
    allCorrect: 'Alle acht Entscheidungen sind richtig.',
    memoHeading: 'Zum Mitnehmen',
    memo: [
      'Notwehr: einen gegenwärtigen rechtswidrigen Angriff abwehren.',
      'Defensiver Notstand: auf die Sache einwirken, von der die Gefahr ausgeht.',
      'Aggressiver Notstand: eine unbeteiligte Sache zur Gefahrenabwehr in Anspruch nehmen.',
      'Prüfen Sie immer die Voraussetzungen und mögliche Ersatzansprüche.',
    ],
    reviewLabel: 'Fehler gezielt wiederholen',
    restartLabel: 'Neu starten',
    restartConfirm: 'Ihre Antworten werden gelöscht. Was möchten Sie neu starten?',
    restartCheckLabel: 'Nur die Abschlussprüfung',
    restartCourseLabel: 'Die gesamte Lerneinheit',
  },
};

/** Feedback text of a decision for the given answer. */
export function feedbackFor(decision: ScoredDecision, answer: string | undefined): string | null {
  if (!decision.feedback) return null;
  if (typeof decision.feedback === 'string') return decision.feedback;
  return answer ? (decision.feedback[answer] ?? null) : null;
}
