import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Clipboard, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from '../../firebaseConfig';
import Header from '../../components/Header';
import Description from '@/components/Description';
import { useNavigation } from 'expo-router';
import { AuthContext } from '@/auth/AuthContext'; // Import AuthContext
import ClipboardScreen from '@/components/Clipboard';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export default function Homepage() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const [data, setData] = useState("In the realm of operating systems, Windows has long been a dominant player, offering a broad range of functionalities and user-friendly features that cater to a diverse audience. With its rich graphical user interface, extensive support for software applications, and robust security features, Windows provides a versatile environment for both personal and professional use. Over the years, it has evolved through numerous versions, each bringing enhancements in performance, usability, and integration with modern technologies. From its early days to the latest updates, Windows has consistently strived to balance innovation with stability, making it a preferred choice for many users around the world. Whether it’s for gaming, productivity, or everyday tasks, the adaptability and wide compatibility of Windows continue to solidify its position as a leading operating system in the industry.");
  const [dbData, setDbData] = useState<any[]>([]); // Define the type for the state
  
  const authContext = useContext(AuthContext); // Get AuthContext
  if (!authContext) {
    // Handle the case where AuthContext is undefined
    throw new Error("AuthContext must be used within an AuthProvider");
  }
  const { user } = authContext; // Use AuthContext to get the user
  const navigation = useNavigation();

  const handleCopy = (text: string) => {
    Clipboard.setString(text);
  };

  const [deviceInfo, setDeviceInfo] = useState({
    systemName: '',
    systemVersion: '',
    model: '',
    brand: '',
    uniqueId: '',
    deviceName: '',
});

  useEffect(() => {
    console.log('initial load');
    const fetchData = async () => {
    console.log(Device);
    console.log(Constants);
    
      if (user) {
        try {
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("email", "==", user.email));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
              console.log(`${doc.id} => `, doc.data());
          });
        } catch (error) {
          console.error("Error fetching data: ", error);
        }
      }
      else {
        console.log('not logged in');
      }
    };
    fetchData();
  }, [user]); // Re-fetch data when user changes

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header navigation={navigation} />
      <ThemedView style={styles.centerContainer}>
        {!user ? (
          <Description />
        ) : (
          <>
            <ThemedView style={styles.container}>
            <ThemedText style={styles.title} type="title">Welcome User!</ThemedText>
              <View style={styles.headerWithButton}>
                <ThemedText style={styles.title} type="subtitle">Your latest copied text</ThemedText>
                <TouchableOpacity style={styles.copyButton} onPress={() => handleCopy(data)}>
                  <Ionicons name="clipboard-outline" size={24} color={isDarkMode ? 'black' : 'black'} />
                  <Text style={[styles.copyButtonText, { color: isDarkMode ? 'black' : 'black' }]}> Copy Text</Text>
                </TouchableOpacity>
              </View>
              <ThemedView style={styles.textBox}>
                <ScrollView style={styles.scrollView}>
                  <ThemedText style={styles.title} type="default">{data}</ThemedText>
                </ScrollView>
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.container}>
              <View style={styles.headerWithButton}>
                <ThemedText style={styles.title} type="subtitle">Your Clipboard Entries</ThemedText>
              </View>
              <ClipboardScreen />
            </ThemedView>
          </>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    overflow: 'scroll'
  },
  centerContainer: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden'
  },
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    overflow: 'hidden'
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
  itemExpiryLight: {
    fontSize: 14,
    color: '#666',
  },
  itemExpiryDark: {
    fontSize: 14,
    color: '#aaa',
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
  textBox: {
    backgroundColor: '#fff',
    shadowColor: '#F0F1CF',
    shadowOffset: { width: 4, height: 4 },
    borderColor: '#000',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    height: 200
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
    // marginLeft: 5,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  title: {
    color: '#000'
  }
});
