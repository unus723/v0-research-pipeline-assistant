import type { Stage } from "@/lib/stages"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StageContentProps {
  stage: Stage
}

export function StageContent({ stage }: StageContentProps) {
  return (
    <main className="flex-1 overflow-y-auto bg-background">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-8">
          <Badge variant="secondary" className="mb-3 tabular-nums">
            Stage {stage.id}
          </Badge>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">{stage.title}</h2>
          <p className="mt-2 text-base leading-relaxed text-muted-foreground text-pretty">{stage.goal}</p>
        </header>

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
            <p className="text-sm leading-relaxed text-muted-foreground">
              Checklist items for this stage will appear here.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Guiding questions for this stage will appear here.
            </p>
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
      </div>
    </main>
  )
}
