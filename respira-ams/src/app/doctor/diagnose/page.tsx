"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DiagnoseResponse } from "@/features/doctor/diagnose/types"
import { PatientInfoSection } from "@/features/doctor/diagnose/components/patient-info-section"
import { DiseaseSelectSection } from "@/features/doctor/diagnose/components/disease-select-section"
import { IcuCriteriaSection } from "@/features/doctor/diagnose/components/icu-criteria-section"
import { Curb65Section } from "@/features/doctor/diagnose/components/curb65-section"
import { ResistanceRiskSection } from "@/features/doctor/diagnose/components/resistance-risk-section"
import { OtherCriteriaSection } from "@/features/doctor/diagnose/components/other-criteria-section"
import { RecommendationView } from "@/features/doctor/diagnose/components/recommendation-view"
import { SeverityBadge } from "@/features/doctor/components/badges"
import { treatmentSiteLabels } from "@/features/doctor/lib/mappers"

// Mock disease detail for when a disease is selected
const MOCK_DISEASE_DETAIL = {
  id: "cap",
  name: "Viêm phổi mắc phải cộng đồng (CAP)",
  description: "",
  requiredIcuMainCriteria: 1,
  requiredIcuSecondaryCriteria: 3,
  icuHospitalizeCriteria: [
    {
      id: "icu-1",
      criterion: { id: "soc", name: "Sốc nhiễm khuẩn cần dùng thuốc vận mạch", type: "Boolean", min: null, max: null, unit: null, isExclusive: false },
      isMainCriteria: true,
    },
    {
      id: "icu-2",
      criterion: { id: "resp-fail", name: "Suy hô hấp cần đặt nội khí quản", type: "Boolean", min: null, max: null, unit: null, isExclusive: false },
      isMainCriteria: true,
    },
    {
      id: "icu-3",
      criterion: { id: "rr", name: "Nhịp thở", type: "Numeric", min: 30, max: null, unit: "lần/phút", isExclusive: null },
      isMainCriteria: false,
    },
    {
      id: "icu-4",
      criterion: { id: "pao2", name: "PaO2/FiO2", type: "Numeric", min: null, max: 250, unit: "mmHg", isExclusive: null },
      isMainCriteria: false,
    },
  ],
  resistanceRisks: [
    {
      id: "risk-1",
      pathogen: "MRSA",
      criterion: { id: "mrsa-prev", name: "Tiền sử nhiễm MRSA", type: "Boolean", min: null, max: null, unit: null, isExclusive: null },
      name: "MRSA",
    },
    {
      id: "risk-2",
      pathogen: "MRSA",
      criterion: { id: "hosp-prev", name: "Nằm viện trong 90 ngày qua", type: "Boolean", min: null, max: null, unit: null, isExclusive: null },
      name: "MRSA",
    },
  ],
  diseasePathogens: [],
  treatmentProtocols: [],
}

// Mock diagnose result for demonstration
const MOCK_DIAGNOSE_RESULT: DiagnoseResponse = {
  severity: "moderate",
  treatmentSite: "inpatient",
  infectionProbabilities: [
    { pathogenId: "1", pathogenName: "Streptococcus pneumoniae", probability: "0.65" },
    { pathogenId: "2", pathogenName: "Haemophilus influenzae", probability: "0.25" },
    { pathogenId: "3", pathogenName: "Mycoplasma pneumoniae", probability: "0.10" },
  ],
  recommend: [
    {
      id: "proto-1",
      name: "Amoxicillin + Clavulanate",
      issuer: "BYT",
      issueDate: "2023-01-15",
      version: 2,
      medicines: [
        {
          id: "med-1",
          name: "Amoxicillin/Clavulanate",
          antibioticSpectrum: { id: "spec-1", name: "Phổ rộng", description: "" },
          category: "access",
          routeOfAdministrations: ["Uống"],
          dosages: { "Uống": ["875mg/125mg mỗi 12 giờ x 5-7 ngày"] },
        },
      ],
    },
    {
      id: "proto-2",
      name: "Azithromycin",
      issuer: "BYT",
      issueDate: "2023-01-15",
      version: 1,
      medicines: [
        {
          id: "med-2",
          name: "Azithromycin",
          antibioticSpectrum: { id: "spec-2", name: "Macrolide", description: "" },
          category: "watch",
          routeOfAdministrations: ["Uống"],
          dosages: { "Uống": ["500mg ngày 1, sau đó 250mg/ngày x 4 ngày"] },
        },
      ],
    },
  ],
}

