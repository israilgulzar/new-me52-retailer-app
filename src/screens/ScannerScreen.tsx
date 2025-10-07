import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCodeView from './QRCodeView';
import { DOWNLOAD_APK_SCANNER } from "../environment"

export default function ScannerScreen(): React.ReactElement {

  return (
    <View style={styles.container}>
      <QRCodeView header="Scan to download ME52 Customer App" data={DOWNLOAD_APK_SCANNER} />
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',  // Vertical center
    alignItems: 'center',
  }
}); 