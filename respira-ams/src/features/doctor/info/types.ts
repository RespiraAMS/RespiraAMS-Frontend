export type Severity = "Mild" | "Moderate" | "Severe"
export type TreatmentSite = "Outpatient" | "Inpatient" | "IntensiveCareUnit"
export type CriterionType = "Boolean" | "Numeric"

export interface AntibioticItem {
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

export interface PathogenItem {
  id: string
  name: string
  description: string
}

export interface DiseaseItem {
  id: string
  name: string
  description: string
}

export interface DiseaseDetail extends DiseaseItem {
  treatmentProtocols: TreatmentProtocolItem[]
}

export interface TreatmentProtocolItem {
  id: string
  name: string
  issuer: string
  issueDate: string
  version: number
  medicines: AntibioticItem[]
}

export interface CriterionItem {
  id: string
  name: string
  type: CriterionType
  min?: number | null
  max?: number | null
  unit?: string | null
  isExclusive?: boolean | null
}

export interface TreatmentProtocolDetail {
  id: string
  name: string
  issuer: string
  issueDate: string
  version: number
  severity: Severity
  treatmentSite: TreatmentSite
  specialInfection: PathogenItem | null
  otherCriteria: CriterionItem[]
  medicines: AntibioticItem[]
  updatedAt: string
}
