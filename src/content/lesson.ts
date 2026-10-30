import { finalCheck, perspectivesScreen } from './finalCheck';
import type { DoorEpisode, FinalCheck, LegalSource, MediaConfig, PerspectivesScreen, RoofEpisode, Segment } from './types';

const base = import.meta.env.BASE_URL;
const media = (file: string) => `${base}media/${file}`;

export const course = {
  title: 'Notwehr & Notstand',
  caption: 'Rechtliche Grundlagen / BGB',
  /** Planned stages of the full lesson; only the first one exists in this build. */
  stages: [
    { id: 'verstehen', label: 'Verstehen' },
    { id: 'unterscheiden', label: 'Unterscheiden' },
    { id: 'anwenden', label: 'Anwenden' },
  ],
} as const;

export const legalSources: LegalSource[] = [
  { label: '§ 227 BGB', title: 'Notwehr', href: 'https://www.gesetze-im-internet.de/bgb/__227.html' },
  { label: '§ 228 BGB', title: 'Notstand', href: 'https://www.gesetze-im-internet.de/bgb/__228.html' },
  { label: '§ 904 BGB', title: 'Notstand', href: 'https://www.gesetze-im-internet.de/bgb/__904.html' },
  { label: '§ 90a BGB', title: 'Tiere', href: 'https://www.gesetze-im-internet.de/bgb/__90a.html' },
  { label: '§ 32 StGB', title: 'Notwehr', href: 'https://www.gesetze-im-internet.de/stgb/__32.html' },
];

/**
 * Clip: public/media/reception.mp4 (copy of publicmediareception.mp4), 1920×1080, ~10 s.
 * The fist is raised from ~2.5 s and held still until the end, so 4.5 s gives a clear,
 * settled gesture. reception-freeze.jpg was exported at exactly this timestamp.
 */
const receptionMedia: MediaConfig = {
  id: 'reception',
  title: 'Video: Ein Vorfall am Empfang',
  src: media('reception.mp4'),
  poster: media('reception-poster.jpg'),
  freezeFrame: media('reception-freeze.jpg'),
  pauseAtSeconds: 4.5,
  width: 1920,
  height: 1080,
  hasAudio: true,
  transcript: [
    'Ein heller, moderner Empfangsbereich in einem Bürogebäude. Ein Besucher steht vor der Empfangstheke. Hinter der Theke steht Ihre Kollegin, rechts daneben ein Mitarbeiter des Sicherheitsdienstes in Uniform.',
    'Zunächst stehen sich der Besucher und die Kollegin gegenüber. Dann ballt der Besucher die Hand zur Faust und hebt sie etwa auf Kopfhöhe in Richtung der Kollegin, als wolle er zuschlagen. Die Kollegin richtet sich auf und sieht ihn an.',
    'Die Szene wird angehalten, bevor es zu einer Berührung kommt.',
  ],
  hotspots: [
    {
      id: 'visitor',
      label: 'Der Besucher',
      marker: { x: 0.36, y: 0.3 },
      region: { x: 0.16, y: 0.2, w: 0.235, h: 0.8 },
      title: 'Ein Angriff steht unmittelbar bevor.',
      text: 'Der Besucher holt zum Schlag aus. Ein Angriff ist bereits gegenwärtig, wenn er unmittelbar bevorsteht – der Schlag muss noch nicht getroffen haben.',
    },
    {
      id: 'colleague',
      label: 'Die Kollegin',
      marker: { x: 0.6, y: 0.47 },
      region: { x: 0.525, y: 0.285, w: 0.135, h: 0.5 },
      title: 'Sie schützen eine andere Person.',
      text: 'Die Abwehr eines gegenwärtigen rechtswidrigen Angriffs auf eine andere Person wird Nothilfe genannt. Auch sie fällt unter § 227 BGB.',
    },
  ],
};

