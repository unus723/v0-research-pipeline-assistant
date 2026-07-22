"use client"

import { useEffect, useState } from "react"
import { stages } from "@/lib/stages"
import {
  createInitialProjectState,
  createInitialStageState,
  isStageAccessible,
  parseProjectStateJson,
  type AssumptionLogEntry,
  type DecisionLogEntry,
  type ExperimentResult,
  type Paper,
  type ProjectState,
  type StageState,
} from "@/lib/project-state"
import { PipelineSidebar } from "@/components/pipeline-sidebar"
import { StageContent } from "@/components/stage-content"
import { GuidancePanel } from "@/components/guidance-panel"
import { ThemeToggle } from "@/components/theme-toggle"
import { AIMentorPanel } from "@/components/ai-mentor-panel"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Info } from "lucide-react"

const STORAGE_KEY = "research-pipeline-assistant:project-state:v1"

function loadStoredProjectState(): ProjectState {
  if (typeof window === "undefined") return createInitialProjectState()

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return createInitialProjectState()
    return parseProjectStateJson(stored) ?? createInitialProjectState()
  } catch {
    return createInitialProjectState()
  }
}

function downloadJson(filename: string, data: ProjectState) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function downloadText(filename: string, content: string, type = "text/markdown") {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function createBackupFilename(projectTitle: string) {
  const base = projectTitle.trim() || "research-pipeline-backup"
  const safeBase = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  const timestamp = new Date().toISOString().slice(0, 10)
  return `${safeBase || "research-pipeline-backup"}-${timestamp}.json`
}

function createMarkdownFilename(projectTitle: string) {
  const base = projectTitle.trim() || "research-plan"
  const safeBase = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  const timestamp = new Date().toISOString().slice(0, 10)
  return `${safeBase || "research-plan"}-${timestamp}.md`
}

function md(value: string | undefined) {
  const text = value?.trim()
  return text ? text : "_Not provided._"
}

function escapeTableCell(value: string | undefined) {
  return md(value).replace(/\\|/g, "\\\\|").replace(/\\r?\\n/g, "<br>")
}

function createResearchPlanMarkdown(project: ProjectState) {
  const completedStages = stages.filter((stage) => project.stages[stage.id]?.completed).length
  const progress = `${completedStages}/${stages.length} stages complete`
  const lines: string[] = []

  lines.push(`# ${project.projectTitle.trim() || "Untitled Research Project"}`)
  lines.push("")
  lines.push(`**Completion Progress:** ${progress}`)
  lines.push("")
  lines.push("## Stages")
  lines.push("")

  for (const stage of stages) {
    const state = project.stages[stage.id] ?? createInitialStageState(stage)
    lines.push(`### Stage ${stage.number}: ${stage.title}`)
    lines.push("")
    lines.push(`- **Status:** ${state.completed ? "Complete" : "Incomplete"}`)
    lines.push(`- **Completed At:** ${state.completedAt || "Not completed"}`)
    lines.push("")

    lines.push("#### Checklist")
    if (stage.checklist.length === 0) {
      lines.push("- _No checklist items defined._")
    } else {
      stage.checklist.forEach((item, index) => {
        lines.push(`- [${state.checklist[index] ? "x" : " "}] ${item}`)
      })
    }
    lines.push("")

    lines.push("#### Answers")
    if (stage.questions.length === 0) {
      lines.push("_No questions defined._")
    } else {
      stage.questions.forEach((question, index) => {
        lines.push(`**${index + 1}. ${question}**`)
        lines.push("")
        lines.push(md(state.answers[index]))
        lines.push("")
      })
    }

    lines.push("#### Notes")
    lines.push(md(state.notes))
    lines.push("")
    lines.push("#### Risks")
    lines.push(md(state.risks))
    lines.push("")
  }

  lines.push("## Paper Library")
  lines.push("")
  if (project.papers.length === 0) {
    lines.push("_No papers added._")
  } else {
    project.papers.forEach((paper, index) => {
      lines.push("")
      lines.push(`### Paper ${index + 1}: ${paper.title.trim() || "Untitled Paper"}`)
      lines.push("")
      lines.push(`- **Authors:** ${md(paper.authors)}`)
      lines.push(`- **Year:** ${md(paper.year)}`)
      lines.push(`- **Venue:** ${md(paper.venue)}`)
      lines.push(`- **DOI/URL:** ${md(paper.doiOrUrl)}`)
      lines.push(`- **Relevance Score:** ${paper.relevanceScore}`)
      lines.push(`- **Tags:** ${paper.tags.join(", ") || "_None_"}`)
      lines.push("")
      lines.push(`**Summary:** ${md(paper.summary)}`)
      lines.push("")
      lines.push(`**Method:** ${md(paper.method)}`)
      lines.push("")
      lines.push(`**Dataset:** ${md(paper.dataset)}`)
      lines.push("")
      lines.push(`**Metrics:** ${md(paper.metrics)}`)
      lines.push("")
      lines.push(`**Limitations:** ${md(paper.limitations)}`)
      lines.push("")
    })
  }
  lines.push("")

  lines.push("## Experiment Tracker")
  lines.push("")
  if (project.experiments.length === 0) {
    lines.push("_No experiment results added._")
  } else {
    lines.push("| Experiment | Dataset | Method | Baseline | Metric | Value | Run Date | Notes |")
    lines.push("| --- | --- | --- | --- | --- | --- | --- | --- |")
    for (const experiment of project.experiments) {
      lines.push(
        `| ${escapeTableCell(experiment.experimentName)} | ${escapeTableCell(experiment.dataset)} | ${escapeTableCell(experiment.method)} | ${escapeTableCell(experiment.baseline)} | ${escapeTableCell(experiment.metric)} | ${escapeTableCell(experiment.value)} | ${escapeTableCell(experiment.runDate)} | ${escapeTableCell(experiment.notes)} |`,
      )
    }
  }
  lines.push("")

  lines.push("## Decision Log")
  lines.push("")
  if (project.decisions.length === 0) {
    lines.push("_No decisions logged._")
  } else {
    lines.push("| Date | Decision | Reason | Alternatives Considered |")
    lines.push("| --- | --- | --- | --- |")
    for (const decision of project.decisions) {
      lines.push(
        `| ${escapeTableCell(decision.date)} | ${escapeTableCell(decision.decision)} | ${escapeTableCell(decision.reason)} | ${escapeTableCell(decision.alternativesConsidered)} |`,
      )
    }
  }
  lines.push("")

  lines.push("## Assumptions Log")
  lines.push("")
  if (project.assumptions.length === 0) {
    lines.push("_No assumptions logged._")
  } else {
    lines.push("| Assumption | Why Assumed | Risk If False | Validation Plan |")
    lines.push("| --- | --- | --- | --- |")
    for (const assumption of project.assumptions) {
      lines.push(
        `| ${escapeTableCell(assumption.assumption)} | ${escapeTableCell(assumption.whyAssumed)} | ${escapeTableCell(assumption.riskIfFalse)} | ${escapeTableCell(assumption.validationPlan)} |`,
      )
    }
  }
  lines.push("")

  return lines.join("\\n")
}

export default function Page() {
  const [project, setProject] = useState<ProjectState>(() => createInitialProjectState())
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false)
  const [isMentorOpen, setIsMentorOpen] = useState(false)

  useEffect(() => {
    setProject(loadStoredProjectState())
    setHasLoadedStorage(true)
  }, [])

  useEffect(() => {
    if (!hasLoadedStorage) return

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
    } catch {
      // Storage can fail in private mode or when quota is exceeded. Keep the app usable.
    }
  }, [project, hasLoadedStorage])

  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === project.currentStageId),
  )
  const activeStage = stages[activeIndex]
  const activeState = project.stages[activeStage.id] ?? createInitialStageState(activeStage)

  function selectStage(id: string) {
    const index = stages.findIndex((stage) => stage.id === id)
    if (index === -1) return
    setProject((prev) => ({ ...prev, currentStageId: id }))
  }

  function goToIndex(index: number) {
    if (index < 0 || index >= stages.length) return
    setProject((prev) => ({ ...prev, currentStageId: stages[index].id }))
  }

  function updateProjectTitle(projectTitle: string) {
    setProject((prev) => ({ ...prev, projectTitle }))
  }

  function updateStageState(id: string, patch: Partial<StageState>) {
    setProject((prev) => ({
      ...prev,
      stages: { ...prev.stages, [id]: { ...prev.stages[id], ...patch } },
    }))
  }

  function addPaper(paper: Paper) {
    setProject((prev) => ({ ...prev, papers: [...prev.papers, paper] }))
  }

  function updatePaper(id: string, paper: Paper) {
    setProject((prev) => ({
      ...prev,
      papers: prev.papers.map((existing) => (existing.id === id ? paper : existing)),
    }))
  }

  function deletePaper(id: string) {
    setProject((prev) => ({
      ...prev,
      papers: prev.papers.filter((paper) => paper.id !== id),
    }))
  }

  function addExperiment(experiment: ExperimentResult) {
    setProject((prev) => ({ ...prev, experiments: [...prev.experiments, experiment] }))
  }

  function updateExperiment(id: string, experiment: ExperimentResult) {
    setProject((prev) => ({
      ...prev,
      experiments: prev.experiments.map((existing) => (existing.id === id ? experiment : existing)),
    }))
  }

  function deleteExperiment(id: string) {
    setProject((prev) => ({
      ...prev,
      experiments: prev.experiments.filter((experiment) => experiment.id !== id),
    }))
  }

  function addDecision(decision: DecisionLogEntry) {
    setProject((prev) => ({ ...prev, decisions: [...prev.decisions, decision] }))
  }

  function updateDecision(id: string, decision: DecisionLogEntry) {
    setProject((prev) => ({
      ...prev,
      decisions: prev.decisions.map((existing) => (existing.id === id ? decision : existing)),
    }))
  }

  function deleteDecision(id: string) {
    setProject((prev) => ({
      ...prev,
      decisions: prev.decisions.filter((decision) => decision.id !== id),
    }))
  }

  function addAssumption(assumption: AssumptionLogEntry) {
    setProject((prev) => ({ ...prev, assumptions: [...prev.assumptions, assumption] }))
  }

  function updateAssumption(id: string, assumption: AssumptionLogEntry) {
    setProject((prev) => ({
      ...prev,
      assumptions: prev.assumptions.map((existing) => (existing.id === id ? assumption : existing)),
    }))
  }

  function deleteAssumption(id: string) {
    setProject((prev) => ({
      ...prev,
      assumptions: prev.assumptions.filter((assumption) => assumption.id !== id),
    }))
  }

  function resetProject() {
    const confirmed = window.confirm("Reset this project? This clears all saved progress in this browser.")
    if (!confirmed) return
    setProject(createInitialProjectState())
  }

  function downloadBackup() {
    downloadJson(createBackupFilename(project.projectTitle), project)
  }

  function downloadMarkdownPlan() {
    downloadText(createMarkdownFilename(project.projectTitle), createResearchPlanMarkdown(project))
  }

  async function importBackup(file: File) {
    const text = await file.text()
    const imported = parseProjectStateJson(text)

    if (!imported) {
      window.alert("This backup file is not a valid Research Pipeline Assistant project.")
      return
    }

    setProject(imported)
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex flex-none items-center justify-between border-b px-4 py-3 bg-muted/30">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SheetHeader className="sr-only">
              <SheetTitle>Pipeline Navigation</SheetTitle>
            </SheetHeader>
            <PipelineSidebar
              activeId={activeStage.id}
              onSelect={(id) => {
                selectStage(id)
                setIsSidebarOpen(false)
              }}
              projectTitle={project.projectTitle}
              onProjectTitleChange={updateProjectTitle}
              onResetProject={resetProject}
              onDownloadBackup={downloadBackup}
              onDownloadMarkdownPlan={downloadMarkdownPlan}
              onImportBackup={importBackup}
              stageStates={project.stages}
            />
          </SheetContent>
        </Sheet>
        
        <h1 className="text-sm font-semibold truncate px-2 text-foreground">{activeStage.title}</h1>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isGuidanceOpen} onOpenChange={setIsGuidanceOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Info className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-80 sm:w-96">
              <SheetHeader className="sr-only">
                <SheetTitle>Guidance</SheetTitle>
              </SheetHeader>
              <GuidancePanel stage={activeStage} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="hidden md:block h-full min-h-0">
          <PipelineSidebar
            activeId={activeStage.id}
            onSelect={selectStage}
            projectTitle={project.projectTitle}
            onProjectTitleChange={updateProjectTitle}
            onResetProject={resetProject}
            onDownloadBackup={downloadBackup}
            onDownloadMarkdownPlan={downloadMarkdownPlan}
            onImportBackup={importBackup}
            stageStates={project.stages}
          />
        </div>
        <div className="flex-1 flex min-h-0 flex-col min-w-0 overflow-y-auto">
          <div className="hidden md:flex justify-end p-4 pb-0">
            <ThemeToggle />
          </div>
          <StageContent
            stage={activeStage}
            state={activeState}
            onChange={(patch) => updateStageState(activeStage.id, patch)}
            papers={project.papers}
            onAddPaper={addPaper}
            onUpdatePaper={updatePaper}
            onDeletePaper={deletePaper}
            experiments={project.experiments}
            onAddExperiment={addExperiment}
            onUpdateExperiment={updateExperiment}
            onDeleteExperiment={deleteExperiment}
            decisions={project.decisions}
            onAddDecision={addDecision}
            onUpdateDecision={updateDecision}
            onDeleteDecision={deleteDecision}
            assumptions={project.assumptions}
            onAddAssumption={addAssumption}
            onUpdateAssumption={updateAssumption}
            onDeleteAssumption={deleteAssumption}
            isFirst={activeIndex === 0}
            isLast={activeIndex === stages.length - 1}
            onPrevious={() => goToIndex(activeIndex - 1)}
            onNext={() => goToIndex(activeIndex + 1)}
          />
        </div>
        <div className="hidden xl:block h-full min-h-0">
          <GuidancePanel stage={activeStage} />
        </div>
      </div>
      
      <AIMentorPanel 
        projectState={project}
        isOpen={isMentorOpen}
        setIsOpen={setIsMentorOpen}
      />
    </div>
  )
}
