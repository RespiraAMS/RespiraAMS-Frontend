"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { DiseaseResult, IcuHospitalizeCriterionItem } from "@/features/doctor/diagnose/types"

interface IcuCriteriaSectionProps {
  disease: DiseaseResult
  loading: boolean
  criteriaChecked: Record<string, boolean>
  numericValues: Record<string, string>
  onCriteriaCheckChange: (id: string, checked: boolean) => void
  onNumericValueChange: (id: string, value: string) => void
}

export function IcuCriteriaSection({
  disease,
  loading,
  criteriaChecked,
  numericValues,
  onCriteriaCheckChange,
  onNumericValueChange,
}: IcuCriteriaSectionProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>3. Tiêu chuẩn nhập khoa ICU</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p>
        </CardContent>
      </Card>
    )
  }

  if (!disease.icuHospitalizeCriteria?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>3. Tiêu chuẩn nhập khoa ICU</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Không có tiêu chuẩn ICU cho bệnh lý này.</p>
        </CardContent>
      </Card>
    )
  }

  const mainCriteria = disease.icuHospitalizeCriteria.filter((c) => c.isMainCriteria)
  const secondaryCriteria = disease.icuHospitalizeCriteria.filter((c) => !c.isMainCriteria)

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Tiêu chuẩn nhập khoa ICU</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <h3 className="font-semibold text-primary mb-4">
            Tiêu chuẩn chính
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {mainCriteria.map((item) => (
              <CriterionField
                key={item.id}
                item={item}
                checked={criteriaChecked[item.criterion.id] ?? false}
                numericValue={numericValues[item.criterion.id] ?? ""}
                onCheckChange={(checked) => onCriteriaCheckChange(item.criterion.id, checked)}
                onValueChange={(value) => onNumericValueChange(item.criterion.id, value)}
              />
            ))}
          </div>
        </div>

        {secondaryCriteria.length > 0 && (
          <div>
            <h3 className="font-semibold mb-4">
              Tiêu chuẩn phụ
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {secondaryCriteria.map((item) => (
                <CriterionField
                  key={item.id}
                  item={item}
                  checked={criteriaChecked[item.criterion.id] ?? false}
                  numericValue={numericValues[item.criterion.id] ?? ""}
                  onCheckChange={(checked) => onCriteriaCheckChange(item.criterion.id, checked)}
                  onValueChange={(value) => onNumericValueChange(item.criterion.id, value)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CriterionField({
  item,
  checked,
  numericValue,
  onCheckChange,
  onValueChange,
}: {
  item: IcuHospitalizeCriterionItem
  checked: boolean
  numericValue: string
  onCheckChange: (checked: boolean) => void
  onValueChange: (value: string) => void
}) {
  const { criterion } = item

  if (criterion.type.toLowerCase() === "boolean") {
    return (
      <label className="flex items-center gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
        <Checkbox
          checked={checked}
          onCheckedChange={(c) => onCheckChange(c === true)}
        />
        <span className="text-sm">{criterion.name}</span>
      </label>
    )
  }

  return (
    <div className="border rounded-lg p-4">
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
