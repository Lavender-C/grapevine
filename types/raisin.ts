export type Raisin = {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    safetyCode: string; // used to sign kids out
    kidIds: string[]; // references to children
};
