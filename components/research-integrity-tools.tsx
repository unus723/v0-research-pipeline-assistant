"use client"

import { useState } from "react"
import type { AssumptionLogEntry, DecisionLogEntry } from "@/lib/project-state"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ClipboardCheck, Pencil, Plus, Trash2, X } from "lucide-react"

type DecisionDraft = Omit<DecisionLogEntry, "id">
type AssumptionDraft = Omit<AssumptionLogEntry, "id">

interface ResearchIntegrityToolsProps {
  reminder: string
  decisions: DecisionLogEntry[]
  onAddDecision: (decision: DecisionLogEntry) => void
  onUpdateDecision: (id: string, decision: DecisionLogEntry) => void
  onDeleteDecision: (id: string) => void
  assumptions: AssumptionLogEntry[]
  onAddAssumption: (assumption: AssumptionLogEntry) => void
  onUpdateAssumption: (id: string, assumption: AssumptionLogEntry) => void
  onDeleteAssumption: (id: string) => void
}

const emptyDecision: DecisionDraft = {
  date: "",
  decision: "",
  reason: "",
  alternativesConsidered: "",
}

const emptyAssumption: AssumptionDraft = {
  assumption: "",
  whyAssumed: "",
  riskIfFalse: "",
  validationPlan: "",
}

