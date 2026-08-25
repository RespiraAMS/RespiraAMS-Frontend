"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { SeverityBadge } from "@/features/doctor/components/badges"
import { treatmentSiteLabels } from "@/features/doctor/lib/mappers"
import { TreatmentDecisionResult, TreatmentDecisionItem } from "@/features/doctor/history/types"

// Mock data
const MOCK_HISTORY: TreatmentDecisionItem[] = [
  { id: "1", createdAt: "2026-08-20T08:30:00Z", diseaseName: "Viêm phổi mắc phải cộng đồng (CAP)" },
  { id: "2", createdAt: "2026-08-18T14:15:00Z", diseaseName: "Viêm phổi bệnh viện (HAP)" },
  { id: "3", createdAt: "2026-08-15T09:00:00Z", diseaseName: "Viêm phổi mắc phải cộng đồng (CAP)" },
]

const MOCK_DETAIL: Record<string, TreatmentDecisionResult> = {
  "1": {
    id: "1",
    createdAt: "2026-08-20T08:30:00Z",
    diseaseName: "Viêm phổi mắc phải cộng đồng (CAP)",
    doctorName: "Bác sĩ Demo",
    severity: "moderate",
    treatmentSite: "inpatient",
    infectionProbabilities: [
      { pathogenName: "Streptococcus pneumoniae", infectionProbability: 0.65 },
      { pathogenName: "Haemophilus influenzae", infectionProbability: 0.25 },
    ],
    criterionItems: [
      { criterionName: "Nhịp thở ≥ 30 lần/phút", value: "32" },
      { criterionName: "Tuổi ≥ 65", value: "true" },
    ],
    recommended: {
      treatmentProtocolName: "Amoxicillin + Clavulanate",
      treatmentProtocolIssuer: "BYT",
      treatmentProtocolIssueDate: "2023-01-15",
      treatmentProtocolVersion: 2,
    },
    chosen: {
      treatmentProtocolName: "Amoxicillin + Clavulanate",
      treatmentProtocolIssuer: "BYT",
      treatmentProtocolIssueDate: "2023-01-15",
      treatmentProtocolVersion: 2,
    },
    reason: null,
  },
  "2": {
    id: "2",
    createdAt: "2026-08-18T14:15:00Z",
    diseaseName: "Viêm phổi bệnh viện (HAP)",
    doctorName: "Bác sĩ Demo",
    severity: "severe",
    treatmentSite: "intensiveCareUnit",
    infectionProbabilities: [
      { pathogenName: "Pseudomonas aeruginosa", infectionProbability: 0.45 },
      { pathogenName: "Klebsiella pneumoniae", infectionProbability: 0.35 },
    ],
    criterionItems: [
      { criterionName: "Sốc nhiễm khuẩn", value: "true" },
    ],
    recommended: {
      treatmentProtocolName: "Piperacillin/Tazobactam",
      treatmentProtocolIssuer: "BYT",
      treatmentProtocolIssueDate: "2023-06-01",
      treatmentProtocolVersion: 1,
    },
    chosen: {
      treatmentProtocolName: "Meropenem",
      treatmentProtocolIssuer: "BYT",
      treatmentProtocolIssueDate: "2023-06-01",
      treatmentProtocolVersion: 1,
    },
    reason: "Bệnh nhân có tiền sử đề kháng Piperacillin",
  },
  "3": {
    id: "3",
    createdAt: "2026-08-15T09:00:00Z",
    diseaseName: "Viêm phổi mắc phải cộng đồng (CAP)",
    doctorName: "Bác sĩ Demo",
    severity: "mild",
    treatmentSite: "outpatient",
    infectionProbabilities: [],
    criterionItems: [],
    recommended: {
      treatmentProtocolName: "Azithromycin",
      treatmentProtocolIssuer: "BYT",
      treatmentProtocolIssueDate: "2023-01-15",
      treatmentProtocolVersion: 1,
    },
    chosen: {
      treatmentProtocolName: "Azithromycin",
      treatmentProtocolIssuer: "BYT",
      treatmentProtocolIssueDate: "2023-01-15",
      treatmentProtocolVersion: 1,
    },
    reason: null,
  },
}

