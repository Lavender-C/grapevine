import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Kid, AttendanceLog } from '@/types/kid';
import { Instructor } from '@/types/user';
import KidCard from '@/components/KidCard';
import CreateKid from '@/components/CreateKid';

export default function RaisinDashboard() {
    const { user } = useCurrentUser();
    const [kids, setKids] = useState<Kid[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [expandedKidId, setExpandedKidId] = useState<string | null>(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [selectedKidIds, setSelectedKidIds] = useState<Set<string>>(new Set());

    const handleCreateKid = (kid: Kid) => {
        const updated = [...kids, kid];
        setKids(updated);
        AsyncStorage.setItem('kids', JSON.stringify(updated));
    };

    useEffect(() => {
        AsyncStorage.getItem('kids').then((data) => {
            if (data) setKids(JSON.parse(data));
        });
        AsyncStorage.getItem('instructors').then((data) => {
            if (data) setInstructors(JSON.parse(data));
        });
    }, []);

    // const getInstructor = (id: string) => instructors.find((inst) => inst.id === id);
    
    // const getLastSignIn = (logs: any[] = []) => {
    //     const lastSignIn = [...logs].reverse().find((log) => log.action === 'signIn');
    //     return lastSignIn ? new Date(lastSignIn.timestamp).toLocaleString() : 'N/A';
    // };

    if (!user || user.role !== 'raisin') return null;

    const userKids = kids.filter((k) => k.raisinIds.includes(user.id));

    const updateKid = (updated: Kid) => {
        const newList = kids.map((k) => (k.id === updated.id ? updated : k));
        setKids(newList);
        AsyncStorage.setItem('kids', JSON.stringify(newList));
    };

    /* -------------------- SELECTION HANDLING FUNCTIONS -------------------- */

    // Toggle selection for a single kid
    const toggleKidSelection = (kidId: string) => {
        setSelectedKidIds((prev) => {
            const newSet = new Set(prev); // Create a copy of the Set
            if (newSet.has(kidId)) {
                newSet.delete(kidId); // Unselect if already selected
            } else {
                newSet.add(kidId); // Select if not selected
            }
            return newSet;
        });
    };

    // Select or deselect all kids
    const toggleSelectAll = () => {
        if (selectedKidIds.size === userKids.length) {
            // If all are selected, deselect all
            setSelectedKidIds(new Set());
        } else {
            // Otherwise, select all
            setSelectedKidIds(new Set(userKids.map(k => k.id)));
        }
    };

    /* -------------------- BATCH SIGN IN/OUT OPERATION -------------------- */

    const handleBatchSignInOut = (action: 'signIn' | 'signOut') => {
        // Get all selected kids
        const selectedKids = userKids.filter(k => selectedKidIds.has(k.id));
        
        // Filter to only kids that need the action
        const kidsToUpdate = selectedKids.filter(k => 
            action === 'signIn' ? !k.signedIn : k.signedIn
        );

        if (kidsToUpdate.length === 0) {
            return;
        }

        // Create updated kid objects with new logs
        const updatedKids = kidsToUpdate.map(kid => {
            const newLog: AttendanceLog = {
                timestamp: new Date().toISOString(),
                action: action,
                userID: user.id,
                performedBy: `${user.firstName} ${user.lastName}`,  // use's name
                performedByRole: 'raisin',  // Parent role
            };

            return {
                ...kid,
                signedIn: action === 'signIn',
                logs: [...(kid.logs || []), newLog],
            };
        });

        // Update the kids list with all changes at once
        const newKidsList = kids.map(k => {
            const updated = updatedKids.find(uk => uk.id === k.id);
            return updated || k; // Use updated version if it exists, otherwise original
        });

        setKids(newKidsList);
        AsyncStorage.setItem('kids', JSON.stringify(newKidsList));
        
        setSelectedKidIds(new Set());
    };

    // Count how many selected kids can be signed in/out
    const selectedKids = userKids.filter(k => selectedKidIds.has(k.id));
    const canSignIn = selectedKids.filter(k => !k.signedIn).length;
    const canSignOut = selectedKids.filter(k => k.signedIn).length;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Welcome, {user.firstName}!</Text>

            {/* Selection Controls */}
            {userKids.length > 0 && (
                <View style={styles.selectionControls}>
                    <TouchableOpacity
                        style={styles.selectAllButton}
                        onPress={toggleSelectAll}
                    >
                        <Text style={styles.selectAllText}>
                            {selectedKidIds.size === userKids.length ? '☑ Deselect All' : '☐ Select All'}
                        </Text>
                    </TouchableOpacity>

                    {selectedKidIds.size > 0 && (
                        <Text style={styles.selectedCount}>
                            {selectedKidIds.size} selected
                        </Text>
                    )}
                </View>
            )}

            <FlatList
                data={userKids}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <KidCard
                        key={item.id}
                        kid={item}
                        instructors={instructors.filter(i => item.instructorIds.includes(i.id))}
                        expanded={expandedKidId === item.id}
                        onToggleExpand={() =>
                            setExpandedKidId((prev) => (prev === item.id ? null : item.id))
                        }
                        updateKid={updateKid}
                        isSelected={selectedKidIds.has(item.id)}
                        onToggleSelect={() => toggleKidSelection(item.id)}
                    />
                )}
                contentContainerStyle={{ paddingBottom: selectedKidIds.size > 0 ? 100 : 20 }}
                
            />
            

            <CreateKid
                visible={createModalVisible}
                raisinId={user.id}
                onClose={() => setCreateModalVisible(false)}
                onCreate={handleCreateKid}
            />

            {/* Floating Action Buttons - Only show when kids are selected */}
            {selectedKidIds.size > 0 && (
                <View style={styles.floatingActions}>
                    {canSignIn > 0 && (
                        <TouchableOpacity
                            style={[styles.floatingButton, styles.signInButton]}
                            onPress={() => handleBatchSignInOut('signIn')}
                        >
                            <Text style={styles.floatingButtonText}>
                                ✓ Sign In ({canSignIn})
                            </Text>
                        </TouchableOpacity>
                    )}
                    
                    {canSignOut > 0 && (
                        <TouchableOpacity
                            style={[styles.floatingButton, styles.signOutButton]}
                            onPress={() => handleBatchSignInOut('signOut')}
                        >
                            <Text style={styles.floatingButtonText}>
                                ✕ Sign Out ({canSignOut})
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            )}

            <View style={styles.tabBar}>
                <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setCreateModalVisible(true)}
                    >
                        <Text style={styles.addButtonText}>＋ Add Child</Text>
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
    
    selectionControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    selectAllButton: {
        padding: 8,
    },
    selectAllText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    selectedCount: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
    },
    
    addButton: {
        padding: 8,
        backgroundColor: '#e1bee7',
        borderRadius: 10,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    
    floatingActions: {
        position: 'absolute',
        bottom: 70,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 10,
    },
    floatingButton: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    signInButton: {
        backgroundColor: '#4caf50',
    },
    signOutButton: {
        backgroundColor: '#f44336',
    },
    floatingButtonText: {
        color: 'white',
        fontSize: 16,
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