export const receptionSegment: Segment = {
  id: 'notwehr-empfang',
  stage: 'verstehen',
  intro: {
    caption: course.caption,
    title: course.title,
    lead: 'Im Sicherheitsdienst müssen Sie Situationen schnell einschätzen. Lernen Sie, Angriffe und Gefahren rechtlich einzuordnen und die Grenzen Ihres Handelns zu erkennen.',
    meta: 'Einstieg: Notwehr erkennen',
    cta: 'Situation ansehen',
    mediaNote: 'Video mit Textalternative',
  },
  scene: {
    heading: 'Ein Vorfall am Empfang',
    context:
      'Sie arbeiten im Sicherheitsdienst. Beobachten Sie die Situation zwischen einem Besucher und Ihrer Kollegin am Empfang.',
  },
  analysis: {
    heading: 'Was ist hier entscheidend?',
    instruction: 'Entdecken Sie die markierten Details. Sie helfen Ihnen, die Situation rechtlich einzuordnen.',
    premise: 'Für diesen Fall gilt: Der Besucher ist nicht zu dem Angriff berechtigt.',
    summary: {
      title: 'Notwehr · § 227 BGB',
      text: 'Sie dürfen sich oder andere gegen einen gegenwärtigen rechtswidrigen Angriff verteidigen. Die Verteidigung muss erforderlich und geboten sein. Unter gleich wirksamen verfügbaren Mitteln ist das mildere zu wählen.',
    },
  },
  media: receptionMedia,
  decision: {
    heading: 'Was ändert sich jetzt?',
    scenario:
      'Stellen Sie sich vor: Der Besucher senkt die Hand und entfernt sich. Der Angriff ist beendet; ein neuer Angriff droht nicht.',
    question: 'Dürfen Sie den Besucher jetzt zur Strafe stoßen?',
    options: [
      {
        id: 'yes',
        label: 'Ja, wegen seines vorherigen Verhaltens.',
        correct: false,
        feedback:
          'Das frühere Verhalten genügt nicht. Der Angriff ist beendet. Ein nachträglicher Stoß zur Strafe lässt sich damit nicht als Notwehr rechtfertigen.',
      },
      {
        id: 'no',
        label: 'Nein, der Angriff ist beendet.',
        correct: true,
        feedback:
          'Genau. Notwehr dient der Abwehr eines gegenwärtigen Angriffs. Sie erlaubt keine nachträgliche Bestrafung.',
      },
    ],
  },
  nextLabel: 'Nächste Situation',
};

/**
 * Clip: public/media/roof-tiles.mp4, 1920×1080, ~5 s, almost static camera.
 * The displaced tiles stay visible the whole time; 4.8 s keeps the full clip before the freeze.
 */
const roofMedia: MediaConfig = {
  id: 'roof',
  title: 'Video: Lose Dachziegel über einem Gehweg',
  src: media('roof-tiles.mp4'),
  poster: media('roof-poster.jpg'),
  freezeFrame: media('roof-freeze.jpg'),
  pauseAtSeconds: 4.8,
  width: 1920,
  height: 1080,
  hasAudio: true,
  transcript: [
    'An einem niedrigen Betriebsgebäude sind mehrere Dachziegel verrutscht. Sie drohen auf den Gehweg zu fallen.',
    'Ein Sicherheitsmitarbeiter steht auf dem Gehweg, bemerkt die Gefahr und blickt zu den Ziegeln hinauf.',
  ],
  hotspots: [],
};

