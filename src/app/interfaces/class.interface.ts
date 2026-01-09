export interface Class {
    id: number;
    class_code: string;
    description: string;
    suggested_level: string;
    max_capacity: number;
}

export interface ClassResponse {
    message: string;
    data: Class[];
}