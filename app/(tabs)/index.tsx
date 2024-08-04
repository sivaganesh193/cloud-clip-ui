import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, FlatList, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { collection, getDocs } from "firebase/firestore"; 
import {db} from '../../firebaseConfig';

export default function Homepage() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [device, setDevice] = useState("ASUS Rog");
  const [data, setData] = useState("windows is best");
  const [user, setUser] = useState("siv19");
  const [dbData, setDbData] = useState<any[]>([]); // Define the type for the state

  const handleShare = (device: string, text: string) => {
    setData(text);
    setDevice(device);
  };

  const handleCopy = (text:string) => {
    Clipboard.setString(text)
  }

  const generateRandomKey = () => Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const arrayData:any[] = [];
        const querySnapshot = await getDocs(collection(db, "devices"));
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if(data.userId == user){
            arrayData.push({
              device: data.name,
              copiedText: data.latestText,
              id: generateRandomKey()
            })
          }
        });
        setDbData(arrayData);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchData();
  }, []);

  console.log(dbData);
  return (
    <SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
      <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
        <ThemedText type="title">Welcome User!</ThemedText>
      </ThemedView>
      <View style={styles.mainClipContainer}>
        <View style={[styles.mainClipContent, isDarkMode ? styles.mainClipContentDark : styles.mainClipContentLight]}>
          <View style={{ flex: 1 }}>
            <Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>{data}</Text>
            <Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>Copied from: {device}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => handleCopy(data)}>
              <Ionicons name="clipboard-outline" size={24} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleCopy(data)}>
              <Ionicons name="share-social-outline" size={24} color={isDarkMode ? 'white' : 'black'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <ThemedText type="subtitle">Your Devices: </ThemedText>
      <FlatList
        data={dbData}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={isDarkMode ? styles.itemContainerDark : styles.itemContainerLight}>
            <View style={styles.itemContent}>
              <Text style={isDarkMode ? styles.itemTitleDark : styles.itemTitleLight}>
                {item.device}
              </Text>
              <Text style={isDarkMode ? styles.itemExpiryDark : styles.itemExpiryLight}>
                Recent Copy: {item.copiedText}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleShare(item.device,item.copiedText)}>
              <Ionicons name={item.device == device ? "checkmark-circle" : "checkmark-circle-outline"} size={24} color={item.device == device ? 'green' : (isDarkMode ? 'white' : 'black')} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
      />
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
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  itemContainerDark: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#1e1e1e',
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
    color: '#fff',
  },
  itemTitleHighlightedLight: {
    fontSize: 18,
    color: '#00796b', // Teal color for highlighted title
  },
  itemTitleHighlightedDark: {
    fontSize: 18,
    color: '#4db6ac', // Light teal color for highlighted title in dark mode
  },
  itemExpiryLight: {
    fontSize: 14,
    color: '#666',
  },
  itemExpiryDark: {
    fontSize: 14,
    color: '#aaa',
  },
  itemExpiryHighlightedLight: {
    fontSize: 14,
    color: '#004d40', // Dark teal color for highlighted expiry text
  },
  itemExpiryHighlightedDark: {
    fontSize: 14,
    color: '#00332c', // Darker teal color for highlighted expiry text in dark mode
  },
  itemContent: {
    flex: 1,
  },
  mainClipContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  mainClipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
  },
  mainClipContentLight: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  mainClipContentDark: {
    backgroundColor: '#1e1e1e',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 10,
  },
});
