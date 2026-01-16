export type AttendanceAction = 'signIn' | 'signOut';

export type AttendanceLog = {
    timestamp: string;
    action: 'signIn' | 'signOut';
    userID: string;
    performedBy: string;
    performedByRole: 'instructor' | 'raisin';
};

export type KidStatus = 'pending' | 'active';

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
    instructorIds: string[];
    status: KidStatus;
};
