import type { Stage } from "@/lib/stages"
import {
  canCompleteStage,
  getStageStatus,
  hasBaselineExperiment,
  hasClosestCompetitorPaper,
  hasUncertaintyNotes,
  type AssumptionLogEntry,
  type DecisionLogEntry,
  type ExperimentResult,
  type Paper,
  type StageState,
} from "@/lib/project-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ExperimentTracker } from "@/components/experiment-tracker"
import { PaperLibrary } from "@/components/paper-library"
import { ResearchIntegrityTools } from "@/components/research-integrity-tools"
import { StageVisual } from "@/components/interactive-visuals"
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"

interface StageContentProps {
  stage: Stage
  state: StageState
  onChange: (patch: Partial<StageState>) => void
  papers: Paper[]
  onAddPaper: (paper: Paper) => void
  onUpdatePaper: (id: string, paper: Paper) => void
  onDeletePaper: (id: string) => void
  experiments: ExperimentResult[]
  onAddExperiment: (experiment: ExperimentResult) => void
  onUpdateExperiment: (id: string, experiment: ExperimentResult) => void
  onDeleteExperiment: (id: string) => void
  decisions: DecisionLogEntry[]
  onAddDecision: (decision: DecisionLogEntry) => void
  onUpdateDecision: (id: string, decision: DecisionLogEntry) => void
  onDeleteDecision: (id: string) => void
  assumptions: AssumptionLogEntry[]
  onAddAssumption: (assumption: AssumptionLogEntry) => void
  onUpdateAssumption: (id: string, assumption: AssumptionLogEntry) => void
  onDeleteAssumption: (id: string) => void
  isFirst: boolean
  isLast: boolean
  onPrevious: () => void
  onNext: () => void
}

const statusConfig = {
  incomplete: { label: "Incomplete", variant: "secondary" as const },
  ready: { label: "Ready to Complete", variant: "default" as const },
  complete: { label: "Complete", variant: "default" as const },
}

