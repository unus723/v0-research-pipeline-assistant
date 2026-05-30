"use client"

import { useMemo, useState } from "react"
import { PAPER_TAGS, type Paper, type PaperTag } from "@/lib/project-state"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus, Trash2, X } from "lucide-react"

type PaperDraft = Omit<Paper, "id">

interface PaperLibraryProps {
  papers: Paper[]
  onAddPaper: (paper: Paper) => void
  onUpdatePaper: (id: string, paper: Paper) => void
  onDeletePaper: (id: string) => void
}

const emptyDraft: PaperDraft = {
  title: "",
  authors: "",
  year: "",
  venue: "",
  doiOrUrl: "",
  summary: "",
  method: "",
  dataset: "",
  metrics: "",
  limitations: "",
  relevanceScore: 3,
  tags: [],
}

function createPaperId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `paper-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function uniqueYears(papers: Paper[]) {
  return [...new Set(papers.map((paper) => paper.year.trim()).filter(Boolean))].sort((a, b) => b.localeCompare(a))
}

export function PaperLibrary({ papers, onAddPaper, onUpdatePaper, onDeletePaper }: PaperLibraryProps) {
  const [draft, setDraft] = useState<PaperDraft>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState<"all" | PaperTag>("all")
  const [scoreFilter, setScoreFilter] = useState<"all" | Paper["relevanceScore"]>("all")
  const [yearFilter, setYearFilter] = useState("all")

  const years = useMemo(() => uniqueYears(papers), [papers])
  const filteredPapers = useMemo(
    () =>
      papers.filter((paper) => {
        const matchesTag = tagFilter === "all" || paper.tags.includes(tagFilter)
        const matchesScore = scoreFilter === "all" || paper.relevanceScore === scoreFilter
        const matchesYear = yearFilter === "all" || paper.year.trim() === yearFilter
        return matchesTag && matchesScore && matchesYear
      }),
    [papers, scoreFilter, tagFilter, yearFilter],
  )

  function updateDraft<K extends keyof PaperDraft>(key: K, value: PaperDraft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }

  function toggleTag(tag: PaperTag, checked: boolean) {
    setDraft((prev) => ({
      ...prev,
      tags: checked ? [...prev.tags, tag] : prev.tags.filter((existing) => existing !== tag),
    }))
  }

  function resetForm() {
    setDraft(emptyDraft)
    setEditingId(null)
  }

  function submitPaper() {
    if (!draft.title.trim()) {
      window.alert("Enter a paper title before adding it to the library.")
      return
    }

    if (editingId) {
      onUpdatePaper(editingId, { id: editingId, ...draft })
    } else {
      onAddPaper({ id: createPaperId(), ...draft })
    }
    resetForm()
  }

  function startEdit(paper: Paper) {
    const { id: _id, ...nextDraft } = paper
    setDraft(nextDraft)
    setEditingId(paper.id)
  }

  function deletePaper(id: string) {
    const confirmed = window.confirm("Delete this paper from the library?")
    if (!confirmed) return
    if (editingId === id) resetForm()
    onDeletePaper(id)
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-base">Paper Library</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-4 rounded-md border border-border p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paper-title">Title</Label>
              <Input id="paper-title" value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-authors">Authors</Label>
              <Input
                id="paper-authors"
                value={draft.authors}
                onChange={(event) => updateDraft("authors", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-year">Year</Label>
              <Input id="paper-year" value={draft.year} onChange={(event) => updateDraft("year", event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-venue">Venue</Label>
              <Input id="paper-venue" value={draft.venue} onChange={(event) => updateDraft("venue", event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="paper-doi">DOI or URL</Label>
              <Input
                id="paper-doi"
                value={draft.doiOrUrl}
                onChange={(event) => updateDraft("doiOrUrl", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paper-summary">Summary</Label>
              <Textarea
                id="paper-summary"
                value={draft.summary}
                onChange={(event) => updateDraft("summary", event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-method">Method</Label>
              <Textarea
                id="paper-method"
                value={draft.method}
                onChange={(event) => updateDraft("method", event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-dataset">Dataset</Label>
              <Textarea
                id="paper-dataset"
                value={draft.dataset}
                onChange={(event) => updateDraft("dataset", event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paper-metrics">Metrics</Label>
              <Textarea
                id="paper-metrics"
                value={draft.metrics}
                onChange={(event) => updateDraft("metrics", event.target.value)}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="paper-limitations">Limitations</Label>
              <Textarea
                id="paper-limitations"
                value={draft.limitations}
                onChange={(event) => updateDraft("limitations", event.target.value)}
                className="min-h-24"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
            <div className="space-y-2">
              <Label htmlFor="paper-relevance">Relevance Score</Label>
              <select
                id="paper-relevance"
                value={draft.relevanceScore}
                onChange={(event) => updateDraft("relevanceScore", Number(event.target.value) as Paper["relevanceScore"])}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {PAPER_TAGS.map((tag) => {
                  const fieldId = `paper-tag-${tag}`
                  return (
                    <label key={tag} htmlFor={fieldId} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={fieldId}
                        checked={draft.tags.includes(tag)}
                        onCheckedChange={(checked) => toggleTag(tag, checked === true)}
                      />
                      {tag}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={submitPaper}>
              <Plus className="h-4 w-4" />
              {editingId ? "Save Paper" : "Add Paper"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                <X className="h-4 w-4" />
                Cancel Edit
              </Button>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="filter-tag">Filter by tag</Label>
              <select
                id="filter-tag"
                value={tagFilter}
                onChange={(event) => setTagFilter(event.target.value as "all" | PaperTag)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">All tags</option>
                {PAPER_TAGS.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-score">Filter by relevance</Label>
              <select
                id="filter-score"
                value={scoreFilter}
                onChange={(event) =>
                  setScoreFilter(event.target.value === "all" ? "all" : (Number(event.target.value) as Paper["relevanceScore"]))
                }
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">All scores</option>
                {[1, 2, 3, 4, 5].map((score) => (
                  <option key={score} value={score}>
                    {score}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="filter-year">Filter by year</Label>
              <select
                id="filter-year"
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                <option value="all">All years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">Title</th>
                  <th className="px-3 py-2 font-medium">Year</th>
                  <th className="px-3 py-2 font-medium">Venue</th>
                  <th className="px-3 py-2 font-medium">Relevance</th>
                  <th className="px-3 py-2 font-medium">Tags</th>
                  <th className="px-3 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPapers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                      No papers match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredPapers.map((paper) => (
                    <tr key={paper.id} className="border-t border-border align-top">
                      <td className="px-3 py-3">
                        <div className="font-medium text-pretty">{paper.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground text-pretty">{paper.authors}</div>
                        {paper.doiOrUrl ? <div className="mt-1 text-xs text-muted-foreground break-all">{paper.doiOrUrl}</div> : null}
                      </td>
                      <td className="px-3 py-3">{paper.year}</td>
                      <td className="px-3 py-3">{paper.venue}</td>
                      <td className="px-3 py-3 tabular-nums">{paper.relevanceScore}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {paper.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(paper)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => deletePaper(paper.id)}>
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
