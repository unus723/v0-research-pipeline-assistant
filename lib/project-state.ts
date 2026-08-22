import { stages, type Stage } from "@/lib/stages"

export const PAPER_TAGS = [
  "foundational",
  "recent",
  "closest competitor",
  "baseline source",
  "dataset source",
  "method source",
  "critique source",
] as const

export type PaperTag = (typeof PAPER_TAGS)[number]

export interface Paper {
  id: string
  title: string
  authors: string
  year: string
  venue: string
  doiOrUrl: string
  summary: string
  method: string
  dataset: string
  metrics: string
  limitations: string
  relevanceScore: 1 | 2 | 3 | 4 | 5
  tags: PaperTag[]
}

export interface ExperimentResult {
  id: string
  experimentName: string
  dataset: string
  method: string
  baseline: string
  metric: string
  value: string
  notes: string
  runDate: string
}

export interface DecisionLogEntry {
  id: string
  date: string
  decision: string
  reason: string
  alternativesConsidered: string
}

export interface AssumptionLogEntry {
  id: string
  assumption: string
  whyAssumed: string
  riskIfFalse: string
  validationPlan: string
}

export interface StageState {
  checklist: boolean[]
  answers: string[]
  notes: string
  risks: string
  completed: boolean
  completedAt?: string
}

export interface ProjectState {
  projectTitle: string
  currentStageId: string
  stages: Record<string, StageState>
  papers: Paper[]
  experiments: ExperimentResult[]
  decisions: DecisionLogEntry[]
  assumptions: AssumptionLogEntry[]
}

export function createInitialStageState(stage: Stage): StageState {
  return {
    checklist: stage.checklist.map(() => false),
    answers: stage.questions.map(() => ""),
    notes: "",
    risks: "",
    completed: false,
  }
}

export function createInitialProjectState(): ProjectState {
  const stageStates: Record<string, StageState> = {}
  for (const stage of stages) {
    stageStates[stage.id] = createInitialStageState(stage)
  }
  return {
    projectTitle: "",
    currentStageId: stages[0].id,
    stages: stageStates,
    papers: [],
    experiments: [],
    decisions: [],
    assumptions: [],
  }
}

export type StageStatus = "incomplete" | "ready" | "complete"

/**
 * A stage is ready to complete only when every checklist item is checked
 * and every (required) question has a non-empty answer.
 */
export function isStageReady(stage: Stage, state: StageState): boolean {
  const allChecked = stage.checklist.length === 0 || state.checklist.every(Boolean)
  const allAnswered =
    stage.questions.length === 0 || state.answers.every((answer) => answer.trim().length > 0)
  return allChecked && allAnswered
}

export function getStageStatus(
  stage: Stage,
  state: StageState,
  papers?: Paper[],
  experiments?: ExperimentResult[],
): StageStatus {
  if (state.completed) return "complete"
  if (papers) return canCompleteStage(stage, state, papers, experiments) ? "ready" : "incomplete"
  return isStageReady(stage, state) ? "ready" : "incomplete"
}

export function hasClosestCompetitorPaper(papers: Paper[]): boolean {
  return papers.some((paper) => paper.tags.includes("closest competitor"))
}

export function hasBaselineExperiment(experiments: ExperimentResult[]): boolean {
  return experiments.some((experiment) => experiment.baseline.trim().length > 0)
}

export function hasUncertaintyNotes(experiments: ExperimentResult[]): boolean {
  return experiments.some((experiment) => {
    const notes = experiment.notes.toLowerCase()
    return (
      notes.includes("confidence") ||
      notes.includes("std") ||
      notes.includes("standard deviation") ||
      notes.includes("variance") ||
      notes.includes("uncertainty") ||
      notes.includes("p-value") ||
      notes.includes("significance") ||
      notes.includes("interval")
    )
  })
}

export function canCompleteStage(
  stage: Stage,
  state: StageState,
  papers: Paper[],
  experiments: ExperimentResult[] = [],
): boolean {
  if (!isStageReady(stage, state)) return false
  if (stage.id === "literature-review") return papers.length >= 10
  if (stage.id === "experiments") return experiments.length >= 1
  return true
}

/**
 * Sequential locking: stage 0 is always accessible. Any later stage is
 * accessible only when every stage before it is marked complete.
 */