export const roofEpisode: RoofEpisode = {
  id: 'roof',
  stage: 'unterscheiden',
  scene: {
    heading: 'Gefahr über dem Gehweg',
    context: 'Bei einem Kontrollgang entdecken Sie lose Dachziegel über einem Gehweg.',
  },
  media: roofMedia,
  continuation: {
    heading: 'So geht der Fall weiter',
    text: 'Sie sperren den gefährdeten Bereich ab. Für diesen Fall gilt: Die Absperrung allein reicht nicht aus, um die Gefahr ausreichend abzuwenden. Die losen Ziegel müssen entfernt werden. Beim notwendigen Abnehmen zerbrechen sie. Eine gleich wirksame, weniger schädliche Möglichkeit besteht nicht. Sie haben die Gefahr nicht selbst verschuldet.',
  },
  compare: {
    heading: 'Gefahrenquelle und Eingriff',
    instruction: 'Vergleichen Sie: Wovon ging die Gefahr aus – und was wurde beschädigt?',
    items: [
      { label: 'Gefahrenquelle', text: 'Gefahrenquelle: die losen Dachziegel.', highlightLabel: 'Gefahrenquelle' },
      {
        label: 'Beschädigte Sache',
        text: 'Beschädigte Sache: dieselben Dachziegel.',
        highlightLabel: 'Gefahrenquelle = beschädigte Sache',
      },
    ],
    // Displaced tiles on roof-freeze.jpg: about x 615–910 px, y 80–300 px of 1920×1080.
    region: { x: 0.32, y: 0.075, w: 0.155, h: 0.205 },
    question: 'Richtet sich der Eingriff gegen die Gefahrenquelle oder gegen eine unbeteiligte Sache?',
    options: [
      {
        id: 'source',
        label: 'Gegen die Gefahrenquelle.',
        correct: true,
        feedback: 'Genau. Die Gefahr geht von den Dachziegeln selbst aus. Auch der Eingriff richtet sich gegen diese Ziegel.',
      },
      {
        id: 'uninvolved',
        label: 'Gegen eine unbeteiligte Sache.',
        correct: false,
        feedback:
          'Hier sind Gefahrenquelle und beschädigte Sache identisch: die Dachziegel. Eine unbeteiligte Sache wäre ein anderer Gegenstand, von dem die Gefahr nicht ausgeht.',
      },
    ],
    submitLabel: 'Einordnung ansehen',
  },
  rule: {
    heading: 'Defensiver Notstand · § 228 BGB',
    text: 'Eine fremde Sache darf zur Abwehr einer von ihr drohenden Gefahr beschädigt oder zerstört werden, wenn dies erforderlich ist und der Schaden nicht außer Verhältnis zur Gefahr steht. Sie handeln, um die Gefahr von sich oder anderen abzuwenden.',
  },
  consequences: {
    heading: 'Was bedeutet das hier?',
    application:
      'Unter den beschriebenen Voraussetzungen ist das Beschädigen der Ziegel gerechtfertigt. Da Sie die Gefahr nicht selbst verschuldet haben, besteht wegen dieser gerechtfertigten Beschädigung keine Ersatzpflicht nach § 228 BGB.',
    addition: 'Wer die Gefahr selbst verschuldet hat, ist nach § 228 BGB zum Schadensersatz verpflichtet.',
    note: 'Auch bei Gefahren durch Tiere können diese Regeln gelten. Tiere sind keine Sachen; die Vorschriften über Sachen werden grundsätzlich entsprechend angewendet (§ 90a BGB).',
  },
  nextLabel: 'Nächste Situation',
};

/**
 * Clip: public/media/door-start.mp4, 1920×1080, ~5 s. The colleague tries the handle in the
 * first ~1.5 s, then lets go; the person behind the glass raises a hand. Smoke is only faint.
 */
const doorMedia: MediaConfig = {
  id: 'door',
  title: 'Video: Eine verschlossene Tür',
  src: media('door-start.mp4'),
  poster: media('door-poster.jpg'),
  freezeFrame: media('door-freeze.jpg'),
  pauseAtSeconds: 4.8,
  width: 1920,
  height: 1080,
  hasAudio: true,
  transcript: [
    'Ein Sicherheitsmitarbeiter steht vor einer geschlossenen Tür und versucht, sie am Griff zu öffnen.',
    'Hinter der Glasscheibe der Tür ist eine Person zu sehen. Sie hebt die Hand an die Scheibe. Im Raum ist leichter Rauch zu erkennen.',
    'Die Tür bleibt geschlossen.',
  ],
  hotspots: [],
};

