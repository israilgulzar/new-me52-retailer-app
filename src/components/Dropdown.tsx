import DropDownPicker, {
	ItemType,
	ValueType,
} from 'react-native-dropdown-picker';
import { useTheme } from '../theme/ThemeProvider';
import {
	ActivityIndicator,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from 'react-native';
import React, { useCallback, useState, useEffect } from 'react';
import { getkeys } from '../services/keys';
import { useAuth } from '../context/AuthContext';
import { borderRadius, boxShadow } from '../styles/styles';
import CaretDown from '../assets/caret-down.svg';
import CaretUp from '../assets/caret-up.svg';
import { fetchLedger } from '../services/ledger';
import { scaleSM } from '../utility/helpers';
import images from '../assets/images';
import CrossBox from "../assets/cross2.svg"
import CheckWithoutBorder from "../assets/check-svgrepo-com 1.svg"
import { getHeight, moderateScale } from '../common/constants';
import { commonStyle } from '../theme';
import { Controller } from 'react-hook-form';

interface DropdownProps {
	label?: string;
	error?: string;
	onChangeText?: (value: number) => void;
	onChangeFullText?: (value: string) => void;
	value: ValueType | ValueType[] | null;
	options: ItemType<ValueType>[];
	multiple: true;
	style?: ViewStyle;
	listModal?: 'MODAL' | 'SCROLLVIEW';
	search?: boolean;
	apiDetails?: Record<string, any>;
	readonly?: boolean;
	placeholder?: string;
	rules?: any;
	control?: any;
	name?: string;
}

type API_STATUS = 'LOADING' | 'SUCCESS' | 'ERROR';

const Dropdown = ({
	control,
	name,
	rules,
	label,
	error,
	onChangeText,
	onChangeFullText,
	value,
	options,
	multiple,
	style,
	listModal,
	search,
	apiDetails,
	readonly,
	placeholder,
}: DropdownProps) => {

	const [open, setOpen] = useState(false);
	const [selectedValue, setSelectedValue] = useState(value);
	const [items, setItems] = useState(options);
	const [showFeatures, setShowFeatures] = useState({
		show: false,
		data: [],
	});
	const [apiStatus, setApiStatus] = useState<API_STATUS>('SUCCESS');
	const { colors, theme } = useTheme();
	const { users } = useAuth();

	// Sync selectedValue with value prop
	useEffect(() => {
		setSelectedValue(value);
	}, [value])

	useEffect(() => {
		loadData();
	}, [])

	const loadKeyType = async () => {
		try {

			const response = await getkeys(users.token);
			const keyData = response.data;
			const items = [];

			for (let keyD of keyData) {
				if (keyD.count !== 0) {
					const obj = {
						value: keyD._id,
						label: `${keyD.keytype.name} (${keyD.count})`,
						key: keyD._id,
						metadata: [
							{
								name: 'Location Tracking',
								key: 'location_tracking',
								active: keyD.keytype.location_tracking,
							},
							{
								name: 'SIM Tracking',
								key: 'sim_tracking',
								active: keyD.keytype.sim_tracking
							},
							{
								name: 'Image Notification',
								key: 'image_notification',
								active: keyD.keytype.image_notification,
							},
							{
								name: 'Phone Block',
								key: 'phone_block',
								active: keyD.keytype.phone_block,
							},
							{
								name: 'Video Notification',
								key: 'video_notification',
								active: keyD.keytype.video_notification,
							},
						],
					};
					items.push(obj);
				}
			}

			// If there's a selected value, ensure it's in the items list
			if (selectedValue && !items.find(item => item.value === selectedValue)) {
				// Find the selected item in the original options or create a placeholder
				const selectedItem = options.find(item => item.value === selectedValue);
				if (selectedItem) {
					items.unshift(selectedItem);
				}
			}

			// If there's a selected value, ensure it's in the items list
			if (selectedValue && !items.find(item => item.value === selectedValue)) {
				// Find the selected item in the original options or create a placeholder
				const selectedItem = options.find(item => item.value === selectedValue);
				if (selectedItem) {
					items.unshift(selectedItem);
				}
			}

			setItems(items);
			setApiStatus('SUCCESS');

		} catch (error) {
			console.log('ME52RETAILERTESTING', 'Error while loading keytypes ', error);
			setItems([
				{
					value: undefined,
					label: 'Error occurred',
					disabled: true,
				},
			]);
			setApiStatus('ERROR');
		}
	};

	const loadLedger = async () => {
		try {
			const apiData = {
				pageno: 1,
				pagesize: 10,
				sort: 'name',
				sortDirection: -1,
			};

			const response = await fetchLedger(apiData, users.token);

			if (response && response.success) {
				const items = [];
				for (let ledger of response.data) {
					items.push({
						value: ledger._id,
						label: ledger.name,
					});
				}
				setItems(items);
				setApiStatus('SUCCESS');
			} else {
				setItems([
					{
						value: undefined,
						label: 'No Data',
						disabled: true,
					},
				]);
				setApiStatus('ERROR');
			}
		} catch (error) {
			console.log('ME52RETAILERTESTING', 'Error while loading ledger ', error);
			setItems([
				{
					value: undefined,
					label: 'Error occurred',
					disabled: true,
				},
			]);
			setApiStatus('ERROR');
		}
	};

	const loadData = useCallback(async () => {
		//Call api and load data
		console.log('ME52RETAILERTESTING', 'Api details are here ', apiDetails, ' label ', label);
		try {
			if (apiDetails) {
				setApiStatus('LOADING');
				setShowFeatures(prev => ({ ...prev, show: false }));
				setItems([
					{
						label: 'Loading...',
						value: undefined,
						disabled: true,
					},
				]);
				if (apiDetails.key) {
					switch (apiDetails.key) {
						case 'keytype':
							await loadKeyType();
							break;
						case 'ledger':
							await loadLedger();
							break;
						default:
							break;
					}
				}
			} else {
				// If there's a selected value, ensure it's in the items list
				if (
					selectedValue &&
					!options.find(item => item.value === selectedValue)
				) {
					// Find the selected item in the original options or create a placeholder
					const selectedItem = options.find(
						item => item.value === selectedValue,
					);
					if (selectedItem) {
						options.unshift(selectedItem);
					}
				}
				setItems(options);
			}
		} catch (error) {
			console.log('ME52RETAILERTESTING', 'Error while calling dropdown API ', error);
			setItems([
				{
					value: undefined,
					label: 'Error occurred',
					disabled: true,
				},
			]);
			setApiStatus('ERROR');
		}
	}, []);

	const handleOnChange = (value: any, onChange: (v: any) => void) => {
		console.log("DROPDOWN CHANGE");
		console.log(value as any);
		onChangeText?.(value as any);
		onChangeFullText?.(items?.find(i => i.value == value));
		// ✅ Update RHF form state
		onChange(value);
		// Show features if keytype is selected
		if (apiDetails?.key && apiDetails?.key === 'keyType') {
			const findItem = items.find(val => val.value === value);
			console.log('ME52RETAILERTESTING', 'Found item here ', findItem);
			if (findItem) {
				setShowFeatures(prev => ({
					...prev,
					show: true,
					data: (findItem as any).metadata,
				}));
			} else {
				setShowFeatures(prev => ({ ...prev, show: false, data: [] }));
			}
		} else {
			setShowFeatures(prev => ({ ...prev, show: false, data: [] }));
		}
	};

	const renderListItem = ({ item, label, onPress, disabled, isSelected }: any) => {
		return (
			<TouchableOpacity style={styles.listItemContainer}
				onPress={() => onPress(item)}
				disabled={disabled}
			>
				<View key={item.value}
					style={styles.listContainer}
				>
					<Text style={{ color: '#222', fontSize: 16 }}>{label}</Text>
					<Image
						source={images.tickIcon}
						style={{ width: moderateScale(24), height: moderateScale(24), }}
						tintColor={isSelected ? colors.text : colors.white}
					/>
				</View>
				<View>
					<View style={[styles.expandedDetails, { paddingHorizontal: moderateScale(15), paddingVertical: moderateScale(10), }]}>
						{item?.metadata?.map((feature: any) => (
							<View style={[styles.featureHeader]} key={feature.label}>
								{feature.active ? (
									<View style={{ borderWidth: moderateScale(0.8), borderRadius: moderateScale(5), borderColor: "#F39314", height: moderateScale(20), backgroundColor: "#F3931454" }}>
										<CheckWithoutBorder />
									</View>
								) : (
									<CrossBox />
								)}
								<Text key={feature.label} style={[{ color: feature.active ? "#F39314" : "#8F999E" }, styles.featureText]}>
									{feature.name}
								</Text>
							</View>
						))}
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	return (control && name) ?
		(
			<Controller
				control={control}
				name={name}
				rules={rules}
				render={({ field: { onChange, value }, fieldState: { error: fieldError } }) => (

					<View style={[style, styles.container]}>
						{label && (
							<Text style={[styles.label, { color: colors.text }]}>{label}</Text>
						)}
						<DropDownPicker
							items={items}
							setItems={setItems}
							value={value}
							placeholder={placeholder}
							placeholderStyle={{ color: colors.textDarker }}
							open={open}
							setOpen={setOpen}
							setValue={setSelectedValue}
							zIndex={3001}
							zIndexInverse={1000}
							multiple={multiple}
							listMode={listModal ?? 'SCROLLVIEW'}
							searchable={search}
							searchPlaceholder={`Search ${placeholder}`}
							onChangeValue={(v) => handleOnChange(v, onChange)}
							disabled={readonly}
							ArrowDownIconComponent={() => <CaretDown />}
							ArrowUpIconComponent={() => <CaretUp />}
							arrowIconContainerStyle={{
								marginRight: 20,
							}}
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
							renderListItem={apiDetails?.key == 'keytype' ? renderListItem : undefined}
							searchContainerStyle={[
								{ borderBottomWidth: 0, marginTop: scaleSM(15), padding: 0 },
							]}
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
							ActivityIndicatorComponent={() => <ActivityIndicator size={36} />}
							style={[
								{
									backgroundColor: theme == 'dark' ? '#232323' : '#FFF',
									borderColor: error && colors.error,
									// shadowColor: theme === 'dark' ? colors.primary : undefined,
									borderWidth: error ? 1 : 0,
									height: 51,
									// marginBottom: 10,
									// zIndex: 3000
								},
								boxShadow,
								borderRadius,
							]}
							onOpen={loadData}
							dropDownContainerStyle={[
								{
									position: 'relative',
									top: 2,
									maxHeight: 200,
									backgroundColor: '#fff',
									borderWidth: 0,
								},
								boxShadow,
							]}
						/>
						{error && <Text style={[{ color: colors.error }]}>{error}</Text>}
					</View>
				)}
			/>
		) : (
			<View style={[style, styles.container]}>
				{label && (
					<Text style={[styles.label, { color: colors.text }]}>{label}</Text>
				)}
				<DropDownPicker
					items={items}
					setItems={setItems}
					value={selectedValue as any}
					placeholder={placeholder}
					placeholderStyle={{ color: colors.textDarker }}
					open={open}
					setOpen={setOpen}
					setValue={setSelectedValue}
					zIndex={3001}
					zIndexInverse={1000}
					multiple={multiple}
					listMode={listModal ?? 'SCROLLVIEW'}
					searchable={search}
					searchPlaceholder={`Search ${placeholder}`}
					onChangeValue={e => {
						if (e != value)
							handleOnChange(e, () => { });
					}}
					disabled={readonly}
					ArrowDownIconComponent={() => <CaretDown />}
					ArrowUpIconComponent={() => <CaretUp />}
					arrowIconContainerStyle={{
						marginRight: 20,
					}}
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
					renderListItem={apiDetails?.key == 'keytype' ? renderListItem : undefined}
					searchContainerStyle={[
						{ borderBottomWidth: 0, marginTop: scaleSM(15), padding: 0 },
					]}
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
					ActivityIndicatorComponent={() => <ActivityIndicator size={36} />}
					style={[
						{
							backgroundColor: theme == 'dark' ? '#232323' : '#FFF',
							borderColor: error && colors.error,
							// shadowColor: theme === 'dark' ? colors.primary : undefined,
							borderWidth: error ? 1 : 0,
							height: 51,
							// marginBottom: 10,
							// zIndex: 3000
						},
						boxShadow,
						borderRadius,
					]}
					onOpen={loadData}
					dropDownContainerStyle={[
						{
							position: 'relative',
							top: 2,
							maxHeight: 200,
							backgroundColor: '#fff',
							borderWidth: 0,
						},
						boxShadow,
					]}
				/>
				{error && <Text style={[{ color: colors.error }]}>{error}</Text>}
			</View>
		);
};

const styles = StyleSheet.create({
	label: {
		marginBottom: 6,
		fontWeight: '600',
		fontSize: 15,
	},
	container: {
		zIndex: 3000,
		overflow: 'visible',
		position: 'relative',
	},
	featureHeader: {
		flexDirection: "row",
		marginBottom: moderateScale(12)
	},
	featureText: {
		fontSize: moderateScale(14),
		paddingLeft: moderateScale(10),
	},
	expandedDetails: {
		flexShrink: 1,
		minHeight: getHeight(10),
	},
	listItemContainer: {
		borderBottomWidth: moderateScale(1),
		borderBottomColor: "#E1E1E1",
		...commonStyle.mv5
	},
	listContainer: {
		...commonStyle.rowSpaceBetween,
		...commonStyle.pv10,
	}
});

export default React.memo(Dropdown);
