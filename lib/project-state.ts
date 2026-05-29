import { stages, type Stage } from "@/lib/stages"

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
  }
}

export type StageStatus = "incomplete" | "ready" | "complete"

/**
 * A stage is ready to complete only when every checklist item is checked
 * and every (required) question has a non-empty answer.
 */
export function isStageReady(stage: Stage, state: StageState): boolean {
  const allChecked = state.checklist.length > 0 && state.checklist.every(Boolean)
  const allAnswered =
    stage.questions.length === 0 || state.answers.every((answer) => answer.trim().length > 0)
  return allChecked && allAnswered
}

export function getStageStatus(stage: Stage, state: StageState): StageStatus {
  if (state.completed) return "complete"
  return isStageReady(stage, state) ? "ready" : "incomplete"
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
