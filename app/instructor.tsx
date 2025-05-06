
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { Kid, AttendanceLog } from '@/types/kid';
import RequireRole from '@/components/RequireRole';
import { useState } from 'react';

export default function RaisinScreen() {
    return (
        <RequireRole role="instructor">
            <InstructorContent />
        </RequireRole>
        );
}


function InstructorContent() {

    const { user } = useCurrentUser();

    const [kids, setKids] = useState<Kid[]>([]);

    const toggleSignIn = (id: string) => {
            const now = new Date().toISOString();
    
            setKids((prev) =>
                prev.map((kid) => {
                    if (kid.id === id) {
                        const newLog: AttendanceLog = {
                            timestamp: now,
                            action: kid.signedIn ? 'signOut' : 'signIn',
                            instructorId: ''
                        };
    
                        const updatedKid: Kid = {
                            ...kid,
                            signedIn: !kid.signedIn,
                            logs: [...(kid.logs ?? []), newLog],
                        };
        
                        return updatedKid;
                    }
                    return kid;
                })
            );
        };

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { marginTop: 30}]}>Your Kids</Text>
                
                <FlatList
                    data={kids}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.kidCard}>
                            <Text style={styles.name}>
                                {item.firstName} {item.lastName}
                            </Text>
                            <Text>Age: {item.age} | Grade: {item.grade} </Text>
                            {item.notes && <Text>Notes: {item.notes} </Text>}
                            <Text>Status: {item.signedIn ? 'Signed In' : 'Signed Out'}</Text>
                            <Button
                                title={item.signedIn ? 'Sign Out' : 'Sign In'}
                                onPress={() => toggleSignIn(item.id)}
                            />
                            <View style={{ marginTop: 10 }}>
                                <Text style={{ fontWeight: 'bold' }}>Attendance Log:</Text>
                                {(item.logs || []).slice(-5).reverse().map((log, index) => (
                                    <Text key={index}>
                                        {log.action} at {new Date(log.timestamp).toLocaleString()}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    )}
                />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
                padding: 10,
                marginBottom: 10,
            },
            kidCard: {
                marginBottom: 15,
                padding: 15,
                borderRadius: 10,
                backgroundColor: '#C1D1A6FF',
            },
            name: { fontSize: 18, fontWeight: '600'},
        })