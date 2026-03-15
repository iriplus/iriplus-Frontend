export interface CoordinatorAnalyticsStats {
  newEnrolledStudentsLastWeek: number;
  totalEnrolledStudents: number;
  averageCourseOccupancy: number;
}

export interface HomeAnalyticsResponse {
  role: string;
  dashboard: {
    coordinator?: CoordinatorAnalyticsStats;
  };
}

export interface TuitionStudentOverdue {
  id: number;
  fullName: string;
  dni: string;
  monthsOverdue: number;
}

export type TuitionStudentStatus = 'upToDate' | 'delinquent' | 'noData';

export interface TuitionStudent {
  id: number;
  name: string;
  surname: string;
  fullName: string;
  dni: string;
  status: TuitionStudentStatus;
  monthsOverdue: number;
  lastPaidMonth: string;
  lastPaymentDate: string;
}

export interface TuitionSummary {
  totalStudents: number;
  counts: {
    upToDate: number;
    delinquent: number;
    noData: number;
  };
  percentages: {
    upToDate: number;
    delinquent: number;
    noData: number;
  };
}

export interface TuitionDashboard {
  generatedAt: string;
  summary: TuitionSummary;
  studentsWithThreeOrMoreMonthsOverdue: TuitionStudentOverdue[];
  students: TuitionStudent[];
}

export interface TuitionAnalyticsResponse {
  role: string;
  dashboard: {
    tuition?: TuitionDashboard;
  };
}