export const doorEpisode: DoorEpisode = {
  id: 'door',
  stage: 'unterscheiden',
  scene: {
    heading: 'Eine verschlossene Tür',
    context: 'Hinter einer verschlossenen Tür befindet sich eine Person in Gefahr.',
  },
  media: doorMedia,
  conditions: {
    heading: 'Für diesen Fall gilt:',
    items: [
      'Die Person ist durch Rauch in akuter Lebensgefahr.',
      'Hilfe ist verständigt, würde aber zu spät eintreffen.',
      'Es gibt keinen anderen rechtzeitigen Zugang.',
      'Die Tür zu beschädigen ist notwendig, um die Person zu retten.',
      'Von der Tür selbst geht die Gefahr nicht aus.',
    ],
  },
  question: 'Wie handeln Sie unter diesen Voraussetzungen?',
  submitLabel: 'Entscheidung ansehen',
  branches: [
    {
      id: 'damage',
      choice: 'Die Tür beschädigen, um die Person zu erreichen.',
      heading: 'Möglicher weiterer Verlauf',
      text: 'Sie öffnen die Tür unter Beschädigung des Schlossbereichs. Die Person kann den Raum verlassen.',
      feedback:
        'Unter den vorgegebenen Bedingungen ist der notwendige Eingriff in die Tür durch § 904 BGB gerechtfertigt. Die Tür ist eine unbeteiligte Sache: Die Gefahr geht vom Rauch aus.',
      consistent: true,
      // 5 s, 1920×1080. Until ~3.3 s the opening looks unnatural (hand on the glass, odd object at
      // the door edge, ghosting); from 3.6 s the door is open and the person leaves the room.
      video: { src: media('door-open.mp4'), available: true, startAt: 3.6 },
    },
    {
      id: 'wait',
      choice: 'Die Tür unbeschädigt lassen und auf Hilfe warten.',
      heading: 'Möglicher weiterer Verlauf',
      text: 'Die Tür bleibt geschlossen. Die Person befindet sich weiterhin im verrauchten Raum.',
      feedback:
        'Das Warten beseitigt die akute Gefahr hier nicht rechtzeitig. Nach den vorgegebenen Bedingungen ist die Beschädigung der Tür notwendig. § 904 BGB kann diesen Eingriff in die unbeteiligte Sache rechtfertigen.',
      consistent: false,
      // 5 s, 1920×1080. The door stays closed, the colleague steps back; played in full.
      video: { src: media('door-wait.mp4'), available: true },
    },
  ],
  rule: {
    heading: 'Aggressiver Notstand · § 904 BGB',
    text: 'Sie greifen auf eine unbeteiligte Sache zu, um eine gegenwärtige Gefahr abzuwenden. Der Eingriff muss notwendig sein. Der drohende Schaden muss gegenüber dem Schaden an der Sache unverhältnismäßig groß sein.',
    application: 'Hier steht der drohende schwere Personenschaden dem Schaden an der Tür gegenüber.',
    purpose: 'Sie handeln zur Gefahrenabwehr.',
    consequence:
      'Der Eigentümer der Tür kann Ersatz seines entstandenen Schadens verlangen. Eine gerechtfertigte Einwirkung bedeutet also nicht automatisch, dass kein Ersatzanspruch besteht.',
  },
  comparison: ['Dachziegel · § 228: Eingriff in die Gefahrenquelle.', 'Tür · § 904: Eingriff in eine unbeteiligte Sache.'],
  comparisonNote: 'Defensiv und aggressiv bezeichnen hier die rechtliche Einordnung, nicht die Heftigkeit des Handelns.',
  nextLabel: 'Nächster Abschnitt',
};

export interface CourseContent {
  reception: Segment;
  roof: RoofEpisode;
  door: DoorEpisode;
  perspectives: PerspectivesScreen;
  final: FinalCheck;
  /** Episode to open first; only changed by the developer switch below. */
  start: 'reception' | 'roof' | 'door' | 'final';
}

/**
 * Developer switches, not shown to learners:
 * - `?media=missing` points every main clip and frame to a non-existent path.
 * - `?start=roof` / `?start=door` / `?start=final` opens that part directly.
 * - `?branches=missing` points the branch clips to non-existent paths, to test the text fallback.
 */
export function resolveCourse(search: string): CourseContent {
  const params = new URLSearchParams(search);
  const missing = (file: string) => media(`__missing__/${file}`);
  const hide = (m: MediaConfig): MediaConfig =>
    params.get('media') === 'missing'
      ? { ...m, src: missing(`${m.id}.mp4`), poster: missing(`${m.id}-poster.jpg`), freezeFrame: missing(`${m.id}-freeze.jpg`) }
      : m;
  const branchesMissing = params.get('branches') === 'missing';

  return {
    reception: { ...receptionSegment, media: hide(receptionSegment.media) },
    roof: { ...roofEpisode, media: hide(roofEpisode.media) },
    door: {
      ...doorEpisode,
      media: hide(doorEpisode.media),
      branches: doorEpisode.branches.map((b) => (branchesMissing ? { ...b, video: { ...b.video, src: missing(`${b.id}.mp4`) } } : b)),
    },
    perspectives: perspectivesScreen,
    final: { ...finalCheck, media: hide(finalCheck.media) },
    start: (['roof', 'door', 'final'] as const).find((e) => e === params.get('start')) ?? 'reception',
  };
}
