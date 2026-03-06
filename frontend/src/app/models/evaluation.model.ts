export interface EvaluationRequest {
  rating: number;
}

export interface EvaluationResponse {
  id: number;
  propertyId: number;
  studentId: number;
  studentName: string;
  rating: number;
  timestamp: string;
}

export interface EvaluationSummary {
  averageRating: number;
  totalEvaluations: number;
  evaluations: EvaluationResponse[];
}
