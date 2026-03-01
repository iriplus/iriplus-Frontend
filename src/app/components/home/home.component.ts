import { Component } from '@angular/core';
import { Router, RouterModule } from "@angular/router";
import { CommonModule, NgIf } from '@angular/common';

type UserType = 'STUDENT' | 'TEACHER' | 'COORDINATOR' | null;
type LeaderboardScope = 'COURSE' | 'GLOBAL';

interface StudentCourseSummary {
  name: string;
  description: string;
  teachers: string[];
  studentsEnrolled: number;
  englishLevel: string;
}

interface LeaderboardStudent {
  name: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

interface WeeklyXpPoint {
  label: string;
  value: number;
}

interface StudentProgress {
  currentLevel: number;
  currentXp: number;
  nextLevelXp: number;
}

interface PendingFeedbackExam {
  id: number;
  completedAt: string;
  context: string;
  grade: string;
  xpAwarded: number;
}

interface TeacherStudentWeeklyXp {
  name: string;
  values: WeeklyXpPoint[];
}

interface TeacherPendingExam {
  id: number;
  generationDate: string;
  context: string;
  className: string;
}

interface TeacherCourseDashboard {
  id: number;
  name: string;
  description: string;
  teachers: string[];
  studentsEnrolled: number;
  englishLevel: string;
  leaderboard: LeaderboardStudent[];
  weeklyXpByStudent: TeacherStudentWeeklyXp[];
  pendingCorrectionExams: TeacherPendingExam[];
  pendingReviewExams: TeacherPendingExam[];
}

interface CoordinatorStats {
  newEnrolledStudentsLastWeek: number;
  totalEnrolledStudents: number;
  averageCourseOccupancy: number;
}

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, NgIf],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})


export class HomeComponent {
  userType: UserType = 'TEACHER';

  leaderboardScope: LeaderboardScope = 'COURSE';

  studentCourse: StudentCourseSummary = {
    name: '4th Year A - Morning Group',
    description:
      'Intermediate English course focused on reading comprehension, writing practice, grammar reinforcement, and exam preparation.',
    teachers: ['Emma Wilson', 'Daniel Carter'],
    studentsEnrolled: 28,
    englishLevel: 'B1'
  };

  courseLeaderboard: LeaderboardStudent[] = [
    { name: 'Olivia Martin', level: 11, xp: 4820 },
    { name: 'Lucas Bennett', level: 10, xp: 4510 },
    { name: 'You', level: 10, xp: 4290, isCurrentUser: true },
    { name: 'Sophia Turner', level: 9, xp: 4015 },
    { name: 'Noah Hughes', level: 9, xp: 3870 },
    { name: 'Mia Foster', level: 8, xp: 3520 }
  ];

  globalLeaderboard: LeaderboardStudent[] = [
    { name: 'Charlotte Evans', level: 15, xp: 7900 },
    { name: 'Liam Parker', level: 14, xp: 7510 },
    { name: 'Emily Brooks', level: 14, xp: 7320 },
    { name: 'James Collins', level: 13, xp: 7055 },
    { name: 'Ava Stewart', level: 12, xp: 6810 },
    { name: 'You', level: 10, xp: 4290, isCurrentUser: true }
  ];

  weeklyXp: WeeklyXpPoint[] = [
    { label: 'Mon', value: 80 },
    { label: 'Tue', value: 120 },
    { label: 'Wed', value: 95 },
    { label: 'Thu', value: 150 },
    { label: 'Fri', value: 110 },
    { label: 'Sat', value: 175 },
    { label: 'Sun', value: 140 }
  ];

  studentProgress: StudentProgress = {
    currentLevel: 10,
    currentXp: 4290,
    nextLevelXp: 5000
  };

