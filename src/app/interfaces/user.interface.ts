export interface User {
    name: string;
    surname: string;
    email: string;
    dni: string;
}

export interface Student extends User {
    classId: number;
}