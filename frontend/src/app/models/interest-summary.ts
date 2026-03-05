import { InterestStatus } from './interest-status.enum';

export interface InterestSummary {
  interestId: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  major: string;
  institution: string;
  status: InterestStatus;
  interestDate: string;
}

