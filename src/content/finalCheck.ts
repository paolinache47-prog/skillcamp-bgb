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

const dogBasisFeedback =
  'Die Gefahr geht vom Hund aus. Für die Einwirkung auf ihn ist der defensive Notstand nach § 228 BGB zu prüfen. Tiere sind keine Sachen; die Vorschriften über Sachen gelten grundsätzlich entsprechend (§ 90a BGB).';

// Correctness is always compared by option id, never by position.
const decisions: Record<DecisionId, ScoredDecision> = {
  dog_basis: {
    id: 'dog_basis',
    label: 'Einwirkung auf den Hund',
    prompt: 'Einwirkung auf den Hund',
    options: basisOptions,
    correct: 'defensive',
    feedback: {
      notwehr:
        'Notwehr setzt einen menschlichen Angriff voraus. In diesem Fall handelt der Hund selbstständig. Deshalb ist § 228 BGB unter Berücksichtigung von § 90a BGB zu prüfen.',
      defensive: dogBasisFeedback,
      aggressive: dogBasisFeedback,
    },
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
    label: 'Voraussetzungen des § 228 BGB',
    prompt: 'Welche Aussage beschreibt die Voraussetzungen des § 228 BGB?',
    options: [
      { id: 'proportion', label: 'Die Abwehr muss erforderlich sein; der verursachte Schaden darf nicht außer Verhältnis zur Gefahr stehen.' },
      { id: 'always_less', label: 'Die Abwehr muss erforderlich sein; der verursachte Schaden muss stets geringer als der drohende Schaden sein.' },
      { id: 'consent', label: 'Die Abwehr muss erforderlich sein; der Eigentümer muss der Beschädigung seiner Sache zuvor zugestimmt haben.' },
    ],
    correct: 'proportion',
    feedback: {
      proportion: 'Richtig. Erforderlichkeit und das Verhältnis zwischen Schaden und Gefahr sind entscheidend.',
      always_less: '§ 228 verlangt nicht, dass der verursachte Schaden stets geringer ist. Er darf nicht außer Verhältnis zur Gefahr stehen.',
      consent: 'Eine vorherige Zustimmung ist keine Voraussetzung des § 228. Entscheidend sind Erforderlichkeit und das Verhältnis zur Gefahr.',
    },
  },
  aggressive_conditions: {
    id: 'aggressive_conditions',
    label: 'Voraussetzungen des § 904 BGB',
    prompt: 'Eine gegenwärtige Gefahr soll durch den Eingriff in eine unbeteiligte Sache abgewendet werden. Welche Aussage passt zu § 904 BGB?',
    options: [
      { id: 'equal', label: 'Der Eingriff muss notwendig sein; der drohende Schaden muss im Vergleich zum verursachten Schaden ungefähr gleich groß sein.' },
      { id: 'disproportionate', label: 'Der Eingriff muss notwendig sein; der drohende Schaden muss gegenüber dem verursachten Schaden unverhältnismäßig groß sein.' },
      { id: 'slightly_more', label: 'Der Eingriff muss notwendig sein; der drohende Schaden muss gegenüber dem verursachten Schaden lediglich etwas größer sein.' },
    ],
    correct: 'disproportionate',
    feedback: {
      equal: 'Ungefähr gleich große Schäden reichen für § 904 nicht aus. Der drohende Schaden muss unverhältnismäßig größer sein.',
      disproportionate: 'Richtig. § 904 verlangt einen notwendigen Eingriff und ein deutlich überwiegendes Schadensrisiko im Sinne des Gesetzes.',
      slightly_more: 'Ein lediglich etwas größerer drohender Schaden reicht nicht. § 904 verlangt, dass er unverhältnismäßig größer ist.',
    },
  },
  compensation: {
    id: 'compensation',
    label: 'Ersatzansprüche',
    prompt:
      'Die Abwehr erfüllt die beschriebenen Voraussetzungen. Sie haben die Gefahr nicht selbst verschuldet. Welche Aussage zum Schadensersatz trifft zu?',
    options: [
      { id: 'owner_only', label: 'Der Hundehalter kann Ersatz verlangen, weil der Hund getötet wurde; der Flascheneigentümer erhält bei gerechtfertigtem Handeln keinen Ersatz.' },
      { id: 'both', label: 'Beide Eigentümer können Ersatz verlangen, weil ihr Eigentum betroffen ist; die Rechtfertigung schützt ausschließlich vor einer strafrechtlichen Bestrafung.' },
      { id: 'bottle_only', label: 'Der Hundehalter hat hier keinen Ersatzanspruch für den Hund; der Flascheneigentümer kann Ersatz eines tatsächlich entstandenen Schadens verlangen.' },
    ],
    correct: 'bottle_only',
    feedback: {
      owner_only: 'Der Tod des Hundes allein begründet hier keinen Ersatzanspruch. Bei § 904 kann trotz zulässigen Eingriffs ein Ersatzanspruch bestehen.',
      both: 'Die Rechtfertigung ist auch zivilrechtlich relevant. Für Hund und Flasche gelten unterschiedliche Regelungen.',
      bottle_only: 'Richtig. Unter den genannten Voraussetzungen ist die Abwehr gegenüber dem Hund gerechtfertigt. § 904 erhält den Anspruch des Flascheneigentümers auf Ersatz eines tatsächlich entstandenen Schadens.',
    },
  },
  notwehr_basis: {
    id: 'notwehr_basis',
    label: 'Begründung des Eingreifens',
    prompt: 'Welche Begründung passt zu Ihrem Eingreifen?',
    options: [
      { id: 'nothilfe', label: 'Sie leisten Nothilfe, weil Sie einen anderen Menschen vor einem gegenwärtigen rechtswidrigen Angriff schützen.' },
      { id: 'defensive', label: 'Sie handeln im defensiven Notstand, weil Sie die gegenwärtige Gefahr unmittelbar an ihrer Quelle abwehren.' },
      { id: 'aggressive', label: 'Sie handeln im aggressiven Notstand, weil Sie zum Schutz eines anderen Menschen vor einer gegenwärtigen Gefahr eingreifen.' },
    ],
    correct: 'nothilfe',
    feedback: {
      nothilfe: 'Richtig. Sie wehren einen menschlichen Angriff auf einen anderen ab. Diese Form der Notwehr heißt Nothilfe.',
      defensive: 'Die Abwehr an der Gefahrenquelle allein macht den Fall nicht zum defensiven Notstand. Hier liegt ein menschlicher Angriff vor.',
      aggressive: 'Der Schutz eines anderen Menschen allein begründet keinen aggressiven Notstand. Hier ist Notwehr in Form der Nothilfe einschlägig.',
    },
  },
  legal_perspectives: {
    id: 'legal_perspectives',
    label: 'StGB und BGB',
    prompt: 'Nach einer Abwehrhandlung erstattet der Angreifer Strafanzeige und verlangt außerdem Schadensersatz. Warum sind hier StGB und BGB relevant?',
    options: [
      { id: 'perspective', label: 'Das StGB betrifft die strafrechtliche Beurteilung; das BGB betrifft mögliche Schadensersatzansprüche.' },
      { id: 'beneficiary', label: 'Das StGB betrifft die Abwehr für andere Personen; das BGB betrifft die Abwehr für die eigene Person.' },
      { id: 'object', label: 'Das StGB betrifft die Verletzung von Personen; das BGB betrifft dagegen ausschließlich Schäden an Sachen.' },
    ],
    correct: 'perspective',
    feedback: {
      perspective: 'Richtig. Derselbe Vorfall kann strafrechtlich und zivilrechtlich beurteilt werden. Für Notwehr sind § 32 StGB und § 227 BGB relevant.',
      beneficiary: 'Beide Vorschriften erfassen die Verteidigung für sich selbst und für andere. Der Unterschied liegt in der rechtlichen Perspektive.',
      object: 'Das BGB betrifft auch Verletzungen von Personen. Entscheidend ist die Unterscheidung zwischen strafrechtlicher Beurteilung und zivilrechtlichen Ansprüchen.',
    },
  },
};

