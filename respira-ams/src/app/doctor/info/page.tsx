"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Search, Bug, Stethoscope, Pill, FileText, ArrowRight, Eye } from "lucide-react"
import { AntibioticItem, PathogenItem, DiseaseItem, TreatmentProtocolItem, TreatmentProtocolDetail, DiseaseDetail } from "@/features/doctor/info/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SeverityBadge, AwareBadge } from "@/features/doctor/components/badges"

// ── Mock Data ─────────────────────────────────────────────────────────────────

const MOCK_ANTIBIOTICS: AntibioticItem[] = [
  {
    id: "1", name: "Amoxicillin/Clavulanate",
    antibioticSpectrum: { id: "s1", name: "Phổ rộng", description: "Gram dương và âm" },
    category: "access",
    routeOfAdministrations: ["Uống", "IV"],
    dosages: {
      "Uống": ["875mg/125mg mỗi 12 giờ x 5-7 ngày", "500mg/125mg mỗi 8 giờ"],
      "IV": ["1.2g mỗi 8 giờ"],
    },
  },
  {
    id: "2", name: "Azithromycin",
    antibioticSpectrum: { id: "s2", name: "Macrolide", description: "Atypical" },
    category: "watch",
    routeOfAdministrations: ["Uống"],
    dosages: { "Uống": ["500mg ngày 1, 250mg/ngày x 4 ngày"] },
  },
  {
    id: "3", name: "Meropenem",
    antibioticSpectrum: { id: "s3", name: "Phổ rất rộng", description: "Carbapenem" },
    category: "reserve",
    routeOfAdministrations: ["IV"],
    dosages: { "IV": ["1g mỗi 8 giờ", "2g mỗi 8 giờ (nặng)"] },
  },
  {
    id: "4", name: "Piperacillin/Tazobactam",
    antibioticSpectrum: { id: "s4", name: "Phổ rộng anti-pseudomonal", description: "" },
    category: "watch",
    routeOfAdministrations: ["IV"],
    dosages: { "IV": ["4.5g mỗi 6 giờ", "4.5g mỗi 8 giờ"] },
  },
]

const MOCK_PATHOGENS: PathogenItem[] = [
  { id: "p1", name: "Streptococcus pneumoniae", description: "Vi khuẩn gram dương phổ biến nhất gây viêm phổi cộng đồng." },
  { id: "p2", name: "Haemophilus influenzae", description: "Vi khuẩn gram âm thường gặp ở bệnh nhân COPD và trẻ em." },
  { id: "p3", name: "Mycoplasma pneumoniae", description: "Vi khuẩn không điển hình gây viêm phổi nhẹ đến trung bình." },
  { id: "p4", name: "Pseudomonas aeruginosa", description: "Vi khuẩn gram âm nguy hiểm, thường gặp ở ICU và bệnh nhân suy giảm miễn dịch." },
  { id: "p5", name: "Klebsiella pneumoniae", description: "Vi khuẩn gram âm, có nguy cơ kháng kháng sinh cao (ESBL/KPC)." },
]

const MOCK_DISEASES: DiseaseItem[] = [
  { id: "cap", name: "Viêm phổi mắc phải cộng đồng (CAP)", description: "Nhiễm trùng phổi xảy ra bên ngoài môi trường bệnh viện, gây ra bởi nhiều tác nhân khác nhau." },
  { id: "hap", name: "Viêm phổi bệnh viện (HAP)", description: "Nhiễm trùng phổi xảy ra sau 48 giờ nhập viện, không liên quan đến thở máy." },
  { id: "vap", name: "Viêm phổi liên quan thở máy (VAP)", description: "Viêm phổi xảy ra ở bệnh nhân đang thở máy, thường do vi khuẩn đa kháng thuốc." },
]

const MOCK_DISEASE_DETAILS: Record<string, DiseaseDetail> = {
  cap: {
    id: "cap", name: "Viêm phổi mắc phải cộng đồng (CAP)",
    description: "Nhiễm trùng phổi xảy ra bên ngoài môi trường bệnh viện, gây ra bởi nhiều tác nhân khác nhau như Streptococcus pneumoniae, Haemophilus influenzae.",
    treatmentProtocols: [
      { id: "tp1", name: "Amoxicillin + Clavulanate", issuer: "BYT", issueDate: "2023-01-15", version: 2, medicines: [] },
      { id: "tp2", name: "Azithromycin đơn trị", issuer: "BYT", issueDate: "2023-01-15", version: 1, medicines: [] },
    ],
  },
  hap: {
    id: "hap", name: "Viêm phổi bệnh viện (HAP)",
    description: "Nhiễm trùng phổi xảy ra sau 48 giờ nhập viện.",
    treatmentProtocols: [
      { id: "tp3", name: "Piperacillin/Tazobactam", issuer: "BYT", issueDate: "2023-06-01", version: 1, medicines: [] },
    ],
  },
  vap: {
    id: "vap", name: "Viêm phổi liên quan thở máy (VAP)",
    description: "Viêm phổi xảy ra ở bệnh nhân thở máy.",
    treatmentProtocols: [
      { id: "tp4", name: "Meropenem + Vancomycin", issuer: "BYT", issueDate: "2024-01-01", version: 1, medicines: [] },
    ],
  },
}

