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