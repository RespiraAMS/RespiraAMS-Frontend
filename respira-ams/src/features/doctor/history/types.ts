export interface CreateTreatmentDecisionDto {
  diseaseId?: string
  diseaseName?: string
  severity?: string
  treatmentSite?: string
  infectionProbabilitySnapshots?: InfectionProbabilitySnapshotDto[]
  criteriaSnapshots?: CriterionSnapshotDto[]
  recommended: TreatmentProtocolSnapshotDTo
  chosen: TreatmentProtocolSnapshotDTo
  reason?: string | null
}

export interface InfectionProbabilitySnapshotDto {
  pathogenId: string
  pathogenName: string
  infectionProbability: number
}

export interface CriterionSnapshotDto {
  criterionId: string
  criterionName: string
  value: string | null
}

export interface TreatmentProtocolSnapshotDTo {
  treatmentProtocolId: string
  treatmentProtocolName: string
  treatmentProtocolIssuer: string
  treatmentProtocolIssueDate: string
  treatmentProtocolVersion: number
  medicines: MedicineSnapshotDto[]
}

export interface MedicineSnapshotDto {
  name: string
  antibioticSpectrum: string
  category: string
  dosages: Record<string, string[]>
}

export interface TreatmentDecisionResult {
  id: string
  createdAt: string
  diseaseName: string
  doctorName: string
  severity: string
  treatmentSite: string
  infectionProbabilities: InfectionProbabilityItem[]
  criterionItems: CriterionItem[]
  recommended: TreatmentProtocolItem
  chosen: TreatmentProtocolItem
  reason: string | null
}

export interface InfectionProbabilityItem {
  pathogenName: string
  infectionProbability: number
}

export interface CriterionItem {
  criterionName: string
  value: string | null
}

export interface TreatmentProtocolItem {
  treatmentProtocolName: string
  treatmentProtocolIssuer: string
  treatmentProtocolIssueDate: string
  treatmentProtocolVersion: number
}

export interface TreatmentDecisionItem {
  id: string
  createdAt: string
  diseaseName: string
}

export interface CreateTreatmentDecisionResult {
  id: string
}
