export type UserType = 'Coordinator' | 'Teacher' | 'Student';

export interface User {
  name: string;
  surname: string;
  email: string;
  dni: string;
  type: UserType;
}

export interface Student extends User {
    classId: number;
}