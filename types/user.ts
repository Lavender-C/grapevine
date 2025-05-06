export type UserRole = 'instructor' | 'raisin';

export type BaseUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string,
    role: UserRole;
};

export type Raisin = BaseUser & {
    role: 'raisin';
    phoneNumber: string;
    safetyCode: string;
    kidIds: string[];
};

export type Instructor = BaseUser & {
    role: 'instructor';
    title: string,
    classroomNumber: string;
    kidIds: string[];
};

export type User = Raisin | Instructor;
