import { View, Text, Button, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useCurrentUser } from '@/hooks/useCurrentUser';

export default function HomeScreen() {
    const { user, switchToRaisin, switchToInstructor, clearUser } = useCurrentUser();

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Login As:</Text>

        <Button title="Raisin (Parent)" onPress={switchToRaisin} />
        <Button title="Instructor (Teacher)" onPress={switchToInstructor} />

        {user && (
            <>
            <Text style={styles.userInfo}>
                Logged in as {user.firstName} ({user.role})
            </Text>
            <Button title="Clear User" onPress={clearUser} />
            </>
        )}

        <Link href="/raisin" asChild>
            <Button title="Raisin View" />
        </Link>

        <Link href="/instructor" asChild>
            <Button title="Instructor View" />
        </Link>
        </View>
    );
    }


    const styles = StyleSheet.create({
        container: { flex: 1, padding: 20, justifyContent: 'center' },
        title: { fontSize: 24, marginBottom: 20, fontWeight: 'bold' },
        userInfo: { marginTop: 20, fontSize: 16, fontStyle: 'italic' },
    });