export default function HistoryPage() {
  const [selectedId, setSelectedId] = useState("")
  const detail = selectedId ? MOCK_DETAIL[selectedId] ?? null : null

  return (
    <>
      <div className="container mx-auto px-4 pt-8 pb-4">
        <header className="mb-8">
          <p className="text-primary text-sm uppercase tracking-widest">Lịch sử</p>
          <h1 className="text-3xl font-bold mt-2">Lịch sử chẩn đoán</h1>
          <p className="text-muted-foreground mt-2">
            Các ca chẩn đoán đã lưu.
          </p>
        </header>

        <Card>
          <CardContent className="p-0">
            {MOCK_HISTORY.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Chưa có ca chẩn đoán nào.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Bệnh lý</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_HISTORY.map((item) => (
                    <TableRow
                      key={item.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedId(item.id)}
                    >
                      <TableCell className="whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString("vi-VN")}
                      </TableCell>
                      <TableCell>{item.diseaseName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Sheet open={!!selectedId} onOpenChange={(o) => { if (!o) setSelectedId("") }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{detail ? detail.diseaseName : "Chi tiết ca chẩn đoán"}</SheetTitle>
            {detail && (
              <SheetDescription>
                {new Date(detail.createdAt).toLocaleString("vi-VN")}
              </SheetDescription>
            )}
          </SheetHeader>

          {detail ? (
            <div className="px-4 pb-4 space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Thông tin chung
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <span className="text-muted-foreground">Bác sĩ</span>
                  <span>{detail.doctorName}</span>
                  <span className="text-muted-foreground">Mức độ</span>
                  <span>
                    <SeverityBadge severity={detail.severity} />
                  </span>
                  <span className="text-muted-foreground">Nơi điều trị</span>
                  <span>{treatmentSiteLabels[detail.treatmentSite] ?? detail.treatmentSite}</span>
                </div>
              </section>

              <Separator />

              {detail.infectionProbabilities.length > 0 && (
                <>
                  <section className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Xác suất nhiễm khuẩn
                    </h3>
                    <div className="space-y-2">
                      {detail.infectionProbabilities.map((p, i) => (
                        <div key={i} className="flex items-center justify-between border rounded-lg px-3 py-2">
                          <span className="text-sm">{p.pathogenName}</span>
                          <span className="text-sm font-mono">
                            {(p.infectionProbability * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <Separator />
                </>
              )}

              {detail.criterionItems.length > 0 && (
                <>
                  <section className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Tiêu chí chẩn đoán
                    </h3>
                    <div className="space-y-2">
                      {detail.criterionItems.map((c, i) => (
                        <div key={i} className="flex items-center justify-between border rounded-lg px-3 py-2">
                          <span className="text-sm">{c.criterionName}</span>
                          <span className="text-sm font-mono">{c.value ?? "—"}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                  <Separator />
                </>
              )}

              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Phác đồ đề xuất
                </h3>
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium">{detail.recommended.treatmentProtocolName}</p>
                  <p className="text-xs text-muted-foreground">
                    {detail.recommended.treatmentProtocolIssuer} · v{detail.recommended.treatmentProtocolVersion} ·{" "}
                    {detail.recommended.treatmentProtocolIssueDate}
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Phác đồ đã chọn
                </h3>
                <div className="border rounded-lg p-3 space-y-1">
                  <p className="text-sm font-medium">{detail.chosen.treatmentProtocolName}</p>
                  <p className="text-xs text-muted-foreground">
                    {detail.chosen.treatmentProtocolIssuer} · v{detail.chosen.treatmentProtocolVersion} ·{" "}
                    {detail.chosen.treatmentProtocolIssueDate}
                  </p>
                </div>
              </section>

              {detail.reason && (
                <>
                  <Separator />
                  <section className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Lý do chọn phác đồ
                    </h3>
                    <p className="text-sm border rounded-lg p-3">{detail.reason}</p>
                  </section>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Không tìm thấy thông tin.</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
