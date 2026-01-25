import { Class } from './class.interface';
import { Level } from './level.interface';

export type UserType = 'Coordinator' | 'Teacher' | 'Student';

export interface UserResponse {
  id: number;
  name: string;
  surname: string;
  email: string;
  dni: string;
  type: UserType;
  is_verified: boolean;

  accumulated_xp?: number;

  student_level?: Level | null;
  student_class?: Class | null;

  teacher_classes?: Class[];
}
