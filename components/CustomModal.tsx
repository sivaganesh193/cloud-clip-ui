// CustomModal.js
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Clipboard, Alert, Linking } from 'react-native';

const CustomModal = ({ visible, onClose, linkCode, sharedLinkURL }) => {
  const handleCopy = () => {
    Clipboard.setString(linkCode);
    Alert.alert('Code copied to clipboard!');
  };

  const handleOpenLink = () => {
    Linking.openURL(sharedLinkURL);
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>Share this link code with your friend: {linkCode}</Text>
          <TouchableOpacity style={styles.button} onPress={handleCopy}>
            <Text style={styles.buttonText}>Copy Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleOpenLink}>
            <Text style={styles.buttonText}>View Link</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  modalText: {
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: 'red',
  },
});

export default CustomModal;
