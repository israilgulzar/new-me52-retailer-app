import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

type QRCodeViewProps = {
    data: string;
    header: string;
    size?: number;
};

const QRCodeView: React.FC<QRCodeViewProps> = ({ data, header, size = 200 }) => {
    if (!data) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>
                {header || "Scan QR to activate Customer App"}
            </Text>
            <QRCode value={data} size={size} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    header: {
        marginBottom: 20
    }
});

export default QRCodeView;
