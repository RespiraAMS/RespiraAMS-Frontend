"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DiseaseResult, ResistanceRiskFactorItem } from "@/features/doctor/diagnose/types"

interface ResistanceRiskSectionProps {
  disease: DiseaseResult
  loading: boolean
  risksChecked: Record<string, boolean>
  numericValues: Record<string, string>
  onRiskCheckChange: (id: string, checked: boolean) => void
  onNumericValueChange: (id: string, value: string) => void
}

export function ResistanceRiskSection({
  disease,
  loading,
  risksChecked,
  numericValues,
  onRiskCheckChange,
  onNumericValueChange,
}: ResistanceRiskSectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>4. Yếu tố nguy cơ kháng thuốc</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </CardContent>
      </Card>
    )
  }

  if (!disease.resistanceRisks?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>4. Yếu tố nguy cơ kháng thuốc</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Không có yếu tố nguy cơ kháng thuốc cho bệnh lý này.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>4. Yếu tố nguy cơ kháng thuốc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {disease.resistanceRisks.map((risk) => (
            <RiskField
              key={risk.id}
              risk={risk}
              checked={risksChecked[risk.criterion.id] ?? false}
              numericValue={numericValues[risk.criterion.id] ?? ""}
              onCheckChange={(checked) => onRiskCheckChange(risk.criterion.id, checked)}
              onValueChange={(value) => onNumericValueChange(risk.criterion.id, value)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RiskField({
  risk,
  checked,
  numericValue,
  onCheckChange,
  onValueChange,
}: {
  risk: ResistanceRiskFactorItem
  checked: boolean
  numericValue: string
  onCheckChange: (checked: boolean) => void
  onValueChange: (value: string) => void
}) {
  const { criterion } = risk

  if (criterion.type.toLowerCase() === "boolean") {
    return (
      <label className="flex items-start gap-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
        <Checkbox
          className="mt-0.5"
          checked={checked}
          onCheckedChange={(c) => onCheckChange(c === true)}
        />
        <span className="text-sm">{criterion.name}</span>
      </label>
    )
  }

  return (
    <div className="border rounded-lg p-3">
      <p className="text-sm font-medium mb-2">{criterion.name}</p>
      <div className="flex items-center">
        <Input
          type="number"
          className="h-9 rounded-r-none"
          placeholder="Giá trị"
          value={numericValue}
          onChange={(e) => onValueChange(e.target.value)}
        />
        {criterion.unit && (
          <span className="inline-flex items-center border border-input bg-muted px-2.5 py-2 text-sm text-muted-foreground rounded-md rounded-l-none whitespace-nowrap">
            {criterion.unit}
          </span>
        )}
      </div>
    </div>
  )
}
