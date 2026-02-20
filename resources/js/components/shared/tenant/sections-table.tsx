import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type SectionStatus = "in-progress" | "done"

type SectionType = "Cover page" | "Table of contents" | "Narrative" | "Technical content"

type SectionRow = {
  id: string
  header: string
  sectionType: SectionType
  status: SectionStatus
  target: number
  limit: number
  reviewer?: string | null
}

const defaultSections: SectionRow[] = [
  {
    id: "cover-page",
    header: "Cover page",
    sectionType: "Cover page",
    status: "in-progress",
    target: 18,
    limit: 5,
    reviewer: "Eddie Lake",
  },
  {
    id: "table-of-contents",
    header: "Table of contents",
    sectionType: "Table of contents",
    status: "done",
    target: 29,
    limit: 24,
    reviewer: "Eddie Lake",
  },
  {
    id: "executive-summary",
    header: "Executive summary",
    sectionType: "Narrative",
    status: "done",
    target: 10,
    limit: 13,
    reviewer: "Eddie Lake",
  },
  {
    id: "technical-approach",
    header: "Technical approach",
    sectionType: "Narrative",
    status: "done",
    target: 27,
    limit: 23,
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: "design",
    header: "Design",
    sectionType: "Narrative",
    status: "in-progress",
    target: 2,
    limit: 16,
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: "capabilities",
    header: "Capabilities",
    sectionType: "Narrative",
    status: "in-progress",
    target: 20,
    limit: 8,
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: "integration",
    header: "Integration with existing systems",
    sectionType: "Narrative",
    status: "in-progress",
    target: 19,
    limit: 21,
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: "innovation",
    header: "Innovation and Advantages",
    sectionType: "Narrative",
    status: "done",
    target: 25,
    limit: 26,
    reviewer: null,
  },
  {
    id: "overview-emr",
    header: "Overview of EMR's Innovative Solutions",
    sectionType: "Technical content",
    status: "done",
    target: 7,
    limit: 23,
    reviewer: null,
  },
  {
    id: "advanced-algorithms",
    header: "Advanced Algorithms and Machine Learning",
    sectionType: "Narrative",
    status: "done",
    target: 30,
    limit: 28,
    reviewer: null,
  },
]

type SectionsTableProps = {
  sections?: SectionRow[]
}

export function SectionsTable({ sections = defaultSections }: SectionsTableProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/70 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">Sections</h2>
      </div>

      <Table className="[&_thead]:bg-muted/40">
        <TableHeader>
          <TableRow className="border-border/60">
            <TableHead className="w-10">
              <Checkbox aria-label="Select all rows" />
            </TableHead>
            <TableHead>Header</TableHead>
            <TableHead className="w-40">Section Type</TableHead>
            <TableHead className="w-32">Status</TableHead>
            <TableHead className="w-24 text-right">Target</TableHead>
            <TableHead className="w-24 text-right">Limit</TableHead>
            <TableHead className="w-48 text-right">Reviewer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <TableRow key={section.id} className="border-border/60">
              <TableCell>
                <Checkbox aria-label={`Select ${section.header}`} />
              </TableCell>
              <TableCell className="font-medium">{section.header}</TableCell>
              <TableCell className="text-muted-foreground">
                {section.sectionType}
              </TableCell>
              <TableCell>
                <StatusBadge status={section.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {section.target}
              </TableCell>
              <TableCell className="text-right tabular-nums text-muted-foreground">
                {section.limit}
              </TableCell>
              <TableCell className="text-right">
                {section.reviewer ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    {section.reviewer}
                  </span>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium text-muted-foreground shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Assign reviewer
                    <span aria-hidden className="text-[10px] leading-none">
                      ▼
                    </span>
                  </button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

type StatusBadgeProps = {
  status: SectionStatus
}

function StatusBadge({ status }: StatusBadgeProps) {
  const isDone = status === "done"

  return (
    <Badge
      variant={isDone ? "secondary" : "outline"}
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isDone ? "bg-emerald-500" : "bg-amber-400"
        }`}
      />
      {isDone ? "Done" : "In Process"}
    </Badge>
  )
}

