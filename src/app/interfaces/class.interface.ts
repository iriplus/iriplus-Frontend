import { User } from "./user.interface";

export interface Class {
    id: number;
    class_code: string;
    description: string;
    suggested_level: string;
    max_capacity: number;
    students: User[];
    teachers: User[];
}