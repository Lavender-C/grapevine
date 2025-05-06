export type AttendanceAction = 'signIn' | 'signOut';

export type AttendanceLog = {
    timestamp: string;
    action: 'signIn' | 'signOut';
    instructorId: string; // who performed the action
};

export type Kid = {
    id: string;
    firstName: string;
    lastName: string;
    prefName: string;
    pronouns: string;
    sex: string;
    dob: Date;
    age: number;
    grade: number;
    notes?: string;
    signedIn: boolean;
    logs?: AttendanceLog[];
    raisinIds: string[];
    instructorId: string;
};

