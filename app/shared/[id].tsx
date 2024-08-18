import { useLocalSearchParams, useNavigation } from 'expo-router';
import { SafeAreaView, Text, StyleSheet, Platform, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { fetchSharedLink } from '@/service/firebaseService';
import { setClipboard } from '@/service/clipboardService';
import Alert from '@/components/Alert';

export default function Page() {
  // Get the route parameters
  const id: any = useLocalSearchParams();
  const navigation = useNavigation();
  const [data, setData] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState('');

  const showAlert = (message: string) => {
		setAlertMessage(message);
		setAlertVisible(true);
		setTimeout(() => setAlertVisible(false), 3000); // Dismiss alert after 3 seconds
	};

  const handleCopy = (text: string) => {
		setClipboard(text, showAlert, "Copied to clipboard"); // Pass the showAlert function
	};

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });

    // Fetch data from Firestore
    const fetchData = async () => {
      if (id) {
        try {
          const sharedLink = await fetchSharedLink(id.id);
          if (sharedLink) {
            setData(sharedLink.content || "");
          }
          else {
            showAlert('Link has expired or does not exist');            
          }
        } catch (error) {
          console.error('Error fetching document: ', error);
        }
      }
    };

    fetchData();
  }, []);
  return (
    <SafeAreaView style={styles.safeAreaLight}>
			<Alert message={alertMessage} visible={alertVisible} />
      <Header navigation={navigation} />
      <ThemedView style={styles.container}>
        <View style={styles.headerWithButton}>
          <ThemedText type="subtitle" style={styles.text}>Your Text</ThemedText>
          <TouchableOpacity style={[styles.copyButton, { marginLeft: 10 }]} onPress={() => handleCopy(data || '')}>
            <Ionicons name="clipboard-outline" size={24} color={'black'} />
            {Platform.OS === 'web' && (
              <Text style={[styles.copyButtonText, { color: 'black' }]}> Copy Text</Text>
            )}
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.textBox}>
            <TextInput
              style={[styles.text, styles.textInput]}
              value={data}
              onChangeText={setData}
              multiline={true}
              editable={false}
            />
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>);


}

const styles = StyleSheet.create({
  safeAreaLight: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'web' ? 0 : 18,
  },
  scrollContainer: {

  },
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1
  },
  headerWithButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 5,
  },
  copyButtonText: {
    marginLeft: 5,
    fontWeight: 'bold',
  },
  text: {
    color: '#000'
  },
  textBox: {
    flex: 1,
    borderWidth: 1,         // Thickness of the border
    borderColor: '#000',    // Color of the border
    borderRadius: 0         // Optional: Rounds the corners of the border
  },
  textInput: {
    minHeight: 180, // Ensures a minimum height but allows for expansion
    flex: 1, // Ensures the TextInput takes the full height and width of the container
    textAlignVertical: 'top', // Aligns text at the top if multiline
    padding: 10, // Removes default padding to match the ThemedText style
  },
});

