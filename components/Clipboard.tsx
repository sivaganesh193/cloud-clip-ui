import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { setClipboard } from '@/service/clipboardService';
import { Clipboard } from '@/service/models';

interface ClipboardScreenProps {
    clipboardEntries: Clipboard[];
}

const ClipboardScreen: React.FC<ClipboardScreenProps> = ({ clipboardEntries }) => {

    // Function to handle copy action
    const handleCopy = (text: string) => {
        setClipboard(text);
    };

    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {clipboardEntries.map((entry, index) => (
                    <View key={index} style={styles.entryContainer}>
                        <ThemedText type="default" style={styles.clipboardText}>
                            {entry.content}
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => handleCopy(entry.content)}
                        >
                            <Ionicons name="clipboard-outline" size={16} color={'black'} />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
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
    },
    clipboardText: {
        fontSize: 12,
        lineHeight: 16,
        flex: 1,
        color: '#000'
    },
    copyButton: {
        marginLeft: 10,
    },
});

export default ClipboardScreen;
