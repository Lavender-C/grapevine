import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import { Kid } from './types/kid';
import { v4 as uuidv4 } from 'uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';

// const mockKids: Kid[] = [
//     {
//         id: uuidv4(),
//         firstName: 'Daniel',
//         lastName: 'Vickers',
//         age: 16,
//         grade: 11,
//         notes: 'N/A',
//         signedIn: false,
//     },
//     {
//         id: uuidv4(),
//         firstName: 'Lavender',
//         lastName: 'Calhoun',
//         age: 23,
//         grade: 17,
//         notes: 'pee pee poo poo',
//         signedIn: true,
//     },
// ];


export default function RaisinScreen() {

    const [kids, setKids] = useState<Kid[]>([]);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        age: '',
        grade: '',
        notes: '',
    });

    useEffect(() => {
        AsyncStorage.getItem('kids').then((data) => {
            if (data) setKids(JSON.parse(data));
        });
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('kids', JSON.stringify(kids));
    }, [kids]);

    const addKid = () => {
        if (!form.firstName || !form.lastName || !form.age || !form.grade) return;

        const newKid: Kid = {

            id: uuidv4(),
            firstName: form.firstName,
            lastName: form.lastName,
            age: parseInt(form.age),
            grade: parseInt(form.grade),
            notes: form.notes || undefined,
            signedIn: false,

        };

        setKids((prev) => [...prev, newKid]);

        setForm({
            firstName: '',
            lastName: '',
            age: '',
            grade: '',
            notes: '',
        });
    };

    const toggleSignIn = (id: string) => {
        setKids((prev) =>
            prev.map((kid) =>
                kid.id === id ? {...kid, signedIn: !kid.signedIn } :kid
            )
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Add a Kid</Text>
            {['firstName', 'lastName', 'age', 'grade', 'notes'].map((field) =>  (
                <TextInput
                    key={field}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                    value={form[field as keyof typeof form]}
                    onChangeText={(text) => setForm({ ...form, [field]: text })}
                    keyboardType={field === 'age' ? 'numeric' : 'default'}
                    style={styles.input}
                    />
                ))}
                <Button title='Add Kid' onPress={addKid} />

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
                    </View>
                )}
            />
        </ScrollView>
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