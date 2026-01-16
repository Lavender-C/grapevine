import React, { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import uuid from 'react-native-uuid';
import { Kid } from '@/types/kid';

type Props = {
    visible: boolean;
    raisinId: string;
    onClose: () => void;
    onCreate: (kid: Kid) => void;
};

export default function CreateKidModal({
    visible,
    raisinId,
    onClose,
    onCreate,
}: Props) {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        prefName: '',
        pronouns: '',
        sex: '',
        dob: '',
        age: '',
        grade: '',
        notes: '',
    });

    const handleCreate = () => {
        // Validation: ensure required fields are filled
        if (!form.firstName || !form.lastName || !form.age || !form.grade) {
            alert('Please fill in all required fields: First Name, Last Name, Age, and Grade');
            return;
        }

        const newKid: Kid = {
            id: uuid.v4() as string,
            firstName: form.firstName,
            lastName: form.lastName,
            prefName: form.prefName || form.firstName, // Use first name if no preferred name
            pronouns: form.pronouns,
            sex: form.sex,
            dob: new Date(form.dob || Date.now()), // Default to today if no DOB provided
            age: parseInt(form.age),
            grade: parseInt(form.grade),
            notes: form.notes || undefined,
            signedIn: false,
            logs: [],
            raisinIds: [raisinId],
            instructorIds: [],
            status: 'pending',
        };

        onCreate(newKid);
        onClose();
        
        // Reset form
        setForm({
            firstName: '',
            lastName: '',
            prefName: '',
            pronouns: '',
            sex: '',
            dob: '',
            age: '',
            grade: '',
            notes: '',
        });
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <ScrollView style={styles.container}>
                <View style={styles.content}>
                    <Text style={styles.title}>Add Child</Text>
                    <Text style={styles.subtitle}>
                        Create a profile for your child. A teacher will need to add them to their class.
                    </Text>

                    {/* Required Fields */}
                    <Text style={styles.sectionLabel}>Required Information</Text>
                    
                    <TextInput
                        placeholder="First Name *"
                        value={form.firstName}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, firstName: text }))}
                        style={styles.input}
                    />
                    
                    <TextInput
                        placeholder="Last Name *"
                        value={form.lastName}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, lastName: text }))}
                        style={styles.input}
                    />
                    
                    <TextInput
                        placeholder="Age *"
                        value={form.age}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, age: text }))}
                        keyboardType="numeric"
                        style={styles.input}
                    />
                    
                    <TextInput
                        placeholder="Grade *"
                        value={form.grade}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, grade: text }))}
                        keyboardType="numeric"
                        style={styles.input}
                    />

                    {/* Optional Fields */}
                    <Text style={styles.sectionLabel}>Optional Information</Text>
                    
                    <TextInput
                        placeholder="Preferred Name (optional)"
                        value={form.prefName}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, prefName: text }))}
                        style={styles.input}
                    />
                    
                    <TextInput
                        placeholder="Pronouns (optional)"
                        value={form.pronouns}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, pronouns: text }))}
                        style={styles.input}
                    />
                    
                    <TextInput
                        placeholder="Sex (optional)"
                        value={form.sex}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, sex: text }))}
                        style={styles.input}
                    />
                    
                    <TextInput
                        placeholder="Date of Birth (YYYY-MM-DD) (optional)"
                        value={form.dob}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, dob: text }))}
                        style={styles.input}
                    />
                    
                    <TextInput
                        placeholder="Notes (allergies, special needs, etc.) (optional)"
                        value={form.notes}
                        onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
                        multiline
                        numberOfLines={3}
                        style={[styles.input, styles.textArea]}
                    />

                    <View style={styles.buttonContainer}>
                        <View style={styles.button}>
                            <Button title="Create Profile" onPress={handleCreate} color="#4caf50" />
                        </View>
                        <View style={styles.button}>
                            <Button title="Cancel" onPress={onClose} color="gray" />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5',
    },
    content: {
        padding: 20,
        paddingTop: 40,
    },
    title: { 
        fontSize: 26, 
        fontWeight: 'bold', 
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 10,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        backgroundColor: 'white',
        fontSize: 16,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 20,
        gap: 10,
    },
    button: {
        marginBottom: 10,
    },
});