export const finalCheck: FinalCheck = {
  stage: 'anwenden',
  scene: {
    heading: 'Ein Vorfall am Eingang',
    lead: 'Jetzt entscheiden Sie selbst: Ein neuer Vorfall, zwei Eingriffe. Wie beurteilen Sie den Fall?',
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
      'Die Flasche gehört einem unbeteiligten Gast.',
    ],
  },
  kicker: 'Selbstcheck',
  tasks: [
    {
      id: 'assign',
      heading: 'Ordnen Sie die beiden Eingriffe rechtlich zu.',
      decisions: ['dog_basis', 'bottle_basis'],
      submitLabel: 'Zuordnung übernehmen',
      reviewSubmitLabel: 'Zuordnung prüfen',
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
      heading: 'Ein weiterer Vorfall am Empfang',
      scenario:
        'Ein Besucher holt plötzlich aus, um einen unbeteiligten Gast zu schlagen. Sie stoppen den unmittelbar bevorstehenden Schlag, indem Sie den Arm des Besuchers festhalten. Sobald er den Angriff aufgibt, lassen Sie los.',
      decisions: ['notwehr_basis'],
      submitLabel: 'Antwort prüfen',
    },
    {
      id: 'perspectives',
      heading: 'Ein Vorfall, zwei rechtliche Fragen',
      decisions: ['legal_perspectives'],
      submitLabel: 'Antwort prüfen',
    },
  ],
  decisions,
  written: {
    heading: 'Begründen Sie Ihre Zuordnung',
    prompt:
      'Sie erklären den Vorfall Ihrer Einsatzleitung. Warum müssen das Einwirken auf den Hund und die Verwendung der fremden Flasche rechtlich getrennt beurteilt werden? Schreiben Sie 1–2 Sätze.',
    label: 'Ihre Begründung',
    placeholder: 'Formulieren Sie Ihre Erklärung in eigenen Worten.',
    compareLabel: 'Mit Musterlösung vergleichen',
    unsureLabel: 'Ich bin unsicher – Musterlösung ansehen',
    resultHeading: 'Ihre Zuordnung im Vergleich',
    ownHeading: 'Ihre Begründung',
    modelHeading: 'Musterlösung',
    model:
      'Die Gefahr geht vom Hund aus; die Abwehr richtet sich damit gegen die Gefahrenquelle (§ 228 BGB, in Verbindung mit § 90a BGB). Die Flasche gehört einem unbeteiligten Gast. Von ihr geht keine Gefahr aus; ihre Verwendung ist daher nach § 904 BGB zu prüfen.',
    selfChecks: [
      { id: 'source', label: 'Ich habe erklärt, woher die Gefahr kommt.' },
      { id: 'separate', label: 'Ich habe erklärt, warum die beiden Eingriffe unterschiedlich beurteilt werden.' },
    ],
    selfCheckCaption: 'Selbstreflexion – nicht automatisch bewertet.',
  },
  result: {
    heading: 'Ihr Ergebnis',
    allCorrect: 'Sie haben alle sieben Entscheidungen im Selbstcheck richtig getroffen.',
    writtenNote: 'Schriftliche Begründung: Selbstreflexion ohne Punktwertung.',
    memoHeading: 'Zum Mitnehmen',
    memo: [
      'Notwehr: einen gegenwärtigen rechtswidrigen Angriff abwehren.',
      'Defensiver Notstand: auf die Sache einwirken, von der die Gefahr ausgeht.',
      'Aggressiver Notstand: eine unbeteiligte Sache zur Gefahrenabwehr in Anspruch nehmen.',
      'Prüfen Sie immer die Voraussetzungen und mögliche Ersatzansprüche.',
    ],
    topicsHeading: 'Diese Punkte können Sie noch einmal gezielt wiederholen:',
    // Listed by decision id; decisions sharing a topic produce one line.
    topics: [
      { label: 'Gefahrenquelle und unbeteiligte Sache unterscheiden.', decisions: ['dog_basis', 'bottle_basis'] },
      { label: 'Die Voraussetzungen des defensiven Notstands (§ 228 BGB).', decisions: ['defensive_conditions'] },
      { label: 'Die Voraussetzungen des aggressiven Notstands (§ 904 BGB).', decisions: ['aggressive_conditions'] },
      { label: 'Mögliche Ersatzansprüche nach einer gerechtfertigten Handlung.', decisions: ['compensation'] },
      { label: 'Notwehr und Nothilfe bei einem menschlichen Angriff.', decisions: ['notwehr_basis'] },
      { label: 'Strafrechtliche und zivilrechtliche Beurteilung unterscheiden.', decisions: ['legal_perspectives'] },
    ],
    reviewLabel: 'Unsichere Entscheidungen noch einmal ansehen',
    reviewDone: 'Wiederholung abgeschlossen',
    reviewDoneNote: 'Ihr Ergebnis des ersten Versuchs bleibt unverändert.',
    nextTopic: {
      heading: 'Und wenn jemand eine Sache einfach mitnimmt?',
      text: 'Im nächsten Thema geht es darum, wann Sie Besitz schützen oder zurückholen dürfen — und wo die Grenzen der Selbsthilfe liegen.',
      caption: 'Als Nächstes: Besitzwehr, Besitzkehr und Selbsthilfe.',
    },
    restartLabel: 'Neu starten',
    restartConfirm: 'Ihre Antworten werden gelöscht. Was möchten Sie neu starten?',
    restartCheckLabel: 'Nur die Abschlussprüfung',
    restartCourseLabel: 'Die gesamte Lerneinheit',
  },
};

/** Feedback text of a decision for the given answer. */
export function feedbackFor(decision: ScoredDecision, answer: string | undefined): string | null {
  if (typeof decision.feedback === 'string') return decision.feedback;
  return answer ? (decision.feedback[answer] ?? null) : null;
}
