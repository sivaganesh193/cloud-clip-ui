import React from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Header from '@/components/Header';
import { useNavigation } from 'expo-router';

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

  const handleShare = (title: string) => {
    console.log(`Share link: ${title}`);
  };

  return (
    <SafeAreaView style={isDarkMode ? styles.safeAreaDark : styles.safeAreaLight}>
      <Header navigation={navigation} />
      <ThemedView style={isDarkMode ? styles.containerDark : styles.containerLight}>
        <ThemedText type="title" lightColor='black' darkColor='black'>Shared Links: </ThemedText>
        <Text>{'\n'}</Text>
        {/* <ThemedText >{'\n'} </ThemedText> */}
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
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    // borderRadius: 16,
  },
  containerDark: {
    flex: 1,
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
});
