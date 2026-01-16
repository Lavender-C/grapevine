import { useCurrentUser } from '@/hooks/useCurrentUser';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal } from 'react-native';
import { Kid, AttendanceLog } from '@/types/kid';
import RequireRole from '@/components/RequireRole';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Instructor } from '@/types/user';

export default function InstructorScreen() {
    return (
        <RequireRole role="instructor">
            <InstructorContent />
        </RequireRole>
    );
}

function InstructorContent() {
    const { user } = useCurrentUser();
    const [kids, setKids] = useState<Kid[]>([]);
    const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'signedIn'>('all');

    // Load kids from AsyncStorage on mount
    useEffect(() => {
        AsyncStorage.getItem('kids').then((data) => {
            if (data) {
                const loadedKids = JSON.parse(data);
                setKids(loadedKids);
            }
        });
    }, []);

    // Save kids to AsyncStorage whenever they change
    const saveKids = (updatedKids: Kid[]) => {
        setKids(updatedKids);
        AsyncStorage.setItem('kids', JSON.stringify(updatedKids));
    };

    if (!user) return null;

    // Filter kids that belong to this instructor
    const myKids = kids.filter(k => k.instructorIds?.includes(user.id));
    
    // Filter for pending kids (not claimed by anyone yet)
    const pendingKids = kids.filter(k => k.status === 'pending');

    // Filter based on view mode
    const displayedKids = viewMode === 'all' 
        ? myKids 
        : myKids.filter(k => k.signedIn);

    /* ----------------------- CLAIM/UNCLAIM FUNCTIONS ---------------------- */

    const claimKid = (kidId: string) => {
        const updatedKids = kids.map(kid => {
            if (kid.id === kidId) {
                return {
                    ...kid,
                    instructorIds: [...kid.instructorIds, user.id],
                    status: 'active' as const, // Once claimed, status becomes active
                };
            }
            return kid;
        });
        saveKids(updatedKids);
    };

    const unclaimKid = (kidId: string) => {
        const updatedKids = kids.map(kid => {
            if (kid.id === kidId) {
                const newInstructorIds = kid.instructorIds.filter(id => id !== user.id);
                return {
                    ...kid,
                    instructorIds: newInstructorIds,
                    // If no instructors left, set back to pending
                    status: newInstructorIds.length === 0 ? 'pending' as const : 'active' as const,
                };
            }
            return kid;
        });
        saveKids(updatedKids);
    };

    /* ----------------------- SIGN IN/OUT FUNCTION ---------------------- */

    const toggleSignIn = (kidId: string) => {
        const updatedKids = kids.map(kid => {
            if (kid.id === kidId) {
                const newLog: AttendanceLog = {
                    timestamp: new Date().toISOString(),
                    action: kid.signedIn ? 'signOut' : 'signIn',
                    userID: user.id,
                    performedBy: user.firstName + ' ' + user.lastName,
                    performedByRole: 'instructor',
                };

                return {
                    ...kid,
                    signedIn: !kid.signedIn,
                    logs: [...(kid.logs ?? []), newLog],
                };
            }
            return kid;
        });
        saveKids(updatedKids);
    };

    /* --------------------------- RENDER FUNCTIONS ------------------------- */

    const renderKidCard = (kid: Kid) => (
        <View style={styles.kidCard}>
            <View style={styles.cardHeader}>
                <View style={styles.kidInfo}>
                    <Text style={styles.name}>
                        {kid.firstName} {kid.lastName}
                    </Text>
                    <Text>Age: {kid.age} | Grade: {kid.grade}</Text>
                    {kid.notes && <Text>Notes: {kid.notes}</Text>}
                    <View style={[styles.statusBadge, kid.signedIn ? styles.signedIn : styles.signedOut]}>
                        <Text style={styles.statusText}>
                            {kid.signedIn ? '✓ Signed In' : '○ Signed Out'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, kid.signedIn ? styles.signOutButton : styles.signInButton]}
                        onPress={() => toggleSignIn(kid.id)}
                    >
                        <Text style={styles.actionButtonText}>
                            {kid.signedIn ? 'Sign Out' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.unclaimButton}
                        onPress={() => unclaimKid(kid.id)}
                    >
                        <Text style={styles.unclaimText}>Remove from Class</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Attendance Log */}
            <View style={styles.logSection}>
                <Text style={styles.logTitle}>Recent Activity:</Text>
                {(kid.logs || []).slice(-5).reverse().map((log, index) => (
                    <Text key={index} style={styles.logEntry}>
                        {log.action === 'signIn' ? '→' : '←'} {log.action === 'signIn' ? 'Signed In' : 'Signed Out'} - {new Date(log.timestamp).toLocaleString()}
                        {log.performedBy && (
                            <Text> (by {log.performedBy})</Text>
                        )}
                    </Text>
                ))}
            </View>
        </View>
    );

    const renderPendingKid = (kid: Kid) => (
        <View style={styles.pendingKidCard}>
            <View style={styles.pendingKidInfo}>
                <Text style={styles.name}>
                    {kid.firstName} {kid.lastName}
                </Text>
                <Text>Age: {kid.age} | Grade: {kid.grade}</Text>
                {kid.notes && <Text>Notes: {kid.notes}</Text>}
            </View>
            <TouchableOpacity
                style={styles.claimButton}
                onPress={() => {
                    claimKid(kid.id);
                    setShowAddStudentsModal(false);
                }}
            >
                <Text style={styles.claimButtonText}>Add to Class</Text>
            </TouchableOpacity>
        </View>
    );

    // Type assertion: Tell TypeScript this is definitely an Instructor
    const instructor = user as Instructor;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Welcome, {instructor.title} {instructor.lastName}!
            </Text>

            {/* View Mode Toggle */}
            <View style={styles.viewToggle}>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'all' && styles.activeToggle]}
                    onPress={() => setViewMode('all')}
                >
                    <Text style={[styles.toggleText, viewMode === 'all' && styles.activeToggleText]}>
                        All Students ({myKids.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.toggleButton, viewMode === 'signedIn' && styles.activeToggle]}
                    onPress={() => setViewMode('signedIn')}
                >
                    <Text style={[styles.toggleText, viewMode === 'signedIn' && styles.activeToggleText]}>
                        Signed In ({myKids.filter(k => k.signedIn).length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Add Students Button */}
            <TouchableOpacity
                style={styles.addStudentsButton}
                onPress={() => setShowAddStudentsModal(true)}
            >
                <Text style={styles.addStudentsText}>
                    ＋ Add Students {pendingKids.length > 0 && `(${pendingKids.length} pending)`}
                </Text>
            </TouchableOpacity>

            {/* Students List */}
            {displayedKids.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        {viewMode === 'all' 
                            ? 'No students in your class yet. Tap "Add Students" to get started!'
                            : 'No students currently signed in.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayedKids}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => renderKidCard(item)}
                />
            )}

            {/* Add Students Modal */}
            <Modal
                visible={showAddStudentsModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowAddStudentsModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Pending Students</Text>
                            <TouchableOpacity onPress={() => setShowAddStudentsModal(false)}>
                                <Text style={styles.closeButton}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {pendingKids.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>
                                    No pending students available.
                                </Text>
                            </View>
                        ) : (
                            <FlatList
                                data={pendingKids}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => renderPendingKid(item)}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   STYLES                                   */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, marginTop: 30 },
    
    viewToggle: {
        flexDirection: 'row',
        marginBottom: 15,
        gap: 10,
    },
    toggleButton: {
        flex: 1,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
    },
    activeToggle: {
        backgroundColor: '#8BC34A',
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    activeToggleText: {
        color: 'white',
    },

    addStudentsButton: {
        backgroundColor: '#C1D1A6',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    addStudentsText: {
        fontSize: 16,
        fontWeight: '600',
    },

    kidCard: {
        marginBottom: 15,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#C1D1A6',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    kidInfo: {
        flex: 1,
    },
    cardActions: {
        gap: 8,
    },
    name: { 
        fontSize: 18, 
        fontWeight: '600',
        marginBottom: 5,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    signedIn: {
        backgroundColor: '#4caf50',
    },
    signedOut: {
        backgroundColor: '#999',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    actionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 90,
        alignItems: 'center',
    },
    signInButton: {
        backgroundColor: '#4caf50',
    },
    signOutButton: {
        backgroundColor: '#f44336',
    },
    actionButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    unclaimButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: '#ff9800',
    },
    unclaimText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '600',
    },
    logSection: {
        marginTop: 15,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 6,
    },
    logTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    logEntry: {
        fontSize: 12,
        color: '#666',
        marginVertical: 2,
    },

    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 28,
        color: '#666',
    },
    pendingKidCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        marginBottom: 10,
        borderRadius: 10,
        backgroundColor: '#FFF5E1',
    },
    pendingKidInfo: {
        flex: 1,
    },
    claimButton: {
        backgroundColor: '#8BC34A',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    claimButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});