import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { API_BASE_URL, WS_BASE_URL, DEBUG } from '../utils/apiConfig';

const DebugInfo = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔧 Debug Info</Text>
      <Text style={styles.text}>Environment: {process.env.NODE_ENV || 'undefined'}</Text>
      <Text style={styles.text}>API Base URL: {API_BASE_URL}</Text>
      <Text style={styles.text}>WS Base URL: {WS_BASE_URL}</Text>
      <Text style={styles.text}>Debug Mode: {DEBUG ? 'ON' : 'OFF'}</Text>
      <Text style={styles.text}>__DEV__: {__DEV__ ? 'true' : 'false'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 2,
    fontFamily: 'monospace',
  },
});

export default DebugInfo;