  pendingFeedbacks: PendingFeedbackExam[] = [
    {
      id: 101,
      completedAt: '2026-02-25',
      context:
        'A school is planning a cultural exchange trip to another country and students must analyze costs, accommodation options, and communication challenges before making a final decision.',
      grade: '8.5 / 10',
      xpAwarded: 180
    },
    {
      id: 102,
      completedAt: '2026-02-26',
      context:
        'An article discusses how technology affects study habits, concentration, and collaboration among teenagers in modern classrooms.',
      grade: '9 / 10',
      xpAwarded: 220
    },
    {
      id: 103,
      completedAt: '2026-02-28',
      context:
        'A city council is evaluating whether public parks should include more sports areas or more quiet reading spaces, based on residents’ opinions and usage patterns.',
      grade: '7.5 / 10',
      xpAwarded: 160
    }
  ];

  private readonly chartWidth = 360;
  private readonly chartHeight = 220;
  private readonly chartLeft = 36;
  private readonly chartRight = 20;
  private readonly chartTop = 18;
  private readonly chartBottom = 34;

  goTo(route: string): void {
    console.log('Navigate to:', route);
  }

  viewExam(examId: number): void {
    console.log('View exam:', examId);
  }

  setLeaderboardScope(scope: LeaderboardScope): void {
    this.leaderboardScope = scope;
  }

  get visibleLeaderboard(): LeaderboardStudent[] {
    return this.leaderboardScope === 'COURSE'
      ? this.courseLeaderboard
      : this.globalLeaderboard;
  }

  get xpToNextLevel(): number {
    return Math.max(this.studentProgress.nextLevelXp - this.studentProgress.currentXp, 0);
  }

  get levelProgressPercent(): number {
    return Math.min(
      (this.studentProgress.currentXp / this.studentProgress.nextLevelXp) * 100,
      100
    );
  }

  get weeklyXpTotal(): number {
    return this.weeklyXp.reduce((total, item) => total + item.value, 0);
  }

  get bestXpDay(): WeeklyXpPoint {
    return this.weeklyXp.reduce((best, current) =>
      current.value > best.value ? current : best
    );
  }

  get chartGridLines(): number[] {
    return [35, 75, 115, 155];
  }

  get chartDots(): Array<{ x: number; y: number; label: string; value: number }> {
    const maxValue = Math.max(...this.weeklyXp.map(point => point.value), 1);
    const drawableWidth = this.chartWidth - this.chartLeft - this.chartRight;
    const drawableHeight = this.chartHeight - this.chartTop - this.chartBottom;

    return this.weeklyXp.map((point, index) => {
      const x =
        this.chartLeft +
        (index * drawableWidth) / Math.max(this.weeklyXp.length - 1, 1);

      const y =
        this.chartTop +
        drawableHeight -
        (point.value / maxValue) * drawableHeight;

      return {
        x,
        y,
        label: point.label,
        value: point.value
      };
    });
  }

  get chartPoints(): string {
    return this.chartDots.map(point => `${point.x},${point.y}`).join(' ');
  }

  getContextPreview(context: string, maxLength: number = 110): string {
    if (context.length <= maxLength) {
      return context;
    }

    return `${context.slice(0, maxLength).trim()}...`;
  }

  selectedTeacherCourseId = 1;
  teacherStudentMenuOpen = false;

  selectedTeacherChartStudents: string[] = [
    'Olivia Martin',
    'Lucas Bennett',
    'Sophia Turner'
  ];

  readonly teacherSeriesPalette: string[] = [
    '#27532f',
    '#C97C5D',
    '#9EB28F',
    '#A3A191',
    '#f0ac91'
  ];