function calculateAge(dob: Date | undefined): string {
  if (!dob) return "0"
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return String(age)
}

interface FormValues {
  patientName: string
  dateOfBirth: Date | undefined
  gender: string
  confusion: boolean
  age65: boolean
  urea: string
  respiratory: string
  systolic: string
  diastolic: string
  icuCriteria: Record<string, boolean>
  icuNumericValues: Record<string, string>
  resistanceRisks: Record<string, boolean>
  resistanceNumericValues: Record<string, string>
  otherCriteriaChecked: Record<string, boolean>
  otherCriteriaNumericValues: Record<string, string>
}

const defaultFormValues: FormValues = {
  patientName: "",
  dateOfBirth: undefined,
  gender: "",
  confusion: false,
  age65: false,
  urea: "",
  respiratory: "",
  systolic: "",
  diastolic: "",
  icuCriteria: {},
  icuNumericValues: {},
  resistanceRisks: {},
  resistanceNumericValues: {},
  otherCriteriaChecked: {},
  otherCriteriaNumericValues: {},
}

export default function ClinicalFormPage() {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState("")
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues)
  const [diagnoseResult, setDiagnoseResult] = useState<DiagnoseResponse | null>(null)
  const [showRecommendation, setShowRecommendation] = useState(false)
  const [isDiagnosing, setIsDiagnosing] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Use mock disease data when a disease is selected
  const disease = selectedDiseaseId ? MOCK_DISEASE_DETAIL : null
  const otherCriteria: never[] = []

  const updateField = <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleDiagnose = () => {
    if (!selectedDiseaseId) return
    setIsDiagnosing(true)
    // Simulate async
    setTimeout(() => {
      setDiagnoseResult(MOCK_DIAGNOSE_RESULT)
      setIsDiagnosing(false)
    }, 800)
  }

  const handleDiagnoseAndRecommend = () => {
    if (!selectedDiseaseId) return
    setIsSending(true)
    setTimeout(() => {
      setDiagnoseResult(MOCK_DIAGNOSE_RESULT)
      setShowRecommendation(true)
      setIsSending(false)
    }, 800)
  }

  const handleReset = () => {
    setFormValues(defaultFormValues)
    setSelectedDiseaseId("")
    setDiagnoseResult(null)
  }

  const handleDiseaseChange = (id: string) => {
    setSelectedDiseaseId(id)
    setFormValues((prev) => ({
      ...prev,
      icuCriteria: {},
      icuNumericValues: {},
      resistanceRisks: {},
      resistanceNumericValues: {},
    }))
  }

  const handleSave = (selectedProtocolId: string, reason: string | undefined) => {
    // Mock save – no API
    console.log("Saved decision:", { selectedProtocolId, reason })
  }

  if (showRecommendation && diagnoseResult) {
    return (
      <div>
        <RecommendationView
          diagnoseResult={diagnoseResult}
          patientName={formValues.patientName}
          diseaseName={disease?.name ?? ""}
          onBack={() => setShowRecommendation(false)}
          onSave={handleSave}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-6 max-w-300 mx-auto px-4 pt-8 pb-4">
        <header className="mb-8">
          <p className="text-primary text-sm uppercase tracking-widest">
            Đánh giá ban đầu
          </p>
          <h1 className="text-3xl font-bold mt-2">
            Mẫu Thông tin Bệnh nhân
          </h1>
          <p className="text-muted-foreground mt-2">
            Vui lòng hoàn thành tất cả các trường thông tin cần thiết để đánh
            giá lâm sàng.
          </p>
        </header>

        <form
          className="space-y-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <PatientInfoSection
            patientName={formValues.patientName}
            dateOfBirth={formValues.dateOfBirth}
            gender={formValues.gender}
            onPatientNameChange={(v: string) => updateField("patientName", v)}
            onDateOfBirthChange={(v: Date | undefined) => updateField("dateOfBirth", v)}
            onGenderChange={(v: string) => updateField("gender", v)}
          />

          <DiseaseSelectSection
            value={selectedDiseaseId}
            onValueChange={handleDiseaseChange}
          />

          <Curb65Section
            confusion={formValues.confusion}
            age65={formValues.age65}
            urea={formValues.urea}
            respiratory={formValues.respiratory}
            systolic={formValues.systolic}
            diastolic={formValues.diastolic}
            onConfusionChange={(v: boolean) => updateField("confusion", v)}
            onAge65Change={(v: boolean) => updateField("age65", v)}
            onUreaChange={(v: string) => updateField("urea", v)}
            onRespiratoryChange={(v: string) => updateField("respiratory", v)}
            onSystolicChange={(v: string) => updateField("systolic", v)}
            onDiastolicChange={(v: string) => updateField("diastolic", v)}
          />

          {selectedDiseaseId && disease && (
            <>
              <IcuCriteriaSection
                disease={disease}
                loading={false}
                criteriaChecked={formValues.icuCriteria}
                numericValues={formValues.icuNumericValues}
                onCriteriaCheckChange={(id, checked) =>
                  updateField("icuCriteria", { ...formValues.icuCriteria, [id]: checked })
                }
                onNumericValueChange={(id, value) =>
                  updateField("icuNumericValues", { ...formValues.icuNumericValues, [id]: value })
                }
              />
              <ResistanceRiskSection
                disease={disease}
                loading={false}
                risksChecked={formValues.resistanceRisks}
                numericValues={formValues.resistanceNumericValues}
                onRiskCheckChange={(id, checked) =>
                  updateField("resistanceRisks", { ...formValues.resistanceRisks, [id]: checked })
                }
                onNumericValueChange={(id, value) =>
                  updateField("resistanceNumericValues", { ...formValues.resistanceNumericValues, [id]: value })
                }
              />
              <OtherCriteriaSection
                criteria={otherCriteria}
                loading={false}
                checked={formValues.otherCriteriaChecked}
                numericValues={formValues.otherCriteriaNumericValues}
                onCheckChange={(id, checked) =>
                  updateField("otherCriteriaChecked", { ...formValues.otherCriteriaChecked, [id]: checked })
                }
                onNumericValueChange={(id, value) =>
                  updateField("otherCriteriaNumericValues", { ...formValues.otherCriteriaNumericValues, [id]: value })
                }
              />
            </>
          )}

          {diagnoseResult && (
            <Card>
              <CardHeader>
                <CardTitle>Kết quả chẩn đoán</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Mức độ nghiêm trọng</p>
                    <div className="mt-1"><SeverityBadge severity={diagnoseResult.severity} /></div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Nơi điều trị</p>
                    <p className="text-lg font-semibold mt-1">{treatmentSiteLabels[diagnoseResult.treatmentSite] ?? diagnoseResult.treatmentSite}</p>
                  </div>
                </div>
                {diagnoseResult.infectionProbabilities.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Xác suất tác nhân gây bệnh</h3>
                    <div className="space-y-2">
                      {diagnoseResult.infectionProbabilities.map((item) => (
                        <div
                          key={item.pathogenId}
                          className="flex items-center justify-between border rounded-lg p-3"
                        >
                          <div>
                            <p className="font-medium text-sm">{item.pathogenName}</p>
                          </div>
                          <span className="text-sm font-semibold text-primary">{(Number(item.probability) * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <footer className="flex justify-between border-t pt-4 -mt-6">
            <Button variant="outline" size="lg" onClick={handleReset}>
              Đặt lại
            </Button>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleDiagnose}
                disabled={isDiagnosing || !selectedDiseaseId}
              >
                {isDiagnosing ? "Đang xử lý..." : "Chẩn đoán"}
              </Button>
              <Button
                size="lg"
                onClick={handleDiagnoseAndRecommend}
                disabled={isSending || !selectedDiseaseId}
              >
                {isSending ? "Đang xử lý..." : "Gửi thông tin"}
              </Button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}
