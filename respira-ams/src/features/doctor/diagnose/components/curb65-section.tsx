"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface Curb65SectionProps {
  confusion: boolean
  age65: boolean
  urea: string
  respiratory: string
  systolic: string
  diastolic: string
  onConfusionChange: (checked: boolean) => void
  onAge65Change: (checked: boolean) => void
  onUreaChange: (value: string) => void
  onRespiratoryChange: (value: string) => void
  onSystolicChange: (value: string) => void
  onDiastolicChange: (value: string) => void
}

export function Curb65Section({
  confusion,
  age65,
  urea,
  respiratory,
  systolic,
  diastolic,
  onConfusionChange,
  onAge65Change,
  onUreaChange,
  onRespiratoryChange,
  onSystolicChange,
  onDiastolicChange,
}: Curb65SectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Chỉ số CRB-65 / CURB-65
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <label className="flex gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={confusion}
              onCheckedChange={(checked) => onConfusionChange(checked === true)}
            />
            <div>
              <p className="font-semibold text-sm">
                Lú lẫn / Rối loạn ý thức
              </p>
              <p className="text-xs text-muted-foreground">
                Mới xuất hiện rối loạn người, địa điểm hoặc thời gian.
              </p>
            </div>
          </label>

          <label className="flex gap-3 border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <Checkbox
              checked={age65}
              onCheckedChange={(checked) => onAge65Change(checked === true)}
            />
            <div>
              <p className="font-semibold text-sm">
                Tuổi &ge; 65
              </p>
              <p className="text-xs text-muted-foreground">
                Yếu tố nguy cơ gia tăng ở bệnh nhân cao tuổi.
              </p>
            </div>
          </label>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Urea</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="h-8"
                placeholder="Giá trị"
                value={urea}
                onChange={(e) => onUreaChange(e.target.value)}
              />
              <span className="inline-flex items-center border border-input bg-muted px-2.5 py-1 text-sm text-muted-foreground rounded-md">mmol/L</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Nhịp thở</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="h-8"
                placeholder="Giá trị"
                value={respiratory}
                onChange={(e) => onRespiratoryChange(e.target.value)}
              />
              <span className="inline-flex items-center border border-input bg-muted px-2.5 py-1 text-sm text-muted-foreground rounded-md">lần/phút</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Huyết áp tâm thu</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="h-8"
                placeholder="Giá trị"
                value={systolic}
                onChange={(e) => onSystolicChange(e.target.value)}
              />
              <span className="inline-flex items-center border border-input bg-muted px-2.5 py-1 text-sm text-muted-foreground rounded-md">mmHg</span>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Huyết áp tâm trương</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="h-8"
                placeholder="Giá trị"
                value={diastolic}
                onChange={(e) => onDiastolicChange(e.target.value)}
              />
              <span className="inline-flex items-center border border-input bg-muted px-2.5 py-1 text-sm text-muted-foreground rounded-md">mmHg</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
