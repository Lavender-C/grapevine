import { View, Text, Button } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold' }}> Welcome to Grapevine! </Text>
            <Link href="/raisin" asChild>
                <Button title="Go to Raisin View" />
            </Link>
            <Link href="/instructor" asChild>
                <Button title="Go to Instructor View" />
            </Link>
        </View>
    );
}