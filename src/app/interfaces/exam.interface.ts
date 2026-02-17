export interface ExamExerciseInstanceDTO {
    id: number;
    exercise_type_id: number;
    exercise_type_name: string;
    instructions: string;
    content_json: string;
    answer_key_json: string;
}

export interface ExamDTO {
    id: number;
    status: string;
    context: string;
    class_id: number;
    generated_exercises: ExamExerciseInstanceDTO[];
    date_created: Date;
    class_description?: string;
    user_id: number;
    teacher_full_name?: string; 
}

export interface ExerciseTypeDTO {
  id: number;
  name: string;
}