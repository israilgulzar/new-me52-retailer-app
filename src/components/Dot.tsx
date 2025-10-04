import { StyleSheet, View } from "react-native"

interface DotProps {
    color?: string
}

const Dot = ({color}: DotProps) => {
    return (
        <View style={[{backgroundColor: color ?? "#FFA850"}, styles.cricle]}></View>
    )
}

const styles = StyleSheet.create({
    cricle: {
        width: 8,
        height: 8,
        borderRadius: 50,
        marginTop: 5,
    }
})

export default Dot

