export interface DiagnoseRequest {
  diseaseId: string
  confusion: boolean
  urea: string
  respiratory: string
  systolic: string
  diastolic: string
  age: string
  icuHospitalizeCriteria: string[]
  resistanceRiskFactors: string[]
  otherCriteria: string[]
}

export interface InfectionProbability {
  pathogenId: string
  pathogenName: string
  probability: string
}

export interface TreatmentProtocolItem {
  id: string
  name: string
  issuer: string
  issueDate: string
  version: number
  medicines: Medicine[]
}

export interface DiagnoseResponse {
  severity: string
  treatmentSite: string
  infectionProbabilities: InfectionProbability[]
  recommend: TreatmentProtocolItem[]
}

export interface Medicine {
  id: string
  name: string
  antibioticSpectrum: {
    id: string
    name: string
    description: string
  }
  category: string
  routeOfAdministrations: string[]
  dosages: Record<string, string[]>
}

export interface DiseaseItem {
  id: string
  name: string
  description: string
}

export interface CriterionItem {
  id: string
  name: string
  type: string
  min: number | null
  max: number | null
  unit: string | null
  isExclusive: boolean | null
}

export interface IcuHospitalizeCriterionItem {
  id: string
  criterion: CriterionItem
  isMainCriteria: boolean
}

export interface ResistanceRiskFactorItem {
  id: string
  pathogen: string
  criterion: CriterionItem
  name: string
}

export interface DiagnosisTemplate {
  icuHospitalizeCriteria: CriterionItem[]
  resistanceRiskFactors: CriterionItem[]
  otherCriteria: CriterionItem[]
}

export interface DiseaseResult {
  id: string
  name: string
  description: string
  requiredIcuMainCriteria: number
  requiredIcuSecondaryCriteria: number
  icuHospitalizeCriteria: IcuHospitalizeCriterionItem[]
  resistanceRisks: ResistanceRiskFactorItem[]
  diseasePathogens: unknown[]
  treatmentProtocols: TreatmentProtocolItem[]
}