export function isStageAccessible(stageStates: Record<string, StageState>, index: number): boolean {
  if (index <= 0) return true
  for (let i = 0; i < index; i++) {
    if (!stageStates[stages[i].id]?.completed) return false
  }
  return true
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isBooleanArray(value: unknown, expectedLength: number): value is boolean[] {
  return Array.isArray(value) && value.length === expectedLength && value.every((item) => typeof item === "boolean")
}

function isStringArray(value: unknown, expectedLength: number): value is string[] {
  return Array.isArray(value) && value.length === expectedLength && value.every((item) => typeof item === "string")
}

function isRelevanceScore(value: unknown): value is Paper["relevanceScore"] {
  return Number.isInteger(value) && typeof value === "number" && value >= 1 && value <= 5
}

function isPaperTag(value: unknown): value is PaperTag {
  return typeof value === "string" && PAPER_TAGS.includes(value as PaperTag)
}

function isPaperTagArray(value: unknown): value is PaperTag[] {
  return Array.isArray(value) && value.every(isPaperTag)
}

export function isValidPaper(value: unknown): value is Paper {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.authors === "string" &&
    typeof value.year === "string" &&
    typeof value.venue === "string" &&
    typeof value.doiOrUrl === "string" &&
    typeof value.summary === "string" &&
    typeof value.method === "string" &&
    typeof value.dataset === "string" &&
    typeof value.metrics === "string" &&
    typeof value.limitations === "string" &&
    isRelevanceScore(value.relevanceScore) &&
    isPaperTagArray(value.tags)
  )
}

export function isValidExperimentResult(value: unknown): value is ExperimentResult {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.experimentName === "string" &&
    typeof value.dataset === "string" &&
    typeof value.method === "string" &&
    typeof value.baseline === "string" &&
    typeof value.metric === "string" &&
    typeof value.value === "string" &&
    typeof value.notes === "string" &&
    typeof value.runDate === "string"
  )
}

export function isValidDecisionLogEntry(value: unknown): value is DecisionLogEntry {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.date === "string" &&
    typeof value.decision === "string" &&
    typeof value.reason === "string" &&
    typeof value.alternativesConsidered === "string"
  )
}

export function isValidAssumptionLogEntry(value: unknown): value is AssumptionLogEntry {
  if (!isRecord(value)) return false

  return (
    typeof value.id === "string" &&
    typeof value.assumption === "string" &&
    typeof value.whyAssumed === "string" &&
    typeof value.riskIfFalse === "string" &&
    typeof value.validationPlan === "string"
  )
}

export function isValidStageState(stage: Stage, value: unknown): value is StageState {
  if (!isRecord(value)) return false

  const completedAt = value.completedAt
  const hasValidCompletedAt = completedAt === undefined || typeof completedAt === "string"

  return (
    isBooleanArray(value.checklist, stage.checklist.length) &&
    isStringArray(value.answers, stage.questions.length) &&
    typeof value.notes === "string" &&
    typeof value.risks === "string" &&
    typeof value.completed === "boolean" &&
    hasValidCompletedAt
  )
}

export function isValidProjectState(value: unknown): value is ProjectState {
  if (!isRecord(value)) return false
  if (typeof value.projectTitle !== "string") return false
  if (typeof value.currentStageId !== "string") return false
  if (!stages.some((stage) => stage.id === value.currentStageId)) return false

  const stageStates = value.stages
  if (!isRecord(stageStates)) return false

  if (!Array.isArray(value.papers) || !value.papers.every(isValidPaper)) return false
  if (!Array.isArray(value.experiments) || !value.experiments.every(isValidExperimentResult)) return false
  if (!Array.isArray(value.decisions) || !value.decisions.every(isValidDecisionLogEntry)) return false
  if (!Array.isArray(value.assumptions) || !value.assumptions.every(isValidAssumptionLogEntry)) return false

  return stages.every((stage) => isValidStageState(stage, stageStates[stage.id]))
}

export function parseProjectStateJson(json: string): ProjectState | null {
  try {
    const parsed: unknown = JSON.parse(json)
    return isValidProjectState(parsed) ? parsed : null
  } catch {
    return null
  }
}
