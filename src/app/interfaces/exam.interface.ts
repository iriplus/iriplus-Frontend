export enum Status {
  PENDING_REVIEW = 'Pending Review',
  ON_REVIEW = 'On Review',
  ACCEPTED = 'Accepted',
  PENDING_CORRECTION = 'Pending Correction',
  ON_CORRECTION = 'On Correction',
  STUDENT_EXAM = 'Student Exam'
}

export interface ExamItemDTO {
  question: string;
  answer: string;
  student_answer?: string | null;
  options?: string[];
}

export interface ExamExerciseInstanceDTO {
  exercise_type: string;
  instructions: string;
  items: ExamItemDTO[];
}

export interface ExamDTO {
  id: number;
  status: string;
  context: string;
  class_id: number;
  exercises: ExamExerciseInstanceDTO[];
  generated_exercises: ExamExerciseInstanceDTO[];
  date_created: string | Date;
  class_description?: string;
  user_id: number;
  teacher_full_name?: string;
  coordinator_full_name?: string | null;
  coordinator_id?: number | null;
  notes?: string | null;
  score?: number | null;
  exp_gained?: number | null;
}

export interface ExerciseTypeDTO {
  id: number;
  name: string;
  content_description: string;
}