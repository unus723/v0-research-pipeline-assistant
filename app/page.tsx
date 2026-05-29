"use client"

import { useState } from "react"
import { stages } from "@/lib/stages"
import { PipelineSidebar } from "@/components/pipeline-sidebar"
import { StageContent } from "@/components/stage-content"
import { GuidancePanel } from "@/components/guidance-panel"

export default function Page() {
  const [activeNumber, setActiveNumber] = useState(0)
  const activeStage = stages.find((stage) => stage.number === activeNumber) ?? stages[0]

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <PipelineSidebar activeNumber={activeNumber} onSelect={setActiveNumber} />
      <StageContent stage={activeStage} />
      <GuidancePanel stage={activeStage} />
    </div>
  )
}
