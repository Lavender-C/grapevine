import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Kid } from '@/types/kid';
import { Instructor } from '@/types/user';
import { Feather } from '@expo/vector-icons';

type Props = {
    kid: Kid;
    instructors?: Instructor[];
    expanded: boolean;
    onToggleExpand: () => void;
    updateKid: (updated: Kid) => void;
    isSelected: boolean;
    onToggleSelect: () => void;
};

export default function KidCard({ 
    kid, 
    instructors = [], 
    expanded, 
    onToggleExpand, 
    updateKid,
    isSelected,
    onToggleSelect 
}: Props) {
    
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

    // Display teacher information
    const getTeacherDisplay = () => {
        if (kid.status === 'pending') {
            return 'Pending teacher assignment';
        }
        if (instructors.length === 0) {
            return 'No teacher assigned';
        }
        if (instructors.length === 1) {
            const inst = instructors[0];
            return `${inst.title} ${inst.lastName} - Room ${inst.classroomNumber}`;
        }
        // Multiple teachers
        return `${instructors.length} teachers`;
    };

    return (
        <View style={[
            styles.card, 
            !isSignedIn && styles.inactiveCard,
            isSelected && styles.selectedCard,
            kid.status === 'pending' && styles.pendingCard
        ]}>
            <View style={styles.cardHeader}>
                {/* Checkbox for selection */}
                <TouchableOpacity 
                    onPress={onToggleSelect}
                    style={styles.checkbox}
                >
                    <View style={[styles.checkboxBox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                </TouchableOpacity>

                <View style={styles.cardInfo}>
                    <Text style={styles.kidName}>{kid.firstName} {kid.lastName}</Text>

                    {/* Show status badge */}
                    <View style={styles.badgeRow}>
                        <View style={[styles.statusBadge, isSignedIn ? styles.signedInBadge : styles.signedOutBadge]}>
                            <Text style={styles.statusText}>
                                {isSignedIn ? '✓ Signed In' : '○ Signed Out'}
                            </Text>
                        </View>
                        
                        {kid.status === 'pending' && (
                            <View style={styles.pendingBadge}>
                                <Text style={styles.statusText}>⏳ Pending</Text>
                            </View>
                        )}
                    </View>

                    {/* If signed in and not expanded, display summary info */}
                    {isSignedIn && !expanded && ( 
                        <>
                            <Text>Grade: {kid.grade}</Text>
                            <Text>{getTeacherDisplay()}</Text>
                            <Text>Last Sign-In: {getLastSignIn(kid.logs)}</Text>
                        </>
                    )}
                </View>

                {/* Expand/Collapse Button */}
                <TouchableOpacity onPress={onToggleExpand} style={styles.expandIcon}>
                    <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* --------------------------- expanded view --------------------------- */}

            {expanded && (
                <View style={styles.expandedSection}>
                    <Text>Preferred Name: {kid.prefName}</Text>
                    <Text>Pronouns: {kid.pronouns}</Text>
                    <Text>Sex: {kid.sex}</Text>
                    <Text>Date of Birth: {new Date(kid.dob).toLocaleDateString()}</Text>
                    <Text>Age: {kid.age}</Text>
                    <Text>Grade: {kid.grade}</Text>
                    <Text>Notes: {kid.notes || 'None'}</Text>
                    
                    {/* Show all teachers */}
                    <View style={styles.teachersSection}>
                        <Text style={styles.sectionTitle}>Teachers:</Text>
                        {kid.status === 'pending' ? (
                            <Text style={styles.pendingText}>
                                ⏳ Waiting for a teacher to add {kid.firstName} to their class
                            </Text>
                        ) : instructors.length === 0 ? (
                            <Text>No teachers assigned</Text>
                        ) : (
                            instructors.map((inst) => (
                                <Text key={inst.id}>
                                    • {inst.title} {inst.lastName} - Room {inst.classroomNumber}
                                </Text>
                            ))
                        )}
                    </View>
                    
                    <Text>Last Sign-In: {getLastSignIn(kid.logs)}</Text>

                    {/* Show recent attendance logs */}
                    {kid.logs && kid.logs.length > 0 && (
                        <View style={styles.logsSection}>
                            <Text style={styles.logsTitle}>Recent Activity:</Text>
                            {kid.logs.slice(-5).reverse().map((log, index) => (
                                <Text key={index} style={styles.logEntry}>
                                    {log.action === 'signIn' ? '→' : '←'} {log.action === 'signIn' ? 'Signed In' : 'Signed Out'} - {new Date(log.timestamp).toLocaleString()}
                                    {log.performedBy && (
                                        <Text style={styles.performedBy}> (by {log.performedBy})</Text>
                                    )}
                                </Text>
                            ))}
                        </View>
                    )}

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
        borderWidth: 2,
        borderColor: 'transparent',
    },
    inactiveCard: {
        backgroundColor: '#ddd',
    },
    selectedCard: {
        borderColor: '#2196F3',
        backgroundColor: '#E3F2FD',
    },
    pendingCard: {
        borderColor: '#ff9800',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    checkbox: {
        padding: 4,
    },
    checkboxBox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#666',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#2196F3',
        borderColor: '#2196F3',
    },
    checkmark: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cardInfo: {
        flex: 1,
    },
    kidName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 5,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    signedInBadge: {
        backgroundColor: '#4caf50',
    },
    signedOutBadge: {
        backgroundColor: '#999',
    },
    pendingBadge: {
        backgroundColor: '#ff9800',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    expandIcon: {
        padding: 5,
    },
    expandedSection: {
        marginTop: 10,
        marginLeft: 38,
    },
    teachersSection: {
        marginVertical: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 6,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    pendingText: {
        fontStyle: 'italic',
        color: '#666',
    },
    logsSection: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 6,
    },
    logsTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    logEntry: {
        fontSize: 12,
        color: '#666',
        marginVertical: 2,
    },
    performedBy: {
        fontSize: 11,
        color: '#999',
        fontStyle: 'italic',
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
});