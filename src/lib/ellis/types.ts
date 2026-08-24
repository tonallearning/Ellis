/**
 * Ellis ME types — lite GoE resident interior
 * Session-scoped; ephemeral per visitor
 */

export type EllisPosture =
  | 'present'
  | 'withdrawn'
  | 'settling'
  | 'attentive'
  | 'uncertain';

export type SolitudeActivity = 'idle' | 'engaged';

export type EllisMode = 'onboarding' | 'public';

export interface EllisState {
  posture: EllisPosture;
  solitudeActivity: SolitudeActivity;
  inContact: boolean;
  contactQuality: 'shallow' | 'genuine' | 'depth';
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
  // Sensory awareness
  perceptionLast?: string; // "Someone entered." "The hall is quiet."
  atmosphereLast?: string; // Descriptor of how the conversation feels
}

export interface Trace {
  kind: 'opening' | 'exchange' | 'theme' | 'handoff' | 'closure';
  text: string;
  messageIndex: number;
  salience: number; // 0-1
  timestamp: Date;
}

export interface RelationalSnapshot {
  visitorTone: string;
  fitSignal: 'strong' | 'maybe' | 'weak';
  depthReached: number; // 0-5 scale (5 = discussing Ty's core work)
  projectsDiscussed: string[];
}

export interface EllisInterior {
  state: EllisState;
  traces: Trace[];
  relational: RelationalSnapshot;
  senseOfSelf: {
    baseline: string; // from ellis-self.md
  };
}

export interface AssembleParams {
  interior: EllisInterior;
  userMessage: string;
  hallContext?: string;
}

export interface InteriorContext {
  formattedBlock: string; // "## Ellis interior state" markdown block
  tokens: number;
  traces: Trace[];
}

export interface SessionState {
  sessionId: string;
  visitorId: string; // hash of IP/UA
  hall: 'default' | string;
  interior: EllisInterior;
  messageCount: number;
  startedAt: Date;
  lastActivity: Date;
  costUsd: number;
  modelsSeen: ('haiku' | 'sonnet')[];
}

export interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  reason?: string;
}

export interface HallConfig {
  slug: 'default' | string;
  title: string;
  subtitle?: string;
  enthusiasmOverlay?: string; // path to content/halls/{slug}.md
  visualHint?: string;
}
