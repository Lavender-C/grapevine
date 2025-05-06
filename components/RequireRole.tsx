import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useCurrentUser } from '@/hooks/useCurrentUser';

type RequireRoleProps = {
    role: 'raisin' | 'instructor';
    children: React.ReactNode;
    };

    export default function RequireRole({ role, children }: RequireRoleProps) {
    const { user } = useCurrentUser();

    if (user === null) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" />
            <Text>Loading user...</Text>
        </View>
        );
    }

    if (user.role !== role) {
        return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>You do not have access to this page.</Text>
        </View>
        );
    }

    return <>{children}</>;
}