function createEntryId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function ResearchIntegrityTools({
  reminder,
  decisions,
  onAddDecision,
  onUpdateDecision,
  onDeleteDecision,
  assumptions,
  onAddAssumption,
  onUpdateAssumption,
  onDeleteAssumption,
}: ResearchIntegrityToolsProps) {
  const [decisionDraft, setDecisionDraft] = useState<DecisionDraft>(emptyDecision)
  const [editingDecisionId, setEditingDecisionId] = useState<string | null>(null)
  const [assumptionDraft, setAssumptionDraft] = useState<AssumptionDraft>(emptyAssumption)
  const [editingAssumptionId, setEditingAssumptionId] = useState<string | null>(null)

  function updateDecisionDraft<K extends keyof DecisionDraft>(key: K, value: DecisionDraft[K]) {
    setDecisionDraft((prev) => ({ ...prev, [key]: value }))
  }

  function updateAssumptionDraft<K extends keyof AssumptionDraft>(key: K, value: AssumptionDraft[K]) {
    setAssumptionDraft((prev) => ({ ...prev, [key]: value }))
  }

  function resetDecisionForm() {
    setDecisionDraft(emptyDecision)
    setEditingDecisionId(null)
  }

  function resetAssumptionForm() {
    setAssumptionDraft(emptyAssumption)
    setEditingAssumptionId(null)
  }

  function submitDecision() {
    if (!decisionDraft.decision.trim()) {
      window.alert("Enter a decision before adding it to the log.")
      return
    }

    if (editingDecisionId) {
      onUpdateDecision(editingDecisionId, { id: editingDecisionId, ...decisionDraft })
    } else {
      onAddDecision({ id: createEntryId("decision"), ...decisionDraft })
    }
    resetDecisionForm()
  }

  function submitAssumption() {
    if (!assumptionDraft.assumption.trim()) {
      window.alert("Enter an assumption before adding it to the log.")
      return
    }

    if (editingAssumptionId) {
      onUpdateAssumption(editingAssumptionId, { id: editingAssumptionId, ...assumptionDraft })
    } else {
      onAddAssumption({ id: createEntryId("assumption"), ...assumptionDraft })
    }
    resetAssumptionForm()
  }

  function startDecisionEdit(entry: DecisionLogEntry) {
    const { id: _id, ...draft } = entry
    setDecisionDraft(draft)
    setEditingDecisionId(entry.id)
  }

  function startAssumptionEdit(entry: AssumptionLogEntry) {
    const { id: _id, ...draft } = entry
    setAssumptionDraft(draft)
    setEditingAssumptionId(entry.id)
  }

  function deleteDecision(id: string) {
    const confirmed = window.confirm("Delete this decision log entry?")
    if (!confirmed) return
    if (editingDecisionId === id) resetDecisionForm()
    onDeleteDecision(id)
  }

  function deleteAssumption(id: string) {
    const confirmed = window.confirm("Delete this assumption log entry?")
    if (!confirmed) return
    if (editingAssumptionId === id) resetAssumptionForm()
    onDeleteAssumption(id)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Research Integrity Tools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <ClipboardCheck className="h-4 w-4" />
          <AlertTitle>Integrity reminder</AlertTitle>
          <AlertDescription>{reminder}</AlertDescription>
        </Alert>

        <section className="space-y-4 rounded-md border border-border p-4">
          <div>
            <h3 className="text-sm font-medium">Decision Log</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Record important choices and the alternatives considered before committing to a design or analysis path.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="decision-date">Date</Label>
              <Input
                id="decision-date"
                type="date"
                value={decisionDraft.date}
                onChange={(event) => updateDecisionDraft("date", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="decision-text">Decision</Label>
              <Textarea
                id="decision-text"
                value={decisionDraft.decision}
                onChange={(event) => updateDecisionDraft("decision", event.target.value)}
                className="min-h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decision-reason">Reason</Label>
              <Textarea
                id="decision-reason"
                value={decisionDraft.reason}
                onChange={(event) => updateDecisionDraft("reason", event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="decision-alternatives">Alternatives considered</Label>
              <Textarea
                id="decision-alternatives"
                value={decisionDraft.alternativesConsidered}
                onChange={(event) => updateDecisionDraft("alternativesConsidered", event.target.value)}
                className="min-h-24"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submitDecision}>
              <Plus className="h-4 w-4" />
              {editingDecisionId ? "Save Decision" : "Add Decision"}
            </Button>
            {editingDecisionId ? (
              <Button type="button" variant="outline" onClick={resetDecisionForm}>
                <X className="h-4 w-4" />
                Cancel Edit
              </Button>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Date</th>
                  <th className="px-3 py-2 font-medium">Decision</th>
                  <th className="px-3 py-2 font-medium">Reason</th>
                  <th className="px-3 py-2 font-medium">Alternatives</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {decisions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No decisions have been logged yet.
                    </td>
                  </tr>
                ) : (
                  decisions.map((entry) => (
                    <tr key={entry.id} className="border-t border-border align-top">
                      <td className="px-3 py-3">{entry.date}</td>
                      <td className="px-3 py-3">{entry.decision}</td>
                      <td className="px-3 py-3">{entry.reason}</td>
                      <td className="px-3 py-3">{entry.alternativesConsidered}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startDecisionEdit(entry)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => deleteDecision(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-4 rounded-md border border-border p-4">
          <div>
            <h3 className="text-sm font-medium">Assumptions Log</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Track assumptions explicitly so unresolved risk is visible before data collection, experimentation, and
              validation.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assumption-text">Assumption</Label>
              <Textarea
                id="assumption-text"
                value={assumptionDraft.assumption}
                onChange={(event) => updateAssumptionDraft("assumption", event.target.value)}
                className="min-h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assumption-why">Why assumed</Label>
              <Textarea
                id="assumption-why"
                value={assumptionDraft.whyAssumed}
                onChange={(event) => updateAssumptionDraft("whyAssumed", event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assumption-risk">Risk if false</Label>
              <Textarea
                id="assumption-risk"
                value={assumptionDraft.riskIfFalse}
                onChange={(event) => updateAssumptionDraft("riskIfFalse", event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assumption-validation">Validation plan</Label>
              <Textarea
                id="assumption-validation"
                value={assumptionDraft.validationPlan}
                onChange={(event) => updateAssumptionDraft("validationPlan", event.target.value)}
                className="min-h-24"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submitAssumption}>
              <Plus className="h-4 w-4" />
              {editingAssumptionId ? "Save Assumption" : "Add Assumption"}
            </Button>
            {editingAssumptionId ? (
              <Button type="button" variant="outline" onClick={resetAssumptionForm}>
                <X className="h-4 w-4" />
                Cancel Edit
              </Button>
            ) : null}
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Assumption</th>
                  <th className="px-3 py-2 font-medium">Why assumed</th>
                  <th className="px-3 py-2 font-medium">Risk if false</th>
                  <th className="px-3 py-2 font-medium">Validation plan</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assumptions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      No assumptions have been logged yet.
                    </td>
                  </tr>
                ) : (
                  assumptions.map((entry) => (
                    <tr key={entry.id} className="border-t border-border align-top">
                      <td className="px-3 py-3">{entry.assumption}</td>
                      <td className="px-3 py-3">{entry.whyAssumed}</td>
                      <td className="px-3 py-3">{entry.riskIfFalse}</td>
                      <td className="px-3 py-3">{entry.validationPlan}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startAssumptionEdit(entry)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => deleteAssumption(entry.id)}>
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
