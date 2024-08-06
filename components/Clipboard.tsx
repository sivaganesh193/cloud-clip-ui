import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Alert, Platform, Clipboard, LogBox } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Ionicons } from '@expo/vector-icons';

const ClipboardScreen = () => {
    // Sample data for the last 10 clipboard entries
    const [clipboardEntries, setClipboardEntries] = React.useState([
        "First copied item",
        "Second copied item",
        "Windows has consistently strived to balance innovation with stability, making it a preferred choice for many users around the world. Whether it’s for gaming, productivity, or everyday tasks, the adaptability and wide compatibility of Windows continue to solidify its position as a leading operating system in the industry.",
        "Fourth copied item",
        "Fifth copied item",
        "Sixth copied item",
        "Seventh copied item",
        "Eighth copied item",
        "Ninth copied item",
        "Tenth copied item",
        "Eleventh copied item" // This will be trimmed to keep only the last 10 items
    ]);

    const last10Entries = clipboardEntries.slice(-10);

    const handleCopy = (text: string | undefined) => {
        if (Platform.OS === 'web') {
            console.log("Running on Web");
            window.alert(`Copied to Clipboard: ${text}`);
        } else {
            console.log("Running on Mobile");
            Clipboard.setString(text || '');
            Alert.alert('Copied to Clipboard', text);
        }
    };


    return (
        <ThemedView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {last10Entries.map((entry, index) => (
                    <View key={index} style={styles.entryContainer}>
                        <ThemedText type="default" style={styles.clipboardText}>
                            {entry}
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.copyButton}
                            onPress={() => handleCopy(entry)}
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
