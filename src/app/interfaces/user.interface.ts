export type UserType = 'COORDINATOR' | 'TEACHER' | 'STUDENT';

export interface User {
  name: string;
  surname: string;
  email: string;
  passwd: string;
  dni: string;
  type: UserType;
}

export interface Student extends User {
    class_code: string;
}