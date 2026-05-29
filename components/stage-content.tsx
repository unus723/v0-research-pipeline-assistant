import type { Stage } from "@/lib/stages"
import { type StageState, getStageStatus, isStageReady } from "@/lib/project-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"

interface StageContentProps {
  stage: Stage
  state: StageState
  onChange: (patch: Partial<StageState>) => void
}

const statusConfig = {
  incomplete: { label: "Incomplete", variant: "secondary" as const },
  ready: { label: "Ready to Complete", variant: "default" as const },
  complete: { label: "Complete", variant: "default" as const },
}

export function StageContent({ stage, state, onChange }: StageContentProps) {
  const hasDetail = stage.explanation.length > 0
  const status = getStageStatus(stage, state)
  const ready = isStageReady(stage, state)

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
        <header className="mb-8">
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
        </header>

        {!hasDetail ? (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                Detailed guidance for this stage has not been written yet.
              </p>
            </CardContent>
          </Card>
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
                    ? "All checklist items and questions are done."
                    : "Check all items and answer every question to enable completion."}
              </p>
              <Button onClick={markComplete} disabled={!ready || state.completed} className="shrink-0">
                <CheckCircle2 className="h-4 w-4" />
                {state.completed ? "Completed" : "Mark Stage Complete"}
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
