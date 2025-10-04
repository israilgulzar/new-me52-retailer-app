import {
	FlatList,
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import Input from './Input';
import React, {
	Dispatch,
	SetStateAction,
	useCallback,
	useEffect,
	useState,
} from 'react';
import PhoneNumber from './PhoneNumber';
import Datepicker from './Date';
import Dropdown from './Dropdown';
import Uploader from './Uploader';
import SignPad from './SignPad';
import BarcodeInput from './BarcodeInput';
import Checkbox from './Checkbox';
import OrderInput from './OrderInput';
import UploadPicker from './UploadPicker';
import { SCREEN_WIDTH } from '../constant';
import TimePicker from './Time';
import { labelStyle } from '../styles/styles';
import CountryPicker from './CountryPicker';
import StatePicker from './StatePicker';
import CityPicker from './CityPicker';
import { isValidIMEI, scaleSM } from '../utility/helpers';
import parsePhoneNumberFromString, { CountryCode } from 'libphonenumber-js';
import TextArea from './TextArea';
import { getHeight, moderateScale } from '../common/constants';
import { commonStyle } from '../theme';

interface FormsI {
	formFields: Array<Record<string, any>>;
	formState: any;
	setFormState: Dispatch<SetStateAction<any>>;
	errors: any;
	setErrors: Dispatch<SetStateAction<any>>;
	styleTwoColumn?: any;
	colors?: any;
	isCheckError?: boolean;
	contentContainerStyle?: any;
	updateFormData?: (data: any) => void;
	shouldHideFields?: boolean
}

const Forms = ({
	formFields,
	formState,
	setFormState,
	errors,
	setErrors,
	colors,
	isCheckError,
	styleTwoColumn,
	contentContainerStyle,
	updateFormData,
	shouldHideFields
}: FormsI) => {
	const [countryStateCity, setCountryStateCity] = useState({
		country: 'IN',
		state: '',
		city: '',
	});
	// const onChangeText = async (event: InputEvent, field: any, key: string | null = null) => {
	//     // console.log('ME52RETAILERTESTING',"Event is here ", event, " formFields ", field, " keys ", key)
	//     // if(field.required){
	//     //     if(!event && key !== 'city' && key !== 'state'){
	//     //         setErrors((prev: any) => ({...prev, [key ? key : field.key]: `${key ? key == "state" ? "State" : key == "city" ? "City" : field.label : field.label} is required`}))
	//     //     }
	//     //     // else if ((key === 'city' && event !== 'no_city') || (key === 'state' && event !== 'no_state') && !event){
	//     //     //     // setErrors((prev: any) => ({...prev, [key ? key : field.key]: `${key ? key == 'state' ? "State" : key == "city" ? "City" : field.label : field.label} is required`}))
	//     //     // }
	//     //     else {
	//     //         setErrors((prev: any) => ({...prev, [key ? key : field.key]: null}))
	//     //     }
	//     // }
	//     setFormState((prev: any) => ({...prev, [key ? key : field.key]: event}))
	// }

	useEffect(() => {
		const countStateCity: Record<string, any> = {};
		formFields.forEach(formF => {
			if (formF.component) {
				formF.component.forEach((ff: any) => {
					if (ff.key === 'country' && ff.value) {
						countStateCity[ff.key] = ff.value;
					} else if (ff.key === 'state' && ff.value) {
						countStateCity[ff.key] = ff.value;
					} else if (ff.key === 'city' && ff.value) {
						console.log(ff);
						countStateCity[ff.key] = ff.value;
					}
				});
			} else {
				if (formF.key === 'country' && formF.value) {
					countStateCity[formF.key] = formF.value;
				}
				if (formF.key === 'state' && formF.value) {
					countStateCity[formF.key] = formF.value;
				}
				if (formF.key === 'city' && formF.value) {
					countStateCity[formF.key] = formF.value;
				}
			}
		});
		if (Object.keys(countStateCity).length !== 0) {
			console.log("countStateCity");
			console.log(countStateCity);
			setCountryStateCity(prev => ({ ...prev, ...countStateCity }));
		}
	}, []);

	const checkErrors = (formField: any, form: any) => {
		if (
			formField.required &&
			formField.type !== 'file' &&
			formField.type !== 'signaturePad' &&
			formField.key !== 'termsAndConditions'
		) {
			if (!form && !Array.isArray(formField.value)) {
				setErrors((prev: any) => ({
					...prev,
					[formField.key]: `${formField.label} is required`,
				}));
			} else {
				setErrors((prev: any) => ({ ...prev, [formField.key]: null }));
			}
		}

		if (["imei1", "imei2", "barcode"].includes(formField.key)) {
			const imeiRegex = /^\d{15}$/;
			// Always get the latest values, using 'form' for the current field
			let imei1 = formFields.find(f => f.key === "imei1")?.value || "";
			let imei2 = formFields.find(f => f.key === "imei2")?.value || "";
			if (formField.key === "imei1") imei1 = form;
			if (formField.key === "imei2") imei2 = form;

			// Validate IMEI 1
			let imei1Error = null;
			if (!imei1) {
				imei1Error = "IMEI 1 is required";
			} else if (!imeiRegex.test(imei1)) {
				imei1Error = "IMEI 1 must be 15 digits";
			}

			// Validate IMEI 2
			let imei2Error = null;
			if (!imei2) {
				imei2Error = "IMEI 2 is required";
			} else if (!imeiRegex.test(imei2)) {
				imei2Error = "IMEI 2 must be 15 digits";
			}

			// Check for duplication only if both are valid
			if (!imei1Error && !imei2Error && imei1 === imei2) {
				imei2Error = "IMEI 1 and IMEI 2 cannot be the same";
			}

			setErrors((prev: any) => ({
				...prev,
				imei1: imei1Error,
				imei2: imei2Error,
			}));
		}
		if (['phoneNumber', 'alternateNumber'].includes(formField.key)) {
			const safeValue = {
				countryCode: formField.value?.countryCode || 'IN',
				phoneNumber: formField.value?.phoneNumber || '',
				alternateCountryCode: formField.value?.alternateCountryCode || 'IN',
				alternateNumber: formField.value?.alternateNumber || '',
			};
			const parseNumber = parsePhoneNumberFromString(
				form,
				formField.key === 'phoneNumber'
					? safeValue.countryCode
					: safeValue.alternateCountryCode,
			);
			let invalid = false;
			if (formField.required && !form) {
				setErrors((prev: any) => ({
					...prev,
					[formField.key]: `${formField.label} is required`,
				}));
				invalid = true;
			} else if (parseNumber && !parseNumber.isValid()) {
				setErrors((prev: any) => ({
					...prev,
					[formField.key]: `${formField.label} is not valid`,
				}));
				invalid = true;
			} else {
				setErrors((prev: any) => ({ ...prev, [formField.key]: null }));
			}

			// Always check both numbers for equality, regardless of which field is being edited
			const phoneNumberField = formFields.find(formF => formF.key === 'phoneNumber');
			const alternatephoneNumberField = formFields.find(formF => formF.key === 'alternateNumber');
			let phoneNumberCountryCode = '';
			let phoneNumber = '';
			let alternateCountryCode = '';
			let alternateNumber = '';
			if (phoneNumberField && alternatephoneNumberField) {
				// Use the latest value for the field being edited, with safe fallback
				if (formField.key === 'phoneNumber') {
					phoneNumberCountryCode = safeValue.countryCode;
					phoneNumber = form;
					alternateCountryCode = alternatephoneNumberField.value?.alternateCountryCode || 'IN';
					alternateNumber = alternatephoneNumberField.value?.alternateNumber || '';
				} else {
					phoneNumberCountryCode = phoneNumberField.value?.countryCode || 'IN';
					phoneNumber = phoneNumberField.value?.phoneNumber || '';
					alternateCountryCode = safeValue.alternateCountryCode;
					alternateNumber = form;
				}
				if (
					phoneNumberCountryCode === alternateCountryCode &&
					phoneNumber && alternateNumber &&
					phoneNumber === alternateNumber
				) {
					setErrors((prev: any) => ({
						...prev,
						alternateNumber: `Phone number and Alternate number cannot be same`,
					}));
				} else {
					setErrors((prev: any) => ({ ...prev, alternateNumber: null }));
				}
			}
			return; // Prevents running further checks for phone fields
		}

		if (formField.key === 'pincode') {
			const pincodeValue = form;
			if (!pincodeValue) {
				setErrors((prev: any) => ({
					...prev,
					pincode: `${formField.label} is required`,
				}));
			} else if (pincodeValue.length !== 6) {
				setErrors((prev: any) => ({
					...prev,
					pincode: `${formField.label} should of 6 digits`,
				}));
			} else {
				setErrors((prev: any) => ({ ...prev, pincode: null }));
			}
		}

		if (
			formField.required &&
			(formField.type === 'file' ||
				formField.key === 'termsAndConditions' ||
				formField.type === 'signaturePad')
		) {
			if (!form) {
				setErrors((prev: any) => ({
					...prev,
					[formField.key]: `${formField.label} is required`,
				}));
			} else {
				setErrors((prev: any) => ({ ...prev, [formField.key]: null }));
			}
		}
	};

	const onChangeText = (
		event: any,
		field: any,
		id: string,
		key: string | null = null,
		parentKey?: string,
		idx?: number,
	) => {
		// update errors
		if (isCheckError) {
			checkErrors(field, event);
		}
		// // if (field.required && !event && !["city", "state"].includes(key as string)) {

		// //     setErrors((prev: any) => ({
		// //         ...prev,
		// //         [key ? key : id]: `${field.label} is required`,
		// //     }));
		// // } else {
		// //     setErrors((prev: any) => ({
		// //         ...prev,
		// //         [id]: null,
		// //     }));
		// // }

		// // if (["phoneNumber", "alternateNumber"].includes(field.key)) {
		// //     const parseNumber = parsePhoneNumberFromString(event, field.key === "phoneNumber" ? field.value.countryCode : field.value.alternateCountryCode)
		// //     const phoneNumberField = formFields.find((formField) => formField.key === "phoneNumber")
		// //     const alternatephoneNumberField = formFields.find((formField) => formField.key === "alternateNumber")

		// //     let invalid = false
		// //     if (parseNumber && !parseNumber.isValid()) {
		// //         setErrors((prev: any) => ({ ...prev, [field.key]: `${field.label} is not valid` }))
		// //         invalid = true
		// //     }
		// //     else {
		// //         setErrors((prev: any) => ({ ...prev, [field.key]: null }))
		// //     }
		// //     if(phoneNumberField && alternatephoneNumberField && !invalid){
		// //         const phoneNumberCountryCode = phoneNumberField.value.countryCode
		// //         const phoneNumber = field.key === "phoneNumber" ? event : phoneNumberField.value.phoneNumber
		// //         const alternateCountryCode = alternatephoneNumberField.value.alternateCountryCode
		// //         const alertnatePhoneNumber = field.key === "alternateNumber" ? event : alternatephoneNumberField.value.alternateNumber

		// //         if(phoneNumberCountryCode == alternateCountryCode && phoneNumber == alertnatePhoneNumber){
		// //             setErrors((prev: any) => ({...prev, "alternateNumber": `Phone number and Alternate number cannot be same`}))
		// //         }else{
		// //             setErrors((prev: any) => ({...prev, "alternateNumber": null}))
		// //         }
		// //     }

		// // }

		// // if (field.key === "pincode") {
		// //     const pincodeValue = event
		// //     if (pincodeValue.length !== 6) {
		// //         setErrors((prev: any) => ({ ...prev, "pincode": `${field.label} should of 6 digits` }))
		// //     } else {
		// //         setErrors((prev: any) => ({ ...prev, "pincode": null }))
		// //     }
		// // }

		// // if(["imei1", "imei2"].includes(field.key)){
		// //     if(!isValidIMEI(event)){
		// //         setErrors((prev: any) => ({...prev, [field.key]: `${field.label} is not valid`}))
		// //     }else{
		// //         setErrors((prev: any) => ({...prev, [field.key]: null}))
		// //     }
		// // }

		//         // update form state
		setFormState((prev: any) => {
			console.log('ME52RETAILERTESTING',
				'Updating form state for id: ',
				id,
				' event: ',
				event,
				' parentKey: ',
				parentKey,
			);
			const index = prev.findIndex((item: any) => item.key === id);
			if (index === -1) {
				const parentIndex = prev.findIndex(
					(compA: any) => compA.key === parentKey,
				);

				if (parentIndex !== -1) {
					const clonePrev = [...prev];
					const parentData = clonePrev[parentIndex];
					if (parentData.component) {
						const childIndex = parentData.component.findIndex(
							(compC: any) => compC.key === id,
						);

						if (childIndex !== -1) {
							setCountryStateCity(prev => ({ ...prev, [id]: event }));
							const childData = [...parentData.component];
							console.log('ME52RETAILERTESTING', 'Child data is here ', childIndex, childData[childIndex]);
							let childDataIndex = childData[childIndex];

							childDataIndex = {
								...childDataIndex,
								value: event,
							};

							childData[childIndex] = { ...childDataIndex };

							parentData.component = [...childData];
							clonePrev[parentIndex] = { ...parentData };
							// Notify parent component about the update
							console.log('ME52RETAILERTESTING', 'Calling updateFormData for child component update:', id, 'parentKey:', parentKey);
							if (id == 'keytype') updateFormData?.(clonePrev);
							return clonePrev;
						}
					}
				}
				console.log('ME52RETAILERTESTING', "Prev value when index -1 ", prev)
				return prev;
			}
			const updated = [...prev];
			let updatedIndex = updated[index];
			//   console.log('ME52RETAILERTESTING',"Updated index data ", updatedIndex, " key ", key, " event ", event)
			if (
				updatedIndex.value &&
				typeof updatedIndex.value === 'object' &&
				!Array.isArray(updatedIndex.value)
			) {
				if (event) {
					const val = { ...updatedIndex.value, [key as string]: event };
					updatedIndex = {
						...updatedIndex,
						value: val,
					};
				} else {
					updatedIndex = {
						...updatedIndex,
						value: event,
					};
				}
			} else if (
				updatedIndex.value &&
				field.no_of_frames &&
				Array.isArray(updatedIndex.value)
			) {
				// console.log('ME52RETAILERTESTING',"Updating value of images")
				if (event) {
					updatedIndex = {
						...updatedIndex,
						value: [event, ...updatedIndex.value],
					};
					setErrors((prev: any) => ({ ...prev, [field.key]: null }));
				} else {
					const tempValue = [...updatedIndex.value];
					tempValue.splice(idx as number, 1);
					if (tempValue.length === 0) {
						setErrors((prev: any) => ({
							...prev,
							[field.key]: `${field.label} is required`,
						}));
					}
					updatedIndex = {
						...updatedIndex,
						value: [...tempValue],
					};
				}
			} else {
				updatedIndex = {
					...updatedIndex,
					value: event,
				};
			}
			// console.log('ME52RETAILERTESTING',
			// 	'Updated index after op ',
			// 	{ ...updatedIndex },
			// 	' value to update ',
			// 	event,
			// );
			updated[index] = { ...updatedIndex };
			console.log('ME52RETAILERTESTING', 'Final form state after update: ', updated);
			console.log('ME52RETAILERTESTING', 'Calling updateFormData for direct field update:', id);
			if (id == 'keytype') updateFormData?.(updated);
			return updated;
		});
	};

	const RenderForm = ({ item, index }: any): any => {
		let formField = item;
		console.log('ME52RETAILERTESTING',
			'Form field in renderForm ',
			formField.key,
			' value: ',
			formField.value,
			' type: ',
			formField.type,
		);
		switch (formField.type) {
			case 'text':
			case 'number':
				return (
					<Input
						key={formField.key}
						value={formField.value}
						maxLength={formField.maxLength}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						placeholder={formField.label}
						error={errors[formField.key]}
						secureTextEntry={false}
						keyboardType={formField.keyboardType || formField.type}
						style={styles.container}
						inputStyle={formField.key === 'address' ? { height: getHeight(100) } : undefined}
						readonly={formField.readonly}
						icon={formField.showIcon}
						formData={formFields}
						autoCapitalize={formField.autoCapitalize}
						autoCorrect={formField.autoCorrect}
					/>
				);
			case 'textArea':
				return (
					<TextArea
						value={formField.value}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						placeholder={formField.label}
						key={formField.key}
						style={styles.container}
						error={errors[formField.key]}
					/>
				);
			case 'phonenumber':
				return (
					<PhoneNumber
						key={formField.key}
						onChangeText={(e, key) =>
							onChangeText(e, formField, formField.key, key)
						}
						error={errors[formField.key]}
						value={{
							countryCode:
								formField.key === 'phoneNumber'
									? formField.value['countryCode']
									: formField.value['alternateCountryCode'],
							phoneNumber:
								formField.key === 'phoneNumber'
									? formField.value['phoneNumber']
									: formField.value['alternateNumber'],
						}}
						placeholder={formField.label}
						name={{
							countryCode:
								formField.key === 'phoneNumber'
									? 'countryCode'
									: 'alternateCountryCode',
							phoneNumber:
								formField.key === 'phoneNumber'
									? 'phoneNumber'
									: 'alternateNumber',
						}}
						// style={{ marginHorizontal: 10 }}
						readonly={formField.readonly}
						maxLength={formField.maxLength}
					/>
				);
				break;
			case 'countrySelection':
				return (
					<CountryPicker
						key={formField.key}
						onChangeText={(e, key) =>
							onChangeText(e, formField, formField.key, key)
						}
						value={formField.value}
						error={errors[formField.key]}
						readonly={formField.readonly}
						style={styles.container}
					/>
				);
				break;

			case 'stateSelection':
				return (
					<StatePicker
						key={formField.key}
						onChangeText={(e, key) =>
							onChangeText(e, formField, formField.key, key)
						}
						value={formField.value}
						error={errors[formField.key]}
						readonly={formField.readonly}
						parentValue={formFields.find(ff => ff.key === 'country')?.value}
						style={styles.container}
					/>
				);
				break;

			case 'citySelection':
				return (
					<CityPicker
						key={formField.key}
						onChangeText={(e, key) =>
							onChangeText(e, formField, formField.key, key)
						}
						value={formField.value}
						error={errors[formField.key]}
						readonly={formField.readonly}
						parentValue={{
							country: formFields.find(ff => ff.key === 'country')?.value,
							state: formFields.find(ff => ff.key === 'state')?.value,
						}}
						style={styles.container}
					/>
				);
				break;

			case 'dropdown':
				console.log('ME52RETAILERTESTING',
					'Rendering dropdown for: ',
					formField.key,
					' with value: ',
					formField.value,
				);
				return (
					<Dropdown
						options={formField.options ? formField.options : []}
						multiple={formField.multiple}
						value={formField.value}
						key={`${formField.key}-${formField.value}`}
						style={styles.container}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						error={errors[formField.key]}
						listModal={formField.listModal}
						search={formField.search}
						apiDetails={formField.apiDetails}
						placeholder={formField.label}
						readonly={formField.readonly}
					/>
				);
				break;

			case 'date':
				return (
					<Datepicker
						value={formField.value}
						error={errors[formField.key]}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						key={formField.key}
						style={styles.container}
						readonly={formField.readonly}
						maxDate={formField.maxDate}
						placeholder={formField.placeholder}
						minDate={formField.minDate}
					/>
				);
				break;

			case 'file':
				return (
					<Uploader
						value={formField.value}
						key={formField.key}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						readonly={formField.readonly}
					/>
				);
				break;
			case 'barcode':
				return (
					<BarcodeInput
						value={formField.value}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						key={formField.key}
						placeholder={formField.label}
						style={styles.container}
						name={formField.name}
						readonly={formField.readonly}
						error={errors[formField.key]}
						iconReadonly={formField.iconReadonly}
					/>
				);
			case 'checkbox':
				return (
					<Checkbox
						key={formField.key}
						value={formField.value}
						label={formField.label}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						readonly={formField.readonly}
						terms={formField.terms}
						border={formField.border}
						error={errors[formField.key]}
					/>
				);
				break;
			case 'signaturePad':
				console.log('ME52RETAILERTESTING',
					'Rendering signaturePad for: ',
					formField.key,
					' with value: ',
					formField.value ? 'has value' : 'no value',
				);
				return (
					<SignPad
						value={formField.value}
						key={formField.key}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						readonly={formField.readonly}
						label={formField.label}
						style={styles.container}
						error={errors[formField.key]}
						name={formField.key}
					/>
				);
				break;
			case 'orderInput':
				return (
					<OrderInput
						readonly={formField.readonly}
						label={formField.label}
						price={formField.price}
						discount={formField.discount}
						value={formField.value}
						key={formField.key}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						features={formField.features}
						index={index}
					/>
				);

			case 'uploadPicker':
				if (formField.multiple && formField.no_of_frames) {
					return (
						<View style={commonStyle.pb10}>
							{formField.label && (
								<Text
									style={[
										labelStyle,
										{ color: colors.textDarker, marginBottom: 0 },
									]}
								>
									{formField.label}
								</Text>
							)}
							<ScrollView
								key={formField.key}
								style={{ flexDirection: 'row', width: SCREEN_WIDTH }}
								horizontal={true}
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ gap: moderateScale(15) }}
							>
								{formField.value &&
									formField.value.length < 10 &&
									Array.from({ length: formField.no_of_frames }).map(
										(no_of_frame: any, index) => {
											return (
												<View style={commonStyle.mv10} key={index}>
													<UploadPicker
														width={formField.width}
														height={formField.height}
														imageOrVideo={formField.imageOrVideo}
														value={null}
														onChangeText={e =>
															onChangeText(e, formField, formField.key)
														}
														readonly={formField.readonly}
														error={errors[formField.key]}
														caption={formField.caption}
														maxSize={formField.maxSize}
													/>
												</View>
											);
										},
									)}
								{formField.value &&
									formField.value.length != 0 &&
									formField.value.map((val: any, index: number) => (
										<View style={commonStyle.mv10} key={index}>
											<UploadPicker
												width={formField.width}
												height={formField.height}
												imageOrVideo={formField.imageOrVideo}
												value={val}
												onChangeText={e =>
													onChangeText(
														e,
														formField,
														formField.key,
														null,
														'',
														index,
													)
												}
												readonly={formField.readonly}
												error={errors[formField.key]}
												caption={formField.caption}
												maxSize={formField.maxSize}
											/>
										</View>
									))}
							</ScrollView>
						</View>
					);
				} else {
					return (
						<UploadPicker
							width={formField.width}
							label={formField.label}
							height={formField.height}
							imageOrVideo={formField.imageOrVideo}
							value={formField.value}
							onChangeText={e => onChangeText(e, formField, formField.key)}
							readonly={formField.readonly}
							error={errors[formField.key]}
							style={styles.container}
							caption={formField.caption}
							maxSize={formField.maxSize}
						/>
					);
				}

			case 'time':
				return (
					<TimePicker
						value={formField.value}
						onChangeText={e => onChangeText(e, formField, formField.key)}
						label={formField.label}
					/>
				);

			case 'twoColumn':
				if (formField.component) {
					const length = formField.component.length;
					return (
						<View
							style={[
								styles.twoColumn,
								// { marginHorizontal: scaleSM(10), marginBottom: scaleSM(20) },
								styleTwoColumn,
								commonStyle.mb10,
							]}
						>
							{formField.component.map((comp: any) => {
								console.log(
									'ME52RETAILERTESTING',
									"Find nested component ",
									comp.key,
									' value: ',
									comp.value,
									' type: ',
									comp.type,
								)
								switch (comp.type) {
									case 'countrySelection':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25]}
												key={comp.key}
											>
												<CountryPicker
													onChangeText={(e, key) =>
														onChangeText(e, comp, comp.key, key, formField.key)
													}
													value={comp.value}
													error={errors[comp.key]}
													readonly={comp.readonly}
												/>
											</View>
										);

									case 'stateSelection':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25]}
												key={comp.key}
											>
												<StatePicker
													onChangeText={(e, key) =>
														onChangeText(e, comp, comp.key, key, formField.key)
													}
													value={comp.value}
													error={errors[comp.key]}
													readonly={comp.readonly}
													parentValue={countryStateCity.country}
												/>
											</View>
										);
										break;
									case 'citySelection':
										return (
											<View
												key={comp.key}
												style={[length === 2 ? styles.width48 : styles.width25]}
											>
												<CityPicker
													onChangeText={(e, key) =>
														onChangeText(e, comp, comp.key, key, formField.key)
													}
													value={comp.value}
													error={errors[comp.key]}
													readonly={comp.readonly}
													parentValue={{
														country: countryStateCity.country,
														state: countryStateCity.state,
													}}
												/>
											</View>
										);
									case 'text':
									case 'number':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25]}
												key={comp.key}
											>
												<Input
													value={comp.value}
													onChangeText={e =>
														onChangeText(e, comp, comp.key, null, formField.key)
													}
													placeholder={comp.label}
													error={errors[comp.key]}
													secureTextEntry={false}
													keyboardType={comp.type}
													readonly={comp.readonly}
												/>
											</View>
										);
									case 'dropdown':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25,
												///dropdown
												shouldHideFields && { width: '48%' }
												]}
												key={comp.key}
											>
												<Dropdown
													options={comp.options ? comp.options : []}
													multiple={comp.multiple}
													value={comp.value}
													onChangeText={e => {
														console.log('====================================');
														console.log("onChangeText>>>>", comp.options);
														console.log('====================================');
														onChangeText(e, comp, comp.key, null, formField.key)
													}}
													onChangeFullText={e => {
														comp.data = e;
														console.log('====================================');
														console.log("onChangeFullText>>>>", e);
														console.log('====================================');
													}}
													style={styles.container}
													error={errors[comp.key]}
													listModal={comp.listModal}
													search={comp.search}
													apiDetails={comp.apiDetails}
													placeholder={comp.label}
													readonly={comp.readonly}
												/>
											</View>
										);
										break;
									case 'date':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25, { marginTop: 5, }]}
												key={comp.key}
											>
												<Datepicker
													value={comp.value}
													error={errors[comp.key]}
													onChangeText={e =>
														onChangeText(e, comp, comp.key, null, formField.key)
													}
													readonly={comp.readonly}
													maxDate={comp.maxDate}
													minDate={comp.minDate}
													placeholder={comp.label}
												/>
											</View>
										);
									case 'file':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25]}
												key={comp.key}
											>
												<UploadPicker
													width={comp.width}
													height={comp.height}
													imageOrVideo={'image'}
													label={comp.label}
													value={comp.value}
													onChangeText={e =>
														onChangeText(e, comp, comp.key, null, formField.key)
													}
													readonly={comp.readonly}
													error={errors[comp.key]}
													caption={comp.caption}
													maxSize={comp.maxSize}
												/>
											</View>
										);

									case 'time':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25, commonStyle.mt5]}
												key={comp.key}
											>
												<TimePicker
													value={comp.value}
													onChangeText={e =>
														onChangeText(e, comp, comp.key, null, formField.key)
													}
													placeholder={comp.label}
												// error={errors[comp.key]}
												/>
											</View>
										);

									case 'textArea':
										return (
											<View
												style={[length === 2 ? styles.width48 : styles.width25]}
												key={comp.key}
											>
												<TextArea
													value={comp.value}
													onChangeText={e => onChangeText(e, comp, comp.key)}
													placeholder={comp.label}
													style={styles.container}
													error={errors[comp.key]}
												/>
											</View>
										);
									default:
										break;
								}
							})}
						</View>
					);
				}
			default:
				break;
		}
	};

	return (
		<View style={{ flex: 1 }}>
			<KeyboardAvoidingView>
				<FlatList
					ListFooterComponentStyle={{ backgroundColor: 'blue' }}
					data={formFields}
					renderItem={RenderForm}
					keyExtractor={item => item.key}
					extraData={formState}
					ListHeaderComponentStyle={{ zIndex: 1000 }}
					contentContainerStyle={contentContainerStyle}
				/>
			</KeyboardAvoidingView>
		</View>
	);
};

export default React.memo(Forms);

const styles = StyleSheet.create({
	container: {
		...commonStyle.mt5,
		...commonStyle.mb20,
		zIndex: -5,
	},
	twoColumn: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		// gap: moderateScale(15),

	},
	width48: {
		width: '48%',
	},
	width25: {
		width: '31%',
	},
});
