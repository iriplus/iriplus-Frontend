export interface ExamItemDTO {
  question: string;
  answer: string;
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
}

export interface ExerciseTypeDTO {
  id: number;
  name: string;
  content_description: string;
}