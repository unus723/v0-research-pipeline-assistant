"use client"

import { useMemo, useState } from "react"
import type { ExperimentResult } from "@/lib/project-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus, Trash2, X } from "lucide-react"

type ExperimentDraft = Omit<ExperimentResult, "id">

interface ExperimentTrackerProps {
  experiments: ExperimentResult[]
  onAddExperiment: (experiment: ExperimentResult) => void
  onUpdateExperiment: (id: string, experiment: ExperimentResult) => void
  onDeleteExperiment: (id: string) => void
}

const emptyDraft: ExperimentDraft = {
  experimentName: "",
  dataset: "",
  method: "",
  baseline: "",
  metric: "",
  value: "",
  notes: "",
  runDate: "",
}

function createExperimentId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `experiment-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function uniqueCount(values: string[]) {
  return new Set(values.map((value) => value.trim()).filter(Boolean)).size
}

export function ExperimentTracker({
  experiments,
  onAddExperiment,
  onUpdateExperiment,
  onDeleteExperiment,
}: ExperimentTrackerProps) {
  const [draft, setDraft] = useState<ExperimentDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)

  const summary = useMemo(
    () => ({
      totalExperiments: experiments.length,
      uniqueDatasets: uniqueCount(experiments.map((experiment) => experiment.dataset)),
      uniqueBaselines: uniqueCount(experiments.map((experiment) => experiment.baseline)),
      uniqueMetrics: uniqueCount(experiments.map((experiment) => experiment.metric)),
    }),
    [experiments],
  )

  function updateDraft<K extends keyof ExperimentDraft>(key: K, value: ExperimentDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function resetForm() {
    setDraft(emptyDraft)
    setEditingId(null)
  }

  function submitExperiment() {
    if (!draft.experimentName.trim()) {
      window.alert("Enter an experiment name before adding it to the tracker.")
      return
    }

    if (editingId) {
      onUpdateExperiment(editingId, { id: editingId, ...draft })
    } else {
      onAddExperiment({ id: createExperimentId(), ...draft })
    }
    resetForm()
  }

  function startEdit(experiment: ExperimentResult) {
    const { id: _id, ...nextDraft } = experiment
    setDraft(nextDraft)
    setEditingId(experiment.id)
  }

  function deleteExperiment(id: string) {
    const confirmed = window.confirm("Delete this experiment result?")
    if (!confirmed) return
    if (editingId === id) resetForm()
    onDeleteExperiment(id)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Experiment Tracker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Total experiments</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.totalExperiments}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Unique datasets</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.uniqueDatasets}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Unique baselines</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.uniqueBaselines}</p>
          </div>
          <div className="rounded-md border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground">Unique metrics</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{summary.uniqueMetrics}</p>
          </div>
        </div>

        <section className="space-y-4 rounded-md border border-border p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="experiment-name">Experiment name</Label>
              <Input
                id="experiment-name"
                value={draft.experimentName}
                onChange={(event) => updateDraft("experimentName", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-date">Run date</Label>
              <Input
                id="experiment-date"
                type="date"
                value={draft.runDate}
                onChange={(event) => updateDraft("runDate", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-dataset">Dataset</Label>
              <Input
                id="experiment-dataset"
                value={draft.dataset}
                onChange={(event) => updateDraft("dataset", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-method">Method</Label>
              <Input
                id="experiment-method"
                value={draft.method}
                onChange={(event) => updateDraft("method", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-baseline">Baseline</Label>
              <Input
                id="experiment-baseline"
                value={draft.baseline}
                onChange={(event) => updateDraft("baseline", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-metric">Metric</Label>
              <Input
                id="experiment-metric"
                value={draft.metric}
                onChange={(event) => updateDraft("metric", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiment-value">Value</Label>
              <Input
                id="experiment-value"
                value={draft.value}
                onChange={(event) => updateDraft("value", event.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="experiment-notes">Notes</Label>
              <Textarea
                id="experiment-notes"
                value={draft.notes}
                onChange={(event) => updateDraft("notes", event.target.value)}
                className="min-h-24"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submitExperiment}>
              <Plus className="h-4 w-4" />
              {editingId ? "Save Experiment" : "Add Experiment"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="h-4 w-4" />
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </section>

        <section className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2 font-medium">Experiment</th>
                <th className="px-3 py-2 font-medium">Dataset</th>
                <th className="px-3 py-2 font-medium">Method</th>
                <th className="px-3 py-2 font-medium">Baseline</th>
                <th className="px-3 py-2 font-medium">Metric</th>
                <th className="px-3 py-2 font-medium">Value</th>
                <th className="px-3 py-2 font-medium">Run date</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                    No experiment results have been added yet.
                  </td>
                </tr>
              ) : (
                experiments.map((experiment) => (
                  <tr key={experiment.id} className="border-t border-border align-top">
                    <td className="px-3 py-3">
                      <div className="font-medium text-pretty">{experiment.experimentName}</div>
                      {experiment.notes ? (
                        <div className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground text-pretty">
                          {experiment.notes}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3">{experiment.dataset}</td>
                    <td className="px-3 py-3">{experiment.method}</td>
                    <td className="px-3 py-3">{experiment.baseline}</td>
                    <td className="px-3 py-3">{experiment.metric}</td>
                    <td className="px-3 py-3">{experiment.value}</td>
                    <td className="px-3 py-3">{experiment.runDate}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => startEdit(experiment)}>
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={() => deleteExperiment(experiment.id)}>
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
        </section>
      </CardContent>
    </Card>
  )
}
