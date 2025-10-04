import { Modal, StyleSheet, Text, View } from "react-native"
import Alert from "../assets/fe--warning 1.svg"
import Success from "../assets/success.svg"
import Button from "./Button"
import { useTheme } from "../theme/ThemeProvider"
import React from "react"
interface ModalME52Props {
    type: "delete" | "success",
    message: string,
    name?: string,
    onClose: () => void,
    onSuccess: (data: any) => void
    visible: boolean,
    data: {
        category: string,
        item: any
    }
}

const ModalME52 = ({type, message, name, onClose, onSuccess, visible, data}: ModalME52Props) => {
    
    const { colors } = useTheme()
    
    return (
        <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
            <View style={{flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: 20}}>
                <View style={{backgroundColor: "#fff", justifyContent: 'center', alignItems: 'center', paddingHorizontal: 10, paddingTop: 40, paddingBottom: 20, borderRadius: 16}}>
                    {type === "delete" ? <Alert/> : <Success/>}
                    <View style={{alignItems: 'center', marginVertical: 20}}>
                        <Text style={{color: colors.text, fontSize: 20, fontWeight: 500, marginBottom: 10}}>{type === "delete" ? 'Are You Sure ?' : 'Successful'}</Text>
                        <Text style={{color: colors.textDark}}>{message}</Text>
                    </View>
                    <View style={{flexDirection: 'row'}}>
                        { 
                            type === "delete" ? 
                            (<View style={{flexDirection: 'row', gap: 10}}>
                                <Button variant="outline_darker" onPress={onClose} title="Cancel" style={styles.button} />
                                <Button variant="darker" onPress={() => onSuccess(data)} title={name as string} style={styles.button} /> 
                            </View>) : 
                            <Button variant="darker" onPress={onClose} title="Ok" style={styles.successButton} fullWidth={true}/>
                        }
                    </View>
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    button: {
        width: 140,
        paddingVertical: 5,
        borderRadius: 16
    },
    successButton: {
        paddingVertical: 5,
        borderRadius: 16
    }
})

export default React.memo(ModalME52)