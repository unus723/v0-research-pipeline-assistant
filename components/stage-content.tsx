import type { Stage } from "@/lib/stages"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface StageContentProps {
  stage: Stage
}

export function StageContent({ stage }: StageContentProps) {
  const hasDetail = stage.explanation.length > 0

  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-8">
          <Badge variant="secondary" className="mb-3 tabular-nums">
            Stage {stage.number}
          </Badge>
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
                        <Checkbox id={itemId} className="mt-0.5" />
                        <label
                          htmlFor={itemId}
                          className="text-sm leading-relaxed text-foreground text-pretty"
                        >
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
              <CardContent>
                <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {stage.questions.map((question) => (
                    <li key={question} className="text-pretty">
                      {question}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stage Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Your notes for this stage will appear here.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  )
}
