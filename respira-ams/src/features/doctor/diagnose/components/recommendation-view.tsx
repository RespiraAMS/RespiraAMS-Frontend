"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DiagnoseResponse, TreatmentProtocolItem } from "@/features/doctor/diagnose/types"
import { SeverityBadge } from "@/features/doctor/components/badges"
import { treatmentSiteLabels } from "@/features/doctor/lib/mappers"

interface RecommendationViewProps {
  diagnoseResult: DiagnoseResponse
  patientName: string
  diseaseName: string
  onBack: () => void
  onSave: (selectedProtocolId: string, reason: string | undefined) => void
}

function capitalize(str: string) {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function MedicineTable({ medicines }: { medicines: TreatmentProtocolItem["medicines"] }) {
  if (!medicines.length) return null

  return (
    <Table className="mt-3">
      <TableHeader>
        <TableRow>
          <TableHead>Thuốc</TableHead>
          <TableHead>Phổ kháng khuẩn</TableHead>
          <TableHead>Phân loại</TableHead>
          <TableHead>Liều dùng</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {medicines.map((medicine) => (
          <TableRow key={medicine.id}>
            <TableCell className="font-medium">{medicine.name}</TableCell>
            <TableCell>{medicine.antibioticSpectrum.name}</TableCell>
            <TableCell>{capitalize(medicine.category)}</TableCell>
            <TableCell>
              <div className="space-y-3">
                {medicine.routeOfAdministrations.map((route) => (
                  <div key={route}>
                    <p className="font-bold text-gray-800 uppercase text-xs mb-1 bg-gray-100 w-fit px-2 py-0.5 rounded">{route}</p>
                    <ul className="list-disc pl-5 text-sm text-gray-600">
                      {medicine.dosages[route]?.map((dosage) => (
                        <li key={dosage}>{dosage}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function RecommendationView({ diagnoseResult, patientName, diseaseName, onBack, onSave }: RecommendationViewProps) {
  const protocols = diagnoseResult.recommend
  const [selectedProtocolId, setSelectedProtocolId] = useState(protocols[0]?.id ?? "")
  const [reason, setReason] = useState("")
  const [saved, setSaved] = useState(false)

  const isRecommended = selectedProtocolId === (protocols[0]?.id ?? "")
  const selectedProtocol = protocols.find((p) => p.id === selectedProtocolId)

  const handleSave = () => {
    onSave(selectedProtocolId, isRecommended ? undefined : reason)
    setSaved(true)
  }

  return (
    <div className="space-y-6 max-w-300 mx-auto">
      <header className="mb-8">
        <p className="text-primary text-sm uppercase tracking-widest">
          Đánh giá lâm sàng
        </p>
        <h1 className="text-3xl font-bold mt-2">
          Phác đồ khuyến nghị
        </h1>
        <p className="text-muted-foreground mt-2">
          Dựa trên kết quả chẩn đoán, hệ thống đề xuất phác đồ điều trị phù hợp.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Mức độ nghiêm trọng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              <SeverityBadge severity={diagnoseResult.severity} />
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nơi điều trị</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {treatmentSiteLabels[diagnoseResult.treatmentSite] ?? diagnoseResult.treatmentSite}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chọn phác đồ điều trị</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {protocols.map((protocol, index) => (
            <div key={protocol.id}>
              <label
                className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${selectedProtocolId === protocol.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-muted-foreground/30"
                  }`}
              >
                <input
                  type="radio"
                  name="protocol"
                  value={protocol.id}
                  checked={selectedProtocolId === protocol.id}
                  onChange={(e) => setSelectedProtocolId(e.target.value)}
                  className="mt-1 h-4 w-4 text-primary accent-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{protocol.name}</span>
                    {index === 0 && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        Khuyến nghị
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {protocol.issuer} v{protocol.version} - {protocol.issueDate}
                  </p>
                </div>
              </label>
              {selectedProtocolId === protocol.id && (
                <MedicineTable medicines={protocol.medicines} />
              )}
            </div>
          ))}

          {!isRecommended && selectedProtocol && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <label className="text-sm font-medium">
                Lý do không chọn phác đồ khuyến nghị
              </label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Vui lòng nhập lý do..."
                className="mt-2"
                rows={3}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <footer className="flex justify-between border-t pt-6">
        <Button variant="outline" size="lg" onClick={onBack}>
          Quay lại biểu mẫu
        </Button>
        <div className="flex gap-3">
          {saved ? (
            <Button size="lg" onClick={onBack}>
              Quay lại
            </Button>
          ) : (
            <Button size="lg" onClick={handleSave} disabled={!selectedProtocol}>
              Lưu và hoàn tất
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