const MOCK_PROTOCOL_DETAIL: TreatmentProtocolDetail = {
  id: "tp1",
  name: "Amoxicillin + Clavulanate",
  issuer: "Bộ Y Tế Việt Nam",
  issueDate: "2023-01-15",
  version: 2,
  severity: "Moderate",
  treatmentSite: "Inpatient",
  specialInfection: null,
  otherCriteria: [],
  medicines: [MOCK_ANTIBIOTICS[0]],
  updatedAt: "2023-01-15T00:00:00Z",
}

// ── Tab Components ─────────────────────────────────────────────────────────────

function AntibioticsTab() {
  const [search, setSearch] = useState("")
  const filtered = MOCK_ANTIBIOTICS.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.antibioticSpectrum.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm thuốc..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Không có dữ liệu</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item: AntibioticItem) => (
            <Card key={item.id} className="group overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300 rounded-xl">
              <CardHeader className="border-b border-slate-50 bg-slate-50/50">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold text-slate-800">
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Pill className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="line-clamp-1">{item.name}</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 pb-2">
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Phổ kháng khuẩn</p>
                    <p className="text-sm font-semibold text-slate-700">{item.antibioticSpectrum.name}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Phân loại</p>
                    <div className="inline-block">
                      <AwareBadge category={item.category} />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Liều dùng chi tiết ({item.routeOfAdministrations.join(", ")})
                  </p>

                  <div className="grid gap-2.5">
                    {item.routeOfAdministrations.map((route) => (
                      <div key={route} className="bg-muted/40 rounded-lg p-3 border border-slate-100 hover:bg-muted/70 transition-colors">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-slate-600 border border-slate-200 uppercase tracking-wide mb-2">
                          {route}
                        </span>
                        <ul className="space-y-1.5">
                          {item.dosages[route]?.map((d, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                              <span className="text-primary/60 mt-1.5 text-[8px]">•</span>
                              <span className="leading-relaxed">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function PathogensTab() {
  const [search, setSearch] = useState("")
  const filtered = MOCK_PATHOGENS.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm tác nhân..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Không có dữ liệu</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item: PathogenItem) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-4 w-4 text-primary shrink-0" />
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function DiseasesTab({
  onViewProtocols,
  onViewDetail,
}: {
  onViewProtocols: (diseaseId: string) => void
  onViewDetail: (diseaseId: string) => void
}) {
  const [search, setSearch] = useState("")
  const filtered = MOCK_DISEASES.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Tìm bệnh..."
          className="pl-8"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Không có dữ liệu</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item: DiseaseItem) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onViewDetail(item.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-primary shrink-0" />
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{item.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewProtocols(item.id)
                  }}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Xem phác đồ
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function ProtocolsTab({
  selectedDiseaseId,
  onDiseaseChange,
}: {
  selectedDiseaseId: string | undefined
  onDiseaseChange: (id: string) => void
}) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | undefined>()

  const diseaseDetail = selectedDiseaseId ? MOCK_DISEASE_DETAILS[selectedDiseaseId] : undefined
  const protocols: TreatmentProtocolItem[] = diseaseDetail?.treatmentProtocols ?? []

  const handleViewDetail = (id: string) => {
    setSelectedProtocolId(id)
    setSheetOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Chọn bệnh lý</p>
        <Select value={selectedDiseaseId ?? ""} onValueChange={onDiseaseChange}>
          <SelectTrigger>
            <SelectValue placeholder="Chọn bệnh lý để xem phác đồ..." />
          </SelectTrigger>
          <SelectContent position="popper">
            {MOCK_DISEASES.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedDiseaseId ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Vui lòng chọn bệnh lý để xem phác đồ điều trị
        </div>
      ) : protocols.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          Không có phác đồ nào cho bệnh lý này
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {protocols.map((item: TreatmentProtocolItem) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5 font-medium">v{item.version}</span>
                  <span>{item.issuer}</span>
                  <span>{item.issueDate}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 w-full"
                  onClick={() => handleViewDetail(item.id)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Xem chi tiết phác đồ
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto pb-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              {MOCK_PROTOCOL_DETAIL.name}
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          <div className="px-4 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">Phiên bản</p>
              <span className="rounded bg-muted px-2 py-0.5 font-medium">v{MOCK_PROTOCOL_DETAIL.version}</span>
              <span>{MOCK_PROTOCOL_DETAIL.issuer}</span>
              <span>{MOCK_PROTOCOL_DETAIL.issueDate}</span>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">Mức độ</p>
                <SeverityBadge severity={MOCK_PROTOCOL_DETAIL.severity} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-0.5">Điều trị tại</p>
                <p className="text-sm font-medium">
                  {MOCK_PROTOCOL_DETAIL.treatmentSite === "IntensiveCareUnit" ? "ICU" : MOCK_PROTOCOL_DETAIL.treatmentSite === "Outpatient" ? "Ngoại trú" : "Nội trú"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">
                Thuốc trong phác đồ ({MOCK_PROTOCOL_DETAIL.medicines.length})
              </p>
              <div className="space-y-2">
                {MOCK_PROTOCOL_DETAIL.medicines.map((m) => (
                  <div key={m.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium">{m.name}</p>
                    <div className="mt-1 text-xs space-y-0.5">
                      <p>Phổ: {m.antibioticSpectrum?.name}</p>
                      <p className="capitalize">Phân loại: <AwareBadge category={m.category} /></p>
                      <p>Đường dùng: {(m.routeOfAdministrations ?? []).join(", ")}</p>
                    </div>
                    {(m.routeOfAdministrations ?? []).map((route) => (
                      <div key={route} className="mt-1">
                        <p className="text-xs font-medium uppercase text-primary">{route}</p>
                        <ul className="list-disc pl-4 text-xs">
                          {(m.dosages?.[route] ?? []).map((d, i) => <li key={i}>{d}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function InfoPage() {
  const [tab, setTab] = useState("antibiotics")
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | undefined>()
  const [diseaseSheetOpen, setDiseaseSheetOpen] = useState(false)
  const [diseaseSheetId, setDiseaseSheetId] = useState<string | undefined>()

  const diseaseSheetDetail = diseaseSheetId ? MOCK_DISEASE_DETAILS[diseaseSheetId] : undefined

  const handleViewProtocols = (diseaseId: string) => {
    setSelectedDiseaseId(diseaseId)
    setTab("protocols")
  }

  const handleViewDiseaseDetail = (diseaseId: string) => {
    setDiseaseSheetId(diseaseId)
    setDiseaseSheetOpen(true)
  }

  return (
    <div className="container mx-auto px-4 pt-8 pb-4">
      <header className="mb-8">
        <p className="text-primary text-sm uppercase tracking-widest">Tra cứu</p>
        <h1 className="text-3xl font-bold mt-2">Thông tin tham khảo</h1>
        <p className="text-muted-foreground mt-2">
          Tra cứu thông tin về thuốc, tác nhân gây bệnh, bệnh lý và phác đồ điều trị.
        </p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="antibiotics">Thuốc kháng sinh</TabsTrigger>
          <TabsTrigger value="pathogens">Tác nhân gây bệnh</TabsTrigger>
          <TabsTrigger value="diseases">Bệnh lý</TabsTrigger>
          <TabsTrigger value="protocols">Phác đồ điều trị</TabsTrigger>
        </TabsList>
        <TabsContent value="antibiotics" className="mt-6">
          <AntibioticsTab />
        </TabsContent>
        <TabsContent value="pathogens" className="mt-6">
          <PathogensTab />
        </TabsContent>
        <TabsContent value="diseases" className="mt-6">
          <DiseasesTab
            onViewProtocols={handleViewProtocols}
            onViewDetail={handleViewDiseaseDetail}
          />
        </TabsContent>
        <TabsContent value="protocols" className="mt-6">
          <ProtocolsTab
            selectedDiseaseId={selectedDiseaseId}
            onDiseaseChange={setSelectedDiseaseId}
          />
        </TabsContent>
      </Tabs>

      <Sheet open={diseaseSheetOpen} onOpenChange={setDiseaseSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Stethoscope className="h-4 w-4 text-primary shrink-0" />
              {diseaseSheetDetail ? diseaseSheetDetail.name : "Chi tiết bệnh lý"}
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>

          {diseaseSheetDetail ? (
            <div className="px-4 space-y-4">
              <p className="text-sm text-foreground">{diseaseSheetDetail.description}</p>

              {diseaseSheetDetail.treatmentProtocols.length > 0 && (
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-primary uppercase tracking-wide mb-2">
                    Phác đồ điều trị ({diseaseSheetDetail.treatmentProtocols.length})
                  </p>
                  <ul className="space-y-2">
                    {diseaseSheetDetail.treatmentProtocols.map((p) => (
                      <li key={p.id} className="text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">v{p.version}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{p.issuer} &middot; {p.issueDate}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Không tìm thấy bệnh lý</div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
