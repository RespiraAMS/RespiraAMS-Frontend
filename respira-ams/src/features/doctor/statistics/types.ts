export interface StatisticsResult {
  totalDecision: ClinicalDecision[]
  recommendationAccuracy: RecommendationAccuracy[]
  antibioticConsumptionRates: AntibioticConsumptionRate[]
}

export interface ClinicalDecision {
  severity: string
  count: number
}

export interface RecommendationAccuracy {
  month: number
  accuracy: number
}

export interface AntibioticConsumptionRate {
  category: string
  count: number
  rate: number
}
