export interface WritingReviewRequest {
  exercise_prompt: string;
  student_submission: string;
}

export interface WritingFeedbackSections {
  task_achievement?: string[];
  grammar?: string[];
  vocabulary?: string[];
  organization?: string[];
}

export interface WritingLineCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

export interface WritingFeedback {
  overall_assessment: string;
  corrected_version: string;
  feedback?: WritingFeedbackSections;
  line_corrections?: WritingLineCorrection[];
  tips?: string[];
  estimated_level_fit?: string;
}

export interface WritingReviewResponse {
  message: string;
  result: WritingFeedback;
}

