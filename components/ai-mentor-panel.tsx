"use client"

import { useState } from "react"
import { Sparkles, X, ChevronRight, AlertTriangle, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { type ProjectState } from "@/lib/project-state"
import { stages } from "@/lib/stages"

interface AIMentorPanelProps {
  projectState: ProjectState
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const COMMON_ACTIONS = [
  { id: "review-assumptions", label: "Review My Assumptions" },
  { id: "suggest-baselines", label: "Suggest Missing Baselines" },
  { id: "reviewer-objections", label: "Generate Reviewer Objections" },
  { id: "draft-abstract", label: "Draft Abstract (Requires Stages 0-15)" },
  { id: "check-rq", label: "Check if RQ is measurable" }
]

export function AIMentorPanel({ projectState, isOpen, setIsOpen }: AIMentorPanelProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [mentorResponse, setMentorResponse] = useState<{
    response: string
    warnings: string[]
    suggestedNextAction: string
  } | null>(null)
  
  const currentStageInfo = stages.find((s) => s.id === projectState.currentStageId)

  const askMentor = async (action: string) => {
    setLoadingAction(action)
    setMentorResponse(null)
    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentStage: currentStageInfo,
          projectState,
          mentorAction: action
        })
      })
      if (!res.ok) {
        let errorMessage = "The AI Mentor is currently unavailable.";
        let errData;
        try {
          errData = await res.json();
          if (errData.error) errorMessage = typeof errData.error === 'string' ? errData.error : JSON.stringify(errData.error);
          if (errData.details) errorMessage += `\nDetails: ${errData.details}`;
        } catch (e) {
          errorMessage += ` Status: ${res.status} ${res.statusText}`;
        }
        
        setMentorResponse({
          response: errorMessage,
          warnings: errData?.error?.includes("configured") ? ["AI API key is not configured."] : ["Request failed."],
          suggestedNextAction: errData?.error?.includes("configured") 
            ? "Add an AI_API_KEY (or OPENAI_API_KEY) to your Vercel Environment Variables."
            : "Check provider configuration or try again."
        })
        return
      }
      const data = await res.json()
      setMentorResponse(data)
    } catch (err: any) {
      setMentorResponse({
        response: `Error: ${err.message}`,
        warnings: [],
        suggestedNextAction: "Try again later."
      })
    } finally {
      setLoadingAction(null)
    }
  }

  if (!isOpen) {
    return (
      <Button 
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 z-50 bg-indigo-600 hover:bg-indigo-700"
        onClick={() => setIsOpen(true)}
      >
        <Sparkles className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <div
      className={[
        "fixed inset-y-0 right-0 z-50 flex min-h-0 flex-col overflow-hidden border-l bg-background shadow-2xl transform transition-all duration-300",
        isCollapsed ? "w-20" : "w-80 sm:w-96",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2 border-b p-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-indigo-500" />
          {!isCollapsed ? <h2 className="text-lg font-semibold">AI Mentor</h2> : null}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed((current) => !current)}
            aria-label={isCollapsed ? "Expand AI Mentor" : "Collapse AI Mentor"}
          >
            {isCollapsed ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close AI Mentor">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {!isCollapsed ? (
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 p-4 pr-6 pb-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              I can analyze your project state and offer guidance. What would you like help with?
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Quick Actions</h3>
            <div className="flex flex-col space-y-2">
              {COMMON_ACTIONS.map(action => (
                <Button 
                  key={action.id}
                  variant="outline" 
                  className="justify-between"
                  onClick={() => askMentor(action.id)}
                  disabled={!!loadingAction}
                >
                  <span className="truncate mr-2">{action.label}</span>
                  {loadingAction === action.id ? (
                    <Sparkles className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {mentorResponse && (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <Separator />
              <Card className="bg-muted/50 border-indigo-100 dark:border-indigo-900/50">
                <CardContent className="pt-4 space-y-4">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {mentorResponse.response}
                  </div>
                  
                  {mentorResponse.warnings && mentorResponse.warnings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="flex items-center text-xs font-semibold text-amber-600 dark:text-amber-500">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Warnings
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {mentorResponse.warnings.map((w, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                            {w}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {mentorResponse.suggestedNextAction && (
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Suggested Next Action</h4>
                      <p className="text-sm flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-indigo-500" />
                        {mentorResponse.suggestedNextAction}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          </div>
        </ScrollArea>
      ) : null}
    </div>
  )
}
