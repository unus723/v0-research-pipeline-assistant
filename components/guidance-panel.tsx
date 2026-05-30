"use client"

import { useState } from "react"
import type { Stage } from "@/lib/stages"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Lightbulb, AlertTriangle, ShieldAlert, FileCheck, Gavel } from "lucide-react"

interface GuidancePanelProps {
  stage: Stage
}

const generalBrutalReviewQuestions = [
  "Is this actually novel?",
  "Is this enough for the target venue?",
  "Are the baselines fair?",
  "Are the claims stronger than the evidence?",
  "Can someone reproduce this?",
  "What is the most likely rejection reason?",
  "What would a skeptical expert attack first?",
]

const stageBrutalReviewQuestions: Record<string, string[]> = {
  "literature-review": [
    "What is the closest paper that already did this?",
    "Are you ignoring inconvenient prior work?",
    "Did you verify DOI, venue, and publication quality?",
  ],
  "gap-analysis": [
    "Is this gap important or merely available?",
    "Would solving this change anything?",
    "Is this a real gap or a framing trick?",
  ],
  "research-question": [
    "Can this be answered experimentally?",
    "Is it too broad for one paper?",
    "Can it be falsified?",
  ],
  "research-design": ["Are your baselines weak?", "Are your metrics sufficient?", "Is the protocol fair?"],
  experiments: ["Did you cherry-pick results?", "Are failures reported?", "Are results stable?"],
  contributions: [
    "Are these real contributions or implementation details?",
    "Which claim is least defensible?",
    "Are you overclaiming?",
  ],
}

export function GuidancePanel({ stage }: GuidancePanelProps) {
  const [showBrutalReview, setShowBrutalReview] = useState(false)
  const { whyThisMatters, commonMistakes, reviewerWarning, requiredOutput } = stage
  const hasGuidance = whyThisMatters.length > 0 || commonMistakes.length > 0 || reviewerWarning.length > 0
  const stageQuestions = stageBrutalReviewQuestions[stage.id] ?? []

  return (
    <aside className="h-full w-full sm:w-80 shrink-0 border-l border-border bg-card">
      <ScrollArea className="h-full">
        <div className="space-y-6 p-5">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Guidance</p>
            <Button
              type="button"
              variant={showBrutalReview ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBrutalReview((current) => !current)}
              className="w-full justify-start"
            >
              <Gavel className="h-4 w-4" />
              Brutal Review Mode
            </Button>
          </div>

          {showBrutalReview ? (
            <section className="space-y-4 rounded-md border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2">
                <Gavel className="h-4 w-4 text-destructive" />
                <h3 className="text-sm font-medium">Reviewer-style critique</h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">General</p>
                <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                  {generalBrutalReviewQuestions.map((question) => (
                    <li key={question}>{question}</li>
                  ))}
                </ul>
              </div>

              {stageQuestions.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stage.title}</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {stageQuestions.map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {!hasGuidance ? (
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Guidance for this stage has not been written yet.
            </p>
          ) : (
            <>
              {whyThisMatters ? (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-chart-4" />
                    <h3 className="text-sm font-medium">Why this stage matters</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{whyThisMatters}</p>
                </section>
              ) : null}

              {commonMistakes.length > 0 ? (
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
              ) : null}

              {reviewerWarning ? (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-medium">Reviewer warning</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{reviewerWarning}</p>
                </section>
              ) : null}

              {requiredOutput ? (
                <section className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-chart-2" />
                    <h3 className="text-sm font-medium">Required output</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{requiredOutput}</p>
                </section>
              ) : null}
            </>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
