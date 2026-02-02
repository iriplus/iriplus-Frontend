import { Level } from "./level.interface";
import { Class } from "./class.interface";

export type UserType = 'COORDINATOR' | 'TEACHER' | 'STUDENT';

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  passwd: string;
  dni: string;
  type: UserType;
  is_verified: boolean;

  // Optional fields if student
  class_code?: string;
  accumulated_xp?: number,
  student_class?: Class;
  student_level?: Level;

  // Optional fields if Teacher
  teacher_classes?: Class[];
}