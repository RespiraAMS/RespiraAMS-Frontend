"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DiseaseItem } from "@/features/doctor/diagnose/types"

// Mock disease list – no API
const MOCK_DISEASES: DiseaseItem[] = [
  { id: "cap", name: "Viêm phổi mắc phải cộng đồng (CAP)", description: "Cộng đồng" },
  { id: "hap", name: "Viêm phổi bệnh viện (HAP)", description: "Bệnh viện" },
  { id: "vap", name: "Viêm phổi liên quan thở máy (VAP)", description: "ICU" },
]

interface DiseaseSelectSectionProps {
  value: string
  onValueChange: (value: string) => void
}

export function DiseaseSelectSection({ value, onValueChange }: DiseaseSelectSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>2. Chọn bệnh lý nghi ngờ</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-w-md">
          <label className="text-sm font-medium">Bệnh lý<span className="text-red-500">*</span></label>
          <Select value={value || undefined} onValueChange={onValueChange}>
            <SelectTrigger className="mt-2 w-full">
              <SelectValue placeholder="Chọn bệnh lý" />
            </SelectTrigger>
            <SelectContent position="popper">
              {MOCK_DISEASES.map((disease: DiseaseItem) => (
                <SelectItem key={disease.id} value={disease.id}>
                  {disease.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
