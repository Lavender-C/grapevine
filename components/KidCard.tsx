import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Kid } from '@/types/kid';
import { Instructor } from '@/types/user';
import { Feather } from '@expo/vector-icons';

type Props = {
    kid: Kid;
    instructor?: Instructor;
    expanded: boolean;
    onToggleExpand: () => void;
    updateKid: (updated: Kid) => void;
};

export default function KidCard({ kid, instructor, expanded, onToggleExpand }: Props) {
    
    const isSignedIn = kid.signedIn;
    const [isEditing, setIsEditing] = useState(false);
    const [editedKid, setEditedKid] = useState<Kid>(kid);

    useEffect(() => {
        setEditedKid(kid);
    }, [kid]);

    const getLastSignIn = (logs: any[] = []) => {
        const last = [...logs].reverse().find((log) => log.action === 'signIn');
        return last ? new Date(last.timestamp).toLocaleString() : 'N/A';
    };

    /* --------------------------- user's kid list -------------------------- */
    return (
        <View style={[styles.card, !isSignedIn && styles.inactiveCard]}> {/*if not signed in, only display name and dropdown*/}
        <View style={styles.cardHeader}>
            <View>
            <Text style={styles.kidName}>{kid.firstName} {kid.lastName}</Text>

            {/*if signed in, display more info*/}

            {isSignedIn && !expanded && ( 
                <>
                <Text>Grade: {kid.grade}</Text>
                <Text>Room: {instructor?.classroomNumber || 'Unknown'}</Text>
                <Text>Teacher: {instructor ? `${instructor.title} ${instructor.lastName}` : 'Unknown'}</Text>
                <Text>Last Sign-In: {getLastSignIn(kid.logs)}</Text>
                </>
            )}
            </View>
            <TouchableOpacity onPress={onToggleExpand} style={styles.expandIcon}>
            <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
            </TouchableOpacity>
        </View>

{/* --------------------------- expanded view text --------------------------- */}

        {expanded && (
            <View style={styles.expandedSection}>

                <Text>Preferred Name: {kid.prefName}</Text>
                <Text>Pronouns: {kid.pronouns}</Text>
                <Text>Sex: {kid.sex}</Text>
                <Text>Date of Birth: {new Date(kid.dob).toLocaleDateString()}</Text>
                <Text>Age: {kid.age}</Text>
                <Text>Grade: {kid.grade}</Text>
                <Text>Notes: {kid.notes || 'None'}</Text>
                <Text>Room: {instructor?.classroomNumber || 'Unknown'}</Text>
                <Text>Teacher: {instructor ? `${instructor.title} ${instructor.lastName}` : 'Unknown'}</Text>
                <Text>Last Sign-In: {getLastSignIn(kid.logs)}</Text>

                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <Text style={styles.editText}>Edit Profile</Text>
                </TouchableOpacity>

            </View>
        )}
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    card: {
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#FFF5E1',
        marginBottom: 15,
    },
    inactiveCard: {
        backgroundColor: '#ddd',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    kidName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 5,
    },
    expandIcon: {
        padding: 5,
    },
    expandedSection: {
        marginTop: 10,
    },
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
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginVertical: 5,
        backgroundColor: '#fff',
    },
    editForm: {
        marginTop: 10,
    },
});
