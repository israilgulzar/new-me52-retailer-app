import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import DropDownPicker, { ValueType } from 'react-native-dropdown-picker';
import { Country, State, City } from 'country-state-city';
import { useTheme } from '../theme/ThemeProvider';
import { borderRadius, boxShadow } from '../styles/styles';
import CaretDown from "../assets/caret-down.svg"
import CaretUp from "../assets/caret-up.svg"
import { scaleSM } from '../utility/helpers';
import { Controller } from 'react-hook-form';
interface StatePickerProps {
	control?: any;
	value?: string
	error?: string
	name?: string
	style?: ViewStyle
	readonly?: boolean
	parentValue: string
	rules?: any;
	defaultValue?: any;
	onChangeText?: (text: any, key: string) => void
}

const StatePicker = ({ error, onChangeText, value, readonly, parentValue, control,
	name,
	rules,
	defaultValue, }: StatePickerProps) => {

	const [states, setStates] = useState([{ label: 'Gujarat', value: 'GJ' }] as any);
	const [selectedState, setSelectedState] = useState<any>('GJ');
	const [openState, setOpenState] = useState(false);
	const { colors, theme } = useTheme()

	useEffect(() => {
		if (parentValue) {
			const allStates = State.getStatesOfCountry(parentValue as string).map((s) => ({
				label: s.name,
				value: s.isoCode,
			}));
			// console.log('ME52RETAILERTESTING', "All state ", allStates)
			setStates(allStates && allStates.length !== 0 ? allStates : [{ label: 'No State', value: undefined, disabled: true }]);
			if (value && typeof value == "string") {
				setSelectedState((value).toUpperCase())
			}
		}
	}, [parentValue])

	const loadState = (selectedCount: string) => {
		if (!selectedCount) {
			setStates([{
				label: 'Select Country',
				value: undefined,
				disabled: true
			}])
			return false
		}
		console.log('ME52RETAILERTESTING', "country ", selectedCount)
		const allStates = State.getStatesOfCountry(selectedCount as string).map((s) => ({
			label: s.name,
			value: s.isoCode,
		}));
		console.log('ME52RETAILERTESTING allStates', allStates)
		setStates(allStates && allStates.length !== 0 ? allStates : [{ label: 'No State', value: undefined, disabled: true }]);
		// onChangeText(allStates && allStates.length !== 0 ? null : 'no_state', 'state');
	}

	return (control && name) ?
		(<Controller
			control={control}
			name={name}
			defaultValue={defaultValue || ''}
			rules={rules}
			render={({ field: { onChange, value } }) => (
				<View style={[styles.container]}>
					<DropDownPicker
						open={openState}
						setOpen={setOpenState}
						value={value}
						setValue={setSelectedState}
						items={states}
						placeholder="Select state"
						placeholderStyle={{ color: colors.textDarker }}
						zIndex={2000}
						zIndexInverse={2000}
						listMode="MODAL"
						searchable
						disabled={readonly}
						searchPlaceholder="Search State"
						onOpen={() => loadState(parentValue)}
						onChangeValue={(val) => {
							if (val !== value) {
								onChange(val);
							}
						}}
						ArrowDownIconComponent={() => <CaretDown />}
						ArrowUpIconComponent={() => <CaretUp />}
						modalProps={{
							animationType: 'slide',
							presentationStyle: 'pageSheet',
						}}
						modalContentContainerStyle={{
							backgroundColor: '#fff',
							borderWidth: 0,
							marginHorizontal: scaleSM(20),
							borderTopLeftRadius: 20,
							borderTopRightRadius: 20,
							flexGrow: 1,
							overflow: 'hidden',
						}}
						searchContainerStyle={{
							borderBottomWidth: 0,
							marginTop: scaleSM(15),
							padding: 0,
						}}
						searchTextInputStyle={[
							boxShadow,
							{
								borderWidth: 0,
								backgroundColor: '#fff',
								paddingHorizontal: scaleSM(15),
								paddingVertical: scaleSM(5),
								marginHorizontal: scaleSM(5),
							},
						]}
						arrowIconContainerStyle={{ marginRight: 20 }}
						style={[
							{
								backgroundColor: theme === 'dark' ? '#232323' : '#FFF',
								borderColor: error ? colors.error : '#ccc',
								borderWidth: error ? 1 : 0,
							},
							boxShadow,
							borderRadius,
						]}
					/>
					{error && <Text style={{ color: colors.error, marginTop: 4 }}>{error}</Text>}
				</View>
			)}
		/>
		) : (
			<View style={[styles.container]}>
				<DropDownPicker
					open={openState}
					setOpen={setOpenState}
					value={selectedState}
					setValue={setSelectedState}
					items={states}
					placeholder="Select state"
					placeholderStyle={{ color: colors.textDarker }}
					zIndex={2000}
					zIndexInverse={2000}
					listMode='MODAL'
					searchable
					disabled={readonly}
					searchPlaceholder='Search State'
					onOpen={() => loadState(parentValue as string)}
					modalProps={{
						animationType: 'slide',
						presentationStyle: 'pageSheet'
					}}
					modalContentContainerStyle={{
						backgroundColor: "#fff",
						borderWidth: 0,
						marginHorizontal: scaleSM(20),
						borderTopLeftRadius: 20,
						borderTopRightRadius: 20,
						flexGrow: 1,
						overflow: "hidden"
					}}
					searchContainerStyle={[{ borderBottomWidth: 0, marginTop: scaleSM(15), padding: 0 }]}
					searchTextInputStyle={[boxShadow, { borderWidth: 0, backgroundColor: "#fff", paddingHorizontal: scaleSM(15), paddingVertical: scaleSM(5), marginHorizontal: scaleSM(5) }]}
					onChangeValue={(e) => {
						if (e != value) {
							onChangeText(e, 'state')
						}
					}}
					ArrowDownIconComponent={() => (
						<CaretDown />
					)}
					ArrowUpIconComponent={() => (
						<CaretUp />
					)}
					arrowIconContainerStyle={{
						marginRight: 20,
					}}
					style={[{
						backgroundColor: theme == 'dark' ? '#232323' : '#FFF',
						borderColor: error && colors.error,
						// shadowColor: theme === 'dark' ? colors.primary : undefined,
						borderWidth: error ? 1 : 0,
						// marginBottom: 10
					}, boxShadow, borderRadius]}
				/>
				{error && <Text style={[{ color: colors.error }]}>{error}</Text>}
			</View>
		);
};

const styles = StyleSheet.create({
	container: {
		zIndex: 100,
		// marginBottom: 20
		// minHeight: 100
	},
	label: {
		fontSize: 15,
		marginBottom: 6,
		fontWeight: '600',
	},
	codeText: {
		marginTop: 20,
		fontSize: 16,
		fontWeight: '600',
	},
});

export default React.memo(StatePicker);
