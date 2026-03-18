export interface Exercise {
  id: number;
  name: string;
  content_description: string;
  date_created: string | null;
}

export interface ExercisePayload {
  name: string;
  content_description: string;
}