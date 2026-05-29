"use client"

import { stages } from "@/lib/stages"
import { isStageAccessible, type StageState } from "@/lib/project-state"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, FlaskConical, Lock } from "lucide-react"

interface PipelineSidebarProps {
  activeId: string
  onSelect: (id: string) => void
  projectTitle: string
  stageStates: Record<string, StageState>
}

export function PipelineSidebar({ activeId, onSelect, projectTitle, stageStates }: PipelineSidebarProps) {
  const completedCount = stages.filter((stage) => stageStates[stage.id]?.completed).length
  const progress = Math.round((completedCount / stages.length) * 100)

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2 border-b border-sidebar-border px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <FlaskConical className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-balance">Research Pipeline Assistant</h1>
        </div>
      </div>

      <div className="space-y-3 border-b border-sidebar-border px-4 py-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Project</p>
          <p className={cn("text-sm", projectTitle ? "text-sidebar-foreground" : "text-muted-foreground/70 italic")}>
            {projectTitle || "Untitled project"}
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Progress</p>
            <span className="text-xs text-muted-foreground/70 tabular-nums">
              {completedCount}/{stages.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-0.5 p-2" aria-label="Stage navigation">
          {stages.map((stage, index) => {
            const isActive = stage.id === activeId
            const isComplete = stageStates[stage.id]?.completed
            const isLocked = !isStageAccessible(stageStates, index)
            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => onSelect(stage.id)}
                disabled={isLocked}
                aria-current={isActive ? "page" : undefined}
                aria-disabled={isLocked}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  isLocked
                    ? "cursor-not-allowed text-muted-foreground/50"
                    : isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium tabular-nums",
                    isLocked
                      ? "bg-sidebar-accent/50 text-muted-foreground/50"
                      : isComplete
                        ? "bg-chart-2 text-background"
                        : isActive
                          ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                          : "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  {isLocked ? (
                    <Lock className="h-3 w-3" />
                  ) : isComplete ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    stage.number
                  )}
                </span>
                <span className="truncate">{stage.title}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
