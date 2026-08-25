"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { CriterionItem } from "@/features/doctor/diagnose/types"

interface OtherCriteriaSectionProps {
  criteria: CriterionItem[]
  loading: boolean
  checked: Record<string, boolean>
  numericValues: Record<string, string>
  onCheckChange: (id: string, checked: boolean) => void
  onNumericValueChange: (id: string, value: string) => void
}

export function OtherCriteriaSection({
  criteria,
  loading,
  checked,
  numericValues,
  onCheckChange,
  onNumericValueChange,
}: OtherCriteriaSectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>5. Tiêu chí khác</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </CardContent>
      </Card>
    )
  }

  if (!criteria?.length) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>5. Tiêu chí khác</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {criteria.map((item) => (
            <CriterionField
              key={item.id}
              item={item}
              checked={checked[item.id] ?? false}
              numericValue={numericValues[item.id] ?? ""}
              onCheckChange={(c) => onCheckChange(item.id, c)}
              onValueChange={(v) => onNumericValueChange(item.id, v)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CriterionField({
  item,
  checked: isChecked,
  numericValue,
  onCheckChange,
  onValueChange,
}: {
  item: CriterionItem
  checked: boolean
  numericValue: string
  onCheckChange: (checked: boolean) => void
  onValueChange: (value: string) => void
}) {
  if (item.type.toLowerCase() === "boolean") {
    return (
      <label className="flex items-start gap-3 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
        <Checkbox
          className="mt-0.5"
          checked={isChecked}
          onCheckedChange={(c) => onCheckChange(c === true)}
        />
        <span className="text-sm">{item.name}</span>
      </label>
    )
  }

  return (
    <div className="border rounded-lg p-3">
      <p className="text-sm font-medium mb-2">{item.name}</p>
      <div className="flex items-center">
        <Input
          type="number"
          className="h-9 rounded-r-none"
          placeholder="Giá trị"
          value={numericValue}
          onChange={(e) => onValueChange(e.target.value)}
        />
        {item.unit && (
          <span className="inline-flex items-center border border-input bg-muted px-2.5 py-2 text-sm text-muted-foreground rounded-md rounded-l-none whitespace-nowrap">
            {item.unit}
          </span>
        )}
      </div>
    </div>
  )
}
