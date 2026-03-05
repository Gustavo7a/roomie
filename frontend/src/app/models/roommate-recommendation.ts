export interface RoommateRecommendation {
  studentId: number;
  name: string;
  major: string;
  compatibilityPercentage: number;
  commonInterests: string[];
  studySchedule: string | null;
  hobbies: string[];
  lifeStyles: string[];
  cleaningPrefs: string[];
}
