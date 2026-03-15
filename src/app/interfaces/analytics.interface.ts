export interface CoordinatorAnalyticsStats {
  newEnrolledStudentsLastWeek: number;
  totalEnrolledStudents: number;
  averageCourseOccupancy: number;
}

export interface StudentCourseSummary {
  name: string;
  description: string;
  teachers: string[];
  studentsEnrolled: number;
  englishLevel: string;
}

export interface LeaderboardStudent {
  rank: number;
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

export interface WeeklyXpPoint {
  label: string;
  value: number;
}

export interface StudentProgress {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
}

export interface StudentLastExam {
  id: number;
  completedAt: string;
  context: string;
  grade: string;
  xpAwarded: number;
}

export interface StudentDashboard {
  courseSummary: StudentCourseSummary;
  leaderboards: {
    course: LeaderboardStudent[];
    global: LeaderboardStudent[];
  };
  weeklyXp: WeeklyXpPoint[];
  progress: StudentProgress;
  lastExams: StudentLastExam[];
}

export interface HomeAnalyticsResponse {
  role: string;
  dashboard: {
    coordinator?: CoordinatorAnalyticsStats;
    student?: StudentDashboard;
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