import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function Account() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const email = 'user@example.com'; // Sample email, replace with actual email

  const handleSave = () => {
    // Implement save functionality here
    console.log('Name:', name);
    console.log('Mobile:', mobile);
    console.log('Email:', email);
  };

  return (
    <SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
      <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
        <ThemedText type="title">Account</ThemedText>

        <View style={styles.fieldContainer}>
          <ThemedText type="subtitle">Email</ThemedText>
          <Text style={isDarkMode ? styles.textDark : styles.textLight}>{email}</Text>
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText type="subtitle">Name</ThemedText>
          <TextInput
            style={isDarkMode ? styles.inputDark : styles.inputLight}
            onChangeText={setName}
            value={name}
            placeholder="Enter your name"
            placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
          />
        </View>

        <View style={styles.fieldContainer}>
          <ThemedText type="subtitle">Mobile</ThemedText>
          <TextInput
            style={isDarkMode ? styles.inputDark : styles.inputLight}
            onChangeText={setMobile}
            value={mobile}
            placeholder="Enter your mobile number"
            placeholderTextColor={isDarkMode ? '#ccc' : '#999'}
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={isDarkMode ? styles.buttonDark : styles.buttonLight}
          onPress={handleSave}
        >
          <Text style={isDarkMode ? styles.buttonTextDark : styles.buttonTextLight}>Save</Text>
        </TouchableOpacity>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaLight: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
  },
  safeAreaDark: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  containerLight: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 16,
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
    borderRadius: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  textLight: {
    fontSize: 16,
    color: '#000',
  },
  textDark: {
    fontSize: 16,
    color: '#fff',
  },
  inputLight: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputDark: {
    height: 40,
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#1e1e1e',
    color: '#fff',
  },
  buttonLight: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
  },
  buttonDark: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#1e90ff',
    alignItems: 'center',
  },
  buttonTextLight: {
    color: '#fff',
    fontSize: 16,
  },
  buttonTextDark: {
    color: '#fff',
    fontSize: 16,
  },
});
