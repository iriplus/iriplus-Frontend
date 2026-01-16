export type UserType = 'COORDINATOR' | 'TEACHER' | 'STUDENT';

export interface User {
  name: string;
  surname: string;
  email: string;
  passwd: string;
  dni: string;
  user_type: UserType;
}

export interface Student extends User {
    student_class_id: number;
}