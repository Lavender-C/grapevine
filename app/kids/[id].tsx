import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function KidProfileScreen() {
    const { id } = useLocalSearchParams();

    return (
        <View>
        <Text>Kid Profile for ID: {id}</Text>
        </View>
    );
}
