"use client"

import { useRef, type ChangeEvent } from "react"
import { stages } from "@/lib/stages"
import { isStageAccessible, type StageState } from "@/lib/project-state"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Download, Lock, RotateCcw, Upload } from "lucide-react"
import { OrbitingAtom } from "@/components/interactive-visuals"

interface PipelineSidebarProps {
  activeId: string
  onSelect: (id: string) => void
  projectTitle: string
  onProjectTitleChange: (title: string) => void
  onResetProject: () => void
  onDownloadBackup: () => void
  onDownloadMarkdownPlan: () => void
  onImportBackup: (file: File) => void
  stageStates: Record<string, StageState>
}

export function PipelineSidebar({
  activeId,
  onSelect,
  projectTitle,
  onProjectTitleChange,
  onResetProject,
  onDownloadBackup,
  onDownloadMarkdownPlan,
  onImportBackup,
  stageStates,
}: PipelineSidebarProps) {
  const importInputRef = useRef<HTMLInputElement>(null)
  const completedCount = stages.filter((stage) => stageStates[stage.id]?.completed).length
  const progress = Math.round((completedCount / stages.length) * 100)

  function handleImportChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) onImportBackup(file)
    event.target.value = ""
  }

  return (
    <aside className="flex h-full min-h-0 w-full shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground sm:w-72">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <OrbitingAtom />
        <div className="leading-tight">
          <h1 className="text-sm font-semibold text-balance">Research Pipeline Assistant</h1>
        </div>
      </div>

      <div className="space-y-4 border-b border-sidebar-border px-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="project-title" className="text-xs font-medium text-muted-foreground">
            Project
          </Label>
          <Input
            id="project-title"
            value={projectTitle}
            onChange={(event) => onProjectTitleChange(event.target.value)}
            placeholder="Untitled project"
            className="h-8 bg-background"
          />
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Tabs defaultValue="stages" className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="px-4 pt-2 border-b border-sidebar-border/50 shrink-0">
            <TabsList className="w-full">
              <TabsTrigger value="stages" className="flex-1">Stages</TabsTrigger>
              <TabsTrigger value="project" className="flex-1">Project Data</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="stages" className="m-0 flex-1 min-h-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="h-full min-h-0">
              <nav className="flex flex-col gap-0.5 p-2" aria-label="Stage navigation">
                {stages.map((stage, index) => {
                  const isActive = stage.id === activeId
                  const isComplete = stageStates[stage.id]?.completed
                  return (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => onSelect(stage.id)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                        isActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium tabular-nums",
                          isComplete
                              ? "bg-chart-2 text-background"
                              : isActive
                                ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                                : "bg-sidebar-accent text-sidebar-accent-foreground",
                        )}
                      >
                        {isComplete ? (
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
          </TabsContent>

          <TabsContent value="project" className="m-0 flex-1 min-h-0 overflow-hidden data-[state=active]:flex data-[state=active]:flex-col">
            <ScrollArea className="h-full min-h-0">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Export</Label>
                  <Button type="button" variant="outline" size="sm" onClick={onDownloadMarkdownPlan} className="w-full justify-start border-primary/20 hover:border-primary/50">
                    <Download className="h-4 w-4 mr-2 text-primary" />
                    Markdown Plan
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={onDownloadBackup} className="w-full justify-start border-primary/20 hover:border-primary/50">
                    <Download className="h-4 w-4 mr-2 text-primary" />
                    JSON Backup
                  </Button>
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Import</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => importInputRef.current?.click()}
                    className="w-full justify-start"
                  >
                    <Upload className="h-4 w-4 mr-2 text-muted-foreground" />
                    Load JSON Backup
                  </Button>
                  <input ref={importInputRef} type="file" accept="application/json,.json" hidden onChange={handleImportChange} />
                </div>
                
                <div className="space-y-2 pt-2 border-t">
                  <Label className="text-xs font-medium text-destructive uppercase tracking-wider">Danger Zone</Label>
                  <Button type="button" variant="secondary" size="sm" onClick={onResetProject} className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive/10">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Pipeline
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}
