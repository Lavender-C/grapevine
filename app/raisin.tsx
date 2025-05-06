import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Kid } from '@/types/kid';
import { Instructor } from '@/types/user';
import KidCard from '@/components/KidCard';

export default function RaisinDashboard() {
    const { user } = useCurrentUser();
    const [kids, setKids] = useState<Kid[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [expandedKidId, setExpandedKidId] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem('kids').then((data) => {
        if (data) setKids(JSON.parse(data));
        });
        AsyncStorage.getItem('instructors').then((data) => {
        if (data) setInstructors(JSON.parse(data));
        });
    }, []);

    // patch to update old profiles with new uuid for testing

    // useEffect(() => {
    //     if (user && user.role === 'raisin') {
    //         AsyncStorage.getItem('kids').then((data) => {
    //             if (data) {
    //                 const existingKids: Kid[] = JSON.parse(data);
    //                 const patchedKids = existingKids.map((kid) => {
    //                     if (!kid.raisinIds || kid.raisinIds.length === 0) {
    //                         return { ...kid, raisinIds: [user.id] };
    //                     }
    //                     return kid;
    //                 });
    //                 setKids(patchedKids);
    //                 AsyncStorage.setItem('kids', JSON.stringify(patchedKids));
    //             }
    //         });
    //     }
    // }, [user]);

    const getInstructor = (id: string) => instructors.find((inst) => inst.id === id);
    
    const getLastSignIn = (logs: any[] = []) => {
        const lastSignIn = [...logs].reverse().find((log) => log.action === 'signIn');
        return lastSignIn ? new Date(lastSignIn.timestamp).toLocaleString() : 'N/A';
    };

    // change?
    if (!user || user.role !== 'raisin') return null;

    const userKids = kids.filter((k) => k.raisinIds.includes(user.id));

    const updateKid = (updated: Kid) => {
        const newList = kids.map((k) => (k.id === updated.id ? updated : k));
        setKids(newList);
        AsyncStorage.setItem('kids', JSON.stringify(newList));
    };

    return (
        <View style={styles.container}>
        <Text style={styles.header}>Welcome, {user.firstName}!</Text>

        <FlatList
            data={userKids}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <KidCard
                    key={item.id}
                    kid={item}
                    instructor={instructors.find((i) => i.id === item.instructorId)}
                    expanded={expandedKidId === item.id}
                    onToggleExpand={() =>
                        setExpandedKidId((prev) => (prev === item.id ? null : item.id))
                    }
                    updateKid={updateKid}
                />
            )}
        />

        <View style={styles.tabBar}>
            <TouchableOpacity style={styles.tabButton}>
            <Text style={styles.tabText}>Check-In</Text>
            </TouchableOpacity>
        </View>
        </View>
    );
}


/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({

    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20 },
    card: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#FFF5E1',
        marginBottom: 15,
    },
    inactiveCard: {
        backgroundColor: '#ddd',
    },
    kidName: { fontSize: 20, fontWeight: '600', marginBottom: 5 },
    expandedSection: { marginTop: 10 },
    editButton: {
        marginTop: 10,
        padding: 10,
        borderRadius: 6,
        backgroundColor: '#fbc531',
        alignItems: 'center',
    },
    editText: {
        fontWeight: 'bold',
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#fff',
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        backgroundColor: '#e1bee7',
        borderRadius: 10,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
    },

});
