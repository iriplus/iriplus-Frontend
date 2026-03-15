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