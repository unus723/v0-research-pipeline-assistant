"use client"

import { Globe, Moon, Atom, BarChart3 } from "lucide-react"

export function RotatingEarth() {
  return (
    <div className="relative flex items-center justify-center h-10 w-10 overflow-hidden rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20">
      <Globe className="h-6 w-6 animate-[spin_10s_linear_infinite]" />
    </div>
  )
}

export function OrbitingAtom() {
  return (
    <div className="relative flex items-center justify-center h-10 w-10 overflow-hidden rounded-full bg-blue-500/10 text-blue-500 transition-colors hover:bg-blue-500/20">
      <Atom className="h-6 w-6 animate-[spin_8s_linear_infinite]" />
    </div>
  )
}

export function SpinningMoon() {
  return (
    <div className="relative flex items-center justify-center h-10 w-10 overflow-hidden rounded-full bg-slate-500/10 text-slate-500 transition-colors hover:bg-slate-500/20">
      <Moon className="h-6 w-6 animate-[spin_12s_linear_infinite]" />
    </div>
  )
}

export function ResearchInfographic() {
  return (
    <div className="relative flex items-center justify-center h-10 w-10 overflow-hidden rounded-full bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500/20 group">
      <BarChart3 className="h-6 w-6 transition-transform group-hover:scale-110 group-hover:animate-pulse" />
    </div>
  )
}

export function StageVisual({ stageId }: { stageId: string }) {
  // Return different visuals based on the stage mapping
  switch (stageId) {
    case "literature-review":
    case "gap-analysis":
      return <SpinningMoon />
    case "research-question":
    case "research-design":
      return <RotatingEarth />
    case "data-collection":
    case "experiments":
      return <OrbitingAtom />
    case "statistical-validation":
    case "contributions":
    default:
      return <ResearchInfographic />
  }
}
