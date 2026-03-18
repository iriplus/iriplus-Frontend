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
  exam_exercise_instance_id?: number;
  exercise_type: string;
  instructions: string;
  items: ExamItemDTO[];
}

export interface SubmitStudentExamPayload {
  exercises: {
    exam_exercise_instance_id: number;
    items: { student_answer: string }[];
  }[];
}

export interface SubmitStudentExamResponse {
  message: string;
  exam_id: number;
  score: number;
  xp_gained?: number;
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

// Exam Review (correction view for students)
export interface ExamReviewItemDTO {
  question: string;
  student_answer: string;
  correct_answer: string;
  feedback: string;
  is_correct: boolean;
  has_blank?: boolean;
}

export interface ExamReviewExerciseDTO {
  exam_exercise_instance_id: number;
  exercise_type: string;
  instructions: string;
  items: ExamReviewItemDTO[];
  correct_count: number;
  total_count: number;
  feedback: string;
}

export interface ExamReviewScoreDetailItemDTO {
  item_index: number;
  student_answer: string;
  correct_answer: string;
  feedback: string;
  is_correct: boolean;
}

export interface ExamReviewScoreDetailExerciseDTO {
  exam_exercise_instance_id: number;
  exercise_type: string;
  items: ExamReviewScoreDetailItemDTO[];
  correct_count: number;
  total_count: number;
  feedback: string;
}

export interface ExamReviewScoreDetailDTO {
  exercises: ExamReviewScoreDetailExerciseDTO[];
  general_feedback?: string;
}

export interface ExamReviewDTO {
  id: number;
  status: string;
  score: number;
  xp_gained?: number;
  context: string;
  class_id: number;
  class_description?: string;
  date_created: string | Date;
  notes?: string | null;
  exercises: ExamReviewExerciseDTO[];
  score_detail: ExamReviewScoreDetailDTO;
  student_id?: number;
  student_full_name?: string;
}