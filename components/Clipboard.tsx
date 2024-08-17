import React, { useContext, useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { handleShare, setClipboard } from '@/service/clipboardService';
import { Clipboard } from '@/service/models';
import { deleteClipboardEntry } from '@/service/firebaseService';
import { truncateContent } from '@/service/util';
import { AuthContext } from '@/auth/AuthContext';
import NoItemsComponent from './NoItems';

interface ClipboardScreenProps {
    clipboardEntries: Clipboard[];
    refreshData: () => void; // Update the type to be a function that returns void
    showAlert: (message: string) => void
}

const ClipboardScreen: React.FC<ClipboardScreenProps> = ({ clipboardEntries, refreshData, showAlert }) => {

    // Function to handle copy action
    const handleDelete = (id: string) => {
        deleteClipboardEntry(id).then(async () => {
            try {
                refreshData();
                showAlert('Deleted clipboard entry');
            } catch (error) {
                showAlert('Failed to delete clipboard entry');
            }
        });
    };

    const authContext = useContext(AuthContext); // Get AuthContext
    if (!authContext) {
        // Handle the case where AuthContext is undefined
        throw new Error("AuthContext must be used within an AuthProvider");
    }
    const { user } = authContext; // Use AuthContext to get the user

    return (
        <ThemedView style={styles.container}>
            {clipboardEntries.length > 0 ? (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    {clipboardEntries.map((entry, index) => (
                        <View key={entry.id} style={styles.entryContainer}>
                            <View style={styles.textContainer}>
                                <ThemedText type='default' style={styles.clipboardText}>
                                    {truncateContent(entry.content)}
                                </ThemedText>
                                <ThemedText type='default' style={styles.clipboardDevice}>
                                    Content Length: {entry.content.length}
                                </ThemedText>
                                <ThemedText type='default' style={styles.clipboardDevice}>
                                    Device: {entry.deviceName || 'Unknown Device'}
                                </ThemedText>
                            </View>
                            <View style={styles.iconContainer}>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => handleDelete(entry.id || '')}
                                >
                                    <Ionicons name="trash-outline" size={20} color={'black'} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.iconButton}
                                    onPress={() => handleShare(entry.content, user, entry.deviceId, entry.deviceName, showAlert)}
                                >
                                    <Ionicons name="share-outline" size={20} color={'black'} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <NoItemsComponent></NoItemsComponent>
            )}
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        marginTop: 16,
        borderColor: 'black',
        borderWidth: 1,
        height: 300,
        padding: 10,
    },
    scrollContainer: {
        padding: 10,
    },
    entryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#f0f0f0',
        shadowOffset: { height: 2, width: 2 },
        shadowColor: '#000',
        shadowOpacity: 0.1,
        gap: 10
    },
    clipboardText: {
        fontSize: 14,
        lineHeight: 16,
        flex: 1,
        color: '#000',
        fontWeight: 500
    },
    clipboardDevice: {
        fontSize: 12,
        lineHeight: 16,
        flex: 1,
        color: 'darkslategrey'
    },
    copyButton: {
        marginLeft: 10,
    },
    textContainer: {
        flex: 1, // Ensure text takes up remaining space
    },
    iconContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        marginLeft: 10,
    },
});

export default ClipboardScreen;
