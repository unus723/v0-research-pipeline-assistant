"use client"

import { useState } from "react"
import { stages } from "@/lib/stages"
import { createInitialProjectState, createInitialStageState, type StageState } from "@/lib/project-state"
import { PipelineSidebar } from "@/components/pipeline-sidebar"
import { StageContent } from "@/components/stage-content"
import { GuidancePanel } from "@/components/guidance-panel"

export default function Page() {
  const [project, setProject] = useState(createInitialProjectState)

  const activeStage = stages.find((stage) => stage.id === project.currentStageId) ?? stages[0]
  const activeState = project.stages[activeStage.id] ?? createInitialStageState(activeStage)

  function selectStage(id: string) {
    setProject((prev) => ({ ...prev, currentStageId: id }))
  }

  function updateStageState(id: string, patch: Partial<StageState>) {
    setProject((prev) => ({
      ...prev,
      stages: { ...prev.stages, [id]: { ...prev.stages[id], ...patch } },
    }))
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <PipelineSidebar
        activeId={activeStage.id}
        onSelect={selectStage}
        projectTitle={project.projectTitle}
        stageStates={project.stages}
      />
      <StageContent
        stage={activeStage}
        state={activeState}
        onChange={(patch) => updateStageState(activeStage.id, patch)}
      />
      <GuidancePanel stage={activeStage} />
    </div>
  )
}
