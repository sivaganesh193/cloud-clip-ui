import React, { useContext } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import { useNavigation } from 'expo-router';
import { addDoc, collection, doc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebaseConfig';
import { AuthContext } from '@/auth/AuthContext';

const sharedData = [
  { id: '1', title: 'Shared Link 1', expiresIn: '2 hours' },
  { id: '2', title: 'Shared Link 2', expiresIn: '1 day' },
  { id: '3', title: 'Shared Link 3', expiresIn: '3 days' },
  { id: '4', title: 'Shared Link 4', expiresIn: '5 hours' },
  { id: '5', title: 'Shared Link 5', expiresIn: '12 hours' },
];

export default function SharedLinks() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const navigation = useNavigation();

  interface Device {
    userId: string;
    deviceName: string;
    os: string;
  }

  // Function to create a new device
  const createDevice = async (device: Device): Promise<void> => {
    try {
      const devicesRef = collection(db, 'devices');
      const docRef = await addDoc(devicesRef, {
        ...device,
        createdAt: Timestamp.now(),
        updateAt: Timestamp.now()
      });
      console.log(`Device with ID ${docRef.id} created successfully`);
    } catch (error) {
      console.error('Error creating device: ', error);
    }
  };

  // Example usage
  const newDevice: Device = {
    userId: 'sQPBzrUgnzgY7MAo3aRr',
    deviceName: "Asus ROG",
    os: 'Windows 11'
  };

  const handleShare = (title: string) => {
    console.log(`Share link: ${title}`);
    createDevice(newDevice);
  };

  const {user}=useContext(AuthContext);

  return (
    <SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
      <Header navigation={navigation} />
      <ThemedView style={styles.containerDark}>
        <ThemedText type="title" style={styles.heading}>
          Paste your text here and click on Share to easily share text with friends!
        </ThemedText>

        <TextInput
          style={isDarkMode ? styles.inputDark : styles.inputLight}
          placeholder="Enter text to share"
          placeholderTextColor={isDarkMode ? '#999' : '#999'}
          value={"Hi hello world~!"}
        />

        <TouchableOpacity
          style={styles.shareButton}
        >
          <Ionicons name="share-outline" size={24} color="white" />
          <ThemedText type="default" style={styles.shareButtonText}>
            Share
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {user && (
        <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
          <ThemedText type="subtitle" lightColor='black' darkColor='black'>Recent Shared Links: </ThemedText>
          <Text>{'\n'}</Text>
          <FlatList
            data={sharedData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={isDarkMode ? styles.itemContainerLight : styles.itemContainerLight}>
                <View>
                  <Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{item.title}</Text>
                  <Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Expires in: {item.expiresIn}</Text>
                </View>
                <TouchableOpacity onPress={() => handleShare(item.title)}>
                  <Ionicons name="share-outline" size={24} color={'black'} />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContent}
          />
        </ThemedView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaLight: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  safeAreaDark: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  containerLight: {
    // flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    // borderRadius: 16,
  },
  containerDark: {
    // flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    // borderRadius: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  itemContainerLight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    elevation: 2,
  },
  itemContainerDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  itemTitleLight: {
    fontSize: 18,
    color: '#000',
  },
  itemTitleDark: {
    fontSize: 18,
    color: '#000',
  },
  itemExpiryLight: {
    fontSize: 14,
    color: '#aaa',
  },
  itemExpiryDark: {
    fontSize: 14,
    color: '#aaa',
  },
  heading: {
    marginBottom: 16,
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
  },
  inputLight: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    color: '#000',
    marginBottom: 16,
  },
  inputDark: {
    height: 40,
    borderColor: '#000',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    color: '#fff',
    marginBottom: 16,
  },
  shareButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 5,
    width: 200,
    alignSelf: 'center',
    borderRadius: 8,
    backgroundColor: 'black',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    // fontWeight: 'bold',
    marginLeft: 8,
  },
});
