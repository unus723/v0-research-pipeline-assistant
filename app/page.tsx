"use client"

import { useState } from "react"
import { stages } from "@/lib/stages"
import {
  createInitialProjectState,
  createInitialStageState,
  isStageAccessible,
  type StageState,
} from "@/lib/project-state"
import { PipelineSidebar } from "@/components/pipeline-sidebar"
import { StageContent } from "@/components/stage-content"
import { GuidancePanel } from "@/components/guidance-panel"

export default function Page() {
  const [project, setProject] = useState(createInitialProjectState)

  const activeIndex = Math.max(
    0,
    stages.findIndex((stage) => stage.id === project.currentStageId),
  )
  const activeStage = stages[activeIndex]
  const activeState = project.stages[activeStage.id] ?? createInitialStageState(activeStage)

  function selectStage(id: string) {
    const index = stages.findIndex((stage) => stage.id === id)
    if (index === -1 || !isStageAccessible(project.stages, index)) return
    setProject((prev) => ({ ...prev, currentStageId: id }))
  }

  function goToIndex(index: number) {
    if (index < 0 || index >= stages.length) return
    if (!isStageAccessible(project.stages, index)) return
    setProject((prev) => ({ ...prev, currentStageId: stages[index].id }))
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
        isFirst={activeIndex === 0}
        isLast={activeIndex === stages.length - 1}
        onPrevious={() => goToIndex(activeIndex - 1)}
        onNext={() => goToIndex(activeIndex + 1)}
      />
      <GuidancePanel stage={activeStage} />
    </div>
  )
}
