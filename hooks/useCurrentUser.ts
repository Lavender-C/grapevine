import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Raisin, Instructor } from '../types/user';

const sampleInstructor: Instructor = {
    id: 'instructor-1',
    title: 'Ms.',
    firstName: 'Taylor',
    lastName: 'Swift',
    email: 'taylor@classroom.com',
    role: 'instructor',
    classroomNumber: 'RM 101',
    kidIds: ['kid-1', 'kid-2'],
};

const sampleRaisin: Raisin = {
    id: 'raisin-1',
    firstName: 'Jamie',
    lastName: 'Lee',
    role: 'raisin',
    phoneNumber: '555-1234',
    email: 'JLee19173@gmail.com',
    safetyCode: '9876',
    kidIds: ['kid-1'],
};

export function useCurrentUser() {
    const [user, setUser] = useState<User | null>(null);

    // Load user from AsyncStorage on mount
    useEffect(() => {
        AsyncStorage.getItem('currentUser').then((data) => {
            if (data) {
            setUser(JSON.parse(data));
            }
        });
        }, []);

    // Save user to AsyncStorage whenever it changes
    useEffect(() => {
        if (user) {
            AsyncStorage.setItem('currentUser', JSON.stringify(user));
        }
    }, [user]);

    const switchToRaisin = () => setUser(sampleRaisin);
    const switchToInstructor = () => setUser(sampleInstructor);

    const clearUser = () => {
        AsyncStorage.removeItem('currentUser');
        setUser(null);
        };

    return { user, setUser, switchToRaisin, switchToInstructor, clearUser };
}
