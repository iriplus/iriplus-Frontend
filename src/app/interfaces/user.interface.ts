import { Level } from "./level.interface";
import { Class } from "./class.interface";

export enum UserType {
  COORDINATOR = 'Coordinator',
  TEACHER = 'Teacher',
  STUDENT = 'Student'
}

export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  passwd: string;
  dni: string;
  type: string;
  is_verified: boolean;
  profile_picture: string;

  // Optional fields if student
  student_class_id?: number;
  class_code?: string;
  accumulated_xp?: number,
  student_class?: Class;
  student_level?: Level;

  // Optional fields if Teacher
  teacher_classes?: Class[];
}