import type { Stage } from "@/lib/stages"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lightbulb, AlertTriangle, ShieldAlert, FileCheck } from "lucide-react"

interface GuidancePanelProps {
  stage: Stage
}

export function GuidancePanel({ stage }: GuidancePanelProps) {
  const { whyItMatters, commonMistakes, reviewerWarning, requiredOutput } = stage.guidance

  return (
    <aside className="hidden w-80 shrink-0 border-l border-border bg-card xl:block">
      <ScrollArea className="h-full">
        <div className="space-y-6 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guidance</p>

          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-chart-4" />
              <h3 className="text-sm font-medium">Why this stage matters</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{whyItMatters}</p>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-chart-5" />
              <h3 className="text-sm font-medium">Common mistakes</h3>
            </div>
            <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
              {commonMistakes.map((mistake) => (
                <li key={mistake}>{mistake}</li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive" />
              <h3 className="text-sm font-medium">Reviewer warning</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{reviewerWarning}</p>
          </section>

          <section className="space-y-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-chart-2" />
              <h3 className="text-sm font-medium">Required output</h3>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{requiredOutput}</p>
          </section>
        </div>
      </ScrollArea>
    </aside>
  )
}
