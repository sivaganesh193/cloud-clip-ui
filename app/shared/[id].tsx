import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Header from '@/components/Header';

type RouteParams = {
  id: string;
  linkCode: string; // Ensure this matches the parameter name used in routing
};

const SharedLinkScreen: React.FC = () => {
  const route = useRoute();
  const { id, linkCode } = route.params as RouteParams; // Ensure route.params matches your type
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.safeArea}>
      <Header navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    overflow: 'scroll'
  },

});

export default SharedLinkScreen;