  teacherCourses: TeacherCourseDashboard[] = [
    {
      id: 1,
      name: '4th Year A - Morning Group',
      description:
        'Intermediate course focused on reading comprehension, structured writing, oral production, and Cambridge-style practice tasks.',
      teachers: ['Emma Wilson', 'Daniel Carter'],
      studentsEnrolled: 28,
      englishLevel: 'B1',
      leaderboard: [
        { name: 'Olivia Martin', level: 11, xp: 4820 },
        { name: 'Lucas Bennett', level: 10, xp: 4510 },
        { name: 'Sophia Turner', level: 10, xp: 4295 },
        { name: 'Noah Hughes', level: 9, xp: 3960 },
        { name: 'Mia Foster', level: 8, xp: 3625 }
      ],
      weeklyXpByStudent: [
        {
          name: 'Olivia Martin',
          values: [
            { label: 'Mon', value: 80 },
            { label: 'Tue', value: 110 },
            { label: 'Wed', value: 95 },
            { label: 'Thu', value: 140 },
            { label: 'Fri', value: 120 },
            { label: 'Sat', value: 165 },
            { label: 'Sun', value: 130 }
          ]
        },
        {
          name: 'Lucas Bennett',
          values: [
            { label: 'Mon', value: 60 },
            { label: 'Tue', value: 90 },
            { label: 'Wed', value: 125 },
            { label: 'Thu', value: 100 },
            { label: 'Fri', value: 135 },
            { label: 'Sat', value: 150 },
            { label: 'Sun', value: 115 }
          ]
        },
        {
          name: 'Sophia Turner',
          values: [
            { label: 'Mon', value: 70 },
            { label: 'Tue', value: 85 },
            { label: 'Wed', value: 78 },
            { label: 'Thu', value: 132 },
            { label: 'Fri', value: 98 },
            { label: 'Sat', value: 142 },
            { label: 'Sun', value: 120 }
          ]
        },
        {
          name: 'Noah Hughes',
          values: [
            { label: 'Mon', value: 40 },
            { label: 'Tue', value: 72 },
            { label: 'Wed', value: 68 },
            { label: 'Thu', value: 88 },
            { label: 'Fri', value: 94 },
            { label: 'Sat', value: 112 },
            { label: 'Sun', value: 90 }
          ]
        },
        {
          name: 'Mia Foster',
          values: [
            { label: 'Mon', value: 52 },
            { label: 'Tue', value: 64 },
            { label: 'Wed', value: 58 },
            { label: 'Thu', value: 95 },
            { label: 'Fri', value: 82 },
            { label: 'Sat', value: 120 },
            { label: 'Sun', value: 100 }
          ]
        }
      ],
      pendingCorrectionExams: [
        {
          id: 201,
          generationDate: '2026-02-23',
          context:
            'Students analyze how social media influences communication habits, attention span, and the way teenagers build personal relationships.',
          className: '4th Year A'
        },
        {
          id: 202,
          generationDate: '2026-02-25',
          context:
            'A town is debating whether to invest more in public transport or road expansion, and students must evaluate environmental and economic arguments.',
          className: '4th Year A'
        }
      ],
      pendingReviewExams: [
        {
          id: 203,
          generationDate: '2026-02-20',
          context:
            'An article explores the benefits and limitations of remote learning for high school students in urban and rural contexts.',
          className: '4th Year A'
        },
        {
          id: 204,
          generationDate: '2026-02-22',
          context:
            'A city museum wants to attract younger visitors and is considering interactive exhibitions, digital campaigns, and student partnerships.',
          className: '4th Year A'
        }
      ]
    },
    {
      id: 2,
      name: '5th Year B - Afternoon Group',
      description:
        'Upper-intermediate course with emphasis on argumentative writing, listening comprehension, and exam-oriented vocabulary expansion.',
      teachers: ['Emma Wilson'],
      studentsEnrolled: 24,
      englishLevel: 'B2',
      leaderboard: [
        { name: 'Ethan Reed', level: 13, xp: 6550 },
        { name: 'Grace Hall', level: 12, xp: 6225 },
        { name: 'Aiden Brooks', level: 11, xp: 5980 },
        { name: 'Lily Cooper', level: 11, xp: 5760 },
        { name: 'Mason Gray', level: 10, xp: 5410 }
      ],
      weeklyXpByStudent: [
        {
          name: 'Ethan Reed',
          values: [
            { label: 'Mon', value: 110 },
            { label: 'Tue', value: 135 },
            { label: 'Wed', value: 150 },
            { label: 'Thu', value: 142 },
            { label: 'Fri', value: 160 },
            { label: 'Sat', value: 175 },
            { label: 'Sun', value: 148 }
          ]
        },
        {
          name: 'Grace Hall',
          values: [
            { label: 'Mon', value: 95 },
            { label: 'Tue', value: 124 },
            { label: 'Wed', value: 118 },
            { label: 'Thu', value: 137 },
            { label: 'Fri', value: 132 },
            { label: 'Sat', value: 158 },
            { label: 'Sun', value: 146 }
          ]
        },
        {
          name: 'Aiden Brooks',
          values: [
            { label: 'Mon', value: 82 },
            { label: 'Tue', value: 100 },
            { label: 'Wed', value: 108 },
            { label: 'Thu', value: 125 },
            { label: 'Fri', value: 140 },
            { label: 'Sat', value: 150 },
            { label: 'Sun', value: 134 }
          ]
        },
        {
          name: 'Lily Cooper',
          values: [
            { label: 'Mon', value: 88 },
            { label: 'Tue', value: 92 },
            { label: 'Wed', value: 110 },
            { label: 'Thu', value: 118 },
            { label: 'Fri', value: 126 },
            { label: 'Sat', value: 144 },
            { label: 'Sun', value: 130 }
          ]
        }
      ],
      pendingCorrectionExams: [
        {
          id: 205,
          generationDate: '2026-02-24',
          context:
            'Students discuss whether international volunteer programs genuinely benefit local communities or mainly serve the participants.',
          className: '5th Year B'
        }
      ],
      pendingReviewExams: [
        {
          id: 206,
          generationDate: '2026-02-21',
          context:
            'A report compares traditional libraries and digital reading platforms, focusing on accessibility, habits, and long-term engagement.',
          className: '5th Year B'
        }
      ]
    },
    {
      id: 3,
      name: '3rd Year C - Evening Group',
      description:
        'Foundational course designed to strengthen grammar accuracy, basic writing, and reading confidence through guided practice.',
      teachers: ['Daniel Carter', 'Sophie Allen'],
      studentsEnrolled: 19,
      englishLevel: 'A2',
      leaderboard: [
        { name: 'Chloe Perry', level: 7, xp: 2480 },
        { name: 'Leo Price', level: 7, xp: 2310 },
        { name: 'Ruby Ross', level: 6, xp: 2195 },
        { name: 'Jack Bailey', level: 6, xp: 2070 },
        { name: 'Ella Ward', level: 5, xp: 1890 }
      ],
      weeklyXpByStudent: [
        {
          name: 'Chloe Perry',
          values: [
            { label: 'Mon', value: 42 },
            { label: 'Tue', value: 58 },
            { label: 'Wed', value: 60 },
            { label: 'Thu', value: 70 },
            { label: 'Fri', value: 75 },
            { label: 'Sat', value: 82 },
            { label: 'Sun', value: 78 }
          ]
        },
        {
          name: 'Leo Price',
          values: [
            { label: 'Mon', value: 38 },
            { label: 'Tue', value: 46 },
            { label: 'Wed', value: 52 },
            { label: 'Thu', value: 64 },
            { label: 'Fri', value: 68 },
            { label: 'Sat', value: 73 },
            { label: 'Sun', value: 70 }
          ]
        },
        {
          name: 'Ruby Ross',
          values: [
            { label: 'Mon', value: 34 },
            { label: 'Tue', value: 40 },
            { label: 'Wed', value: 48 },
            { label: 'Thu', value: 55 },
            { label: 'Fri', value: 60 },
            { label: 'Sat', value: 66 },
            { label: 'Sun', value: 62 }
          ]
        }
      ],
      pendingCorrectionExams: [
        {
          id: 207,
          generationDate: '2026-02-26',
          context:
            'Students read a short text about healthy routines and answer grammar and comprehension questions linked to daily habits.',
          className: '3rd Year C'
        }
      ],
      pendingReviewExams: [
        {
          id: 208,
          generationDate: '2026-02-19',
          context:
            'A simple classroom article presents a school recycling campaign and asks students to identify key actions and recommendations.',
          className: '3rd Year C'
        }
      ]
    }
  ];