export function StageContent({
  stage,
  state,
  onChange,
  papers,
  onAddPaper,
  onUpdatePaper,
  onDeletePaper,
  experiments,
  onAddExperiment,
  onUpdateExperiment,
  onDeleteExperiment,
  decisions,
  onAddDecision,
  onUpdateDecision,
  onDeleteDecision,
  assumptions,
  onAddAssumption,
  onUpdateAssumption,
  onDeleteAssumption,
  isFirst,
  isLast,
  onPrevious,
  onNext,
}: StageContentProps) {
  const hasDetail = stage.explanation.length > 0
  const status = getStageStatus(stage, state, papers, experiments)
  const ready = canCompleteStage(stage, state, papers, experiments)
  const showPaperLibrary = stage.id === "literature-review" || stage.id === "gap-analysis"
  const showExperimentTracker =
    stage.id === "research-design" || stage.id === "experiments" || stage.id === "statistical-validation"
  const integrityReminder =
    stage.id === "research-design"
      ? "Log major design decisions before moving forward so the rationale and alternatives are reviewable later."
      : stage.id === "data-collection"
        ? "Log data assumptions before setup work proceeds, especially assumptions about availability, quality, labels, sampling, and preprocessing."
        : stage.id === "experiments"
          ? "Log experimental assumptions before and during runs, including assumptions about baselines, metrics, hardware, seeds, and expected variance."
          : ""
  const showIntegrityTools = integrityReminder.length > 0
  const needsMorePapers = stage.id === "literature-review" && papers.length < 10
  const missingClosestCompetitor = stage.id === "gap-analysis" && !hasClosestCompetitorPaper(papers)
  const missingBaseline = stage.id === "research-design" && !hasBaselineExperiment(experiments)
  const needsExperimentResult = stage.id === "experiments" && experiments.length < 1
  const weakValidationEvidence =
    stage.id === "statistical-validation" && experiments.length === 1 && !hasUncertaintyNotes(experiments)

  function toggleChecklist(index: number, checked: boolean) {
    const next = [...state.checklist]
    next[index] = checked
    onChange({ checklist: next })
  }

  function setAnswer(index: number, value: string) {
    const next = [...state.answers]
    next[index] = value
    onChange({ answers: next })
  }

  function markComplete() {
    onChange({ completed: true, completedAt: new Date().toISOString() })
  }

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge variant="secondary" className="tabular-nums">
                Stage {stage.number}
              </Badge>
              <Badge
                variant={statusConfig[status].variant}
                className={status === "complete" ? "bg-chart-2 text-background hover:bg-chart-2" : undefined}
              >
                {statusConfig[status].label}
              </Badge>
            </div>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">{stage.title}</h2>
            {stage.goal ? (
              <p className="mt-2 text-base leading-relaxed text-muted-foreground text-pretty">{stage.goal}</p>
            ) : null}
          </div>
          <div className="shrink-0 mt-1">
            <StageVisual stageId={stage.id} />
          </div>
        </header>

        {needsMorePapers ? (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Paper library quality gate</AlertTitle>
            <AlertDescription>
              Literature Review requires at least 10 manually entered papers before this stage can be completed. Current
              count: {papers.length}/10.
            </AlertDescription>
          </Alert>
        ) : null}

        {missingClosestCompetitor ? (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Closest competitor missing</AlertTitle>
            <AlertDescription>
              Gap Analysis should identify at least one paper tagged "closest competitor" in the Paper Library.
            </AlertDescription>
          </Alert>
        ) : null}

        {missingBaseline ? (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Baseline missing</AlertTitle>
            <AlertDescription>
              Research Design should identify at least one baseline in the Experiment Tracker before the experimental
              plan is considered well grounded.
            </AlertDescription>
          </Alert>
        ) : null}

        {needsExperimentResult ? (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Experiment result required</AlertTitle>
            <AlertDescription>
              Experiments requires at least one manually entered experiment result before this stage can be completed.
            </AlertDescription>
          </Alert>
        ) : null}

        {weakValidationEvidence ? (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Uncertainty notes missing</AlertTitle>
            <AlertDescription>
              Statistical Validation should include uncertainty notes when there is only one experiment run.
            </AlertDescription>
          </Alert>
        ) : null}

        {!hasDetail ? (
          <>
            <Card className="mb-6">
              <CardContent className="py-10 text-center">
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  Detailed guidance for this stage has not been written yet.
                </p>
              </CardContent>
            </Card>

            {showExperimentTracker ? (
              <ExperimentTracker
                experiments={experiments}
                onAddExperiment={onAddExperiment}
                onUpdateExperiment={onUpdateExperiment}
                onDeleteExperiment={onDeleteExperiment}
              />
            ) : null}

            {showIntegrityTools ? (
              <ResearchIntegrityTools
                reminder={integrityReminder}
                decisions={decisions}
                onAddDecision={onAddDecision}
                onUpdateDecision={onUpdateDecision}
                onDeleteDecision={onDeleteDecision}
                assumptions={assumptions}
                onAddAssumption={onAddAssumption}
                onUpdateAssumption={onUpdateAssumption}
                onDeleteAssumption={onDeleteAssumption}
              />
            ) : null}

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground text-pretty">
                {state.completed
                  ? "This stage is marked complete."
                  : ready
                    ? "All quality gates are done."
                    : "Satisfy quality gates to enable completion."}
              </p>
              <Button onClick={markComplete} disabled={!ready || state.completed} className="shrink-0">
                <CheckCircle2 className="h-4 w-4" />
                {state.completed ? "Completed" : "Mark Stage Complete"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Explanation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{stage.explanation}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {stage.checklist.map((item, index) => {
                    const itemId = `${stage.id}-check-${index}`
                    return (
                      <li key={itemId} className="flex items-start gap-3">
                        <Checkbox
                          id={itemId}
                          className="mt-0.5"
                          checked={state.checklist[index] ?? false}
                          onCheckedChange={(checked) => toggleChecklist(index, checked === true)}
                        />
                        <label htmlFor={itemId} className="text-sm leading-relaxed text-foreground text-pretty">
                          {item}
                        </label>
                      </li>
                    )
                  })}
                </ul>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {stage.questions.map((question, index) => {
                  const fieldId = `${stage.id}-q-${index}`
                  return (
                    <div key={fieldId} className="space-y-2">
                      <Label htmlFor={fieldId} className="text-sm font-medium leading-relaxed text-pretty">
                        {index + 1}. {question}
                      </Label>
                      <Textarea
                        id={fieldId}
                        value={state.answers[index] ?? ""}
                        onChange={(event) => setAnswer(index, event.target.value)}
                        placeholder="Write your answer..."
                        className="min-h-20"
                      />
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {showPaperLibrary ? (
              <PaperLibrary papers={papers} onAddPaper={onAddPaper} onUpdatePaper={onUpdatePaper} onDeletePaper={onDeletePaper} />
            ) : null}

            {showExperimentTracker ? (
              <ExperimentTracker
                experiments={experiments}
                onAddExperiment={onAddExperiment}
                onUpdateExperiment={onUpdateExperiment}
                onDeleteExperiment={onDeleteExperiment}
              />
            ) : null}

            {showIntegrityTools ? (
              <ResearchIntegrityTools
                reminder={integrityReminder}
                decisions={decisions}
                onAddDecision={onAddDecision}
                onUpdateDecision={onUpdateDecision}
                onDeleteDecision={onDeleteDecision}
                assumptions={assumptions}
                onAddAssumption={onAddAssumption}
                onUpdateAssumption={onUpdateAssumption}
                onDeleteAssumption={onDeleteAssumption}
              />
            ) : null}

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Stage Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={state.notes}
                  onChange={(event) => onChange({ notes: event.target.value })}
                  placeholder="Capture working notes, decisions, and references for this stage..."
                  className="min-h-28"
                />
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-base">Open Risks</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={state.risks}
                  onChange={(event) => onChange({ risks: event.target.value })}
                  placeholder="List unresolved risks, uncertainties, or blockers for this stage..."
                  className="min-h-28"
                />
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground text-pretty">
                {state.completed
                  ? "This stage is marked complete."
                  : ready
                    ? "All checklist items, questions, and quality gates are done."
                    : "Check all items, answer every question, and satisfy quality gates to enable completion."}
              </p>
              <Button onClick={markComplete} disabled={!ready || state.completed} className="shrink-0">
                <CheckCircle2 className="h-4 w-4" />
                {state.completed ? "Completed" : "Mark Stage Complete"}
              </Button>
            </div>
          </>
        )}

        <nav className="mt-8 flex items-center justify-between gap-4 border-t border-border pt-6">
          <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={onNext} disabled={!state.completed || isLast}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </main>
  )
}
