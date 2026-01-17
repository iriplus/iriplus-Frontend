export type UserType = 'COORDINATOR' | 'TEACHER' | 'STUDENT';

export interface UserResponse {
  id: number;
  name: string;
  surname: string;
  email: string;
  dni: string;
  type: UserType;
  is_verified: boolean;
}