  get selectedTeacherCourse(): TeacherCourseDashboard {
    return (
      this.teacherCourses.find(course => course.id === this.selectedTeacherCourseId) ??
      this.teacherCourses[0]
    );
  }

  setSelectedTeacherCourse(courseId: number): void {
    this.selectedTeacherCourseId = courseId;
    this.teacherStudentMenuOpen = false;

    this.selectedTeacherChartStudents = this.selectedTeacherCourse.weeklyXpByStudent
      .slice(0, 3)
      .map(series => series.name);
  }

  toggleTeacherStudentMenu(): void {
    this.teacherStudentMenuOpen = !this.teacherStudentMenuOpen;
  }

  isTeacherStudentSelected(studentName: string): boolean {
    return this.selectedTeacherChartStudents.includes(studentName);
  }

  toggleTeacherChartStudent(studentName: string): void {
    const alreadySelected = this.isTeacherStudentSelected(studentName);

    if (alreadySelected) {
      if (this.selectedTeacherChartStudents.length === 1) {
        return;
      }

      this.selectedTeacherChartStudents = this.selectedTeacherChartStudents.filter(
        name => name !== studentName
      );

      return;
    }

    this.selectedTeacherChartStudents = [
      ...this.selectedTeacherChartStudents,
      studentName
    ];
  }

  openTeacherExam(examId: number, mode: 'correction' | 'review'): void {
    console.log('Teacher action:', mode, 'Exam ID:', examId);
  }

  get teacherSelectedWeeklySeries(): Array<{
    name: string;
    color: string;
    points: Array<{ x: number; y: number; label: string; value: number }>;
    polyline: string;
  }> {
    return this.selectedTeacherCourse.weeklyXpByStudent
      .filter(series => this.selectedTeacherChartStudents.includes(series.name))
      .map((series, index) => ({
        name: series.name,
        color: this.teacherSeriesPalette[index % this.teacherSeriesPalette.length],
        points: this.buildTeacherChartDots(series.values),
        polyline: this.buildTeacherChartDots(series.values)
          .map(point => `${point.x},${point.y}`)
          .join(' ')
      }));
  }

  get teacherChartXAxis(): Array<{ x: number; y: number; label: string; value: number }> {
    return this.teacherSelectedWeeklySeries[0]?.points ?? [];
  }

  private buildTeacherChartDots(
    points: WeeklyXpPoint[]
  ): Array<{ x: number; y: number; label: string; value: number }> {
    const allValues = this.selectedTeacherCourse.weeklyXpByStudent.reduce<number[]>(
      (acc, series) => {
        acc.push(...series.values.map(point => point.value));
        return acc;
      },
      []
    );

    const maxValue = Math.max(...allValues, 1);

    const drawableWidth = this.chartWidth - this.chartLeft - this.chartRight;
    const drawableHeight = this.chartHeight - this.chartTop - this.chartBottom;

    return points.map((point, index) => {
      const x =
        this.chartLeft +
        (index * drawableWidth) / Math.max(points.length - 1, 1);

      const y =
        this.chartTop +
        drawableHeight -
        (point.value / maxValue) * drawableHeight;

      return {
        x,
        y,
        label: point.label,
        value: point.value
      };
    });
  }

  coordinatorStats: CoordinatorStats = {
    newEnrolledStudentsLastWeek: 18,
    totalEnrolledStudents: 246,
    averageCourseOccupancy: 81
  };

}
