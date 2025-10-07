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
	useMemo,
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

import { useForm, Controller } from 'react-hook-form';

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

	// Build defaultValues for RHF from formFields
	const defaultValues = useMemo(() => {
		const dv: Record<string, any> = {};
		formFields.forEach(f => {
			if (f.component && Array.isArray(f.component)) {
				// nested components: include their keys as well
				f.component.forEach((c: any) => {
					dv[c.key] = c.value;
				});
			} else {
				dv[f.key] = f.value;
			}
		});
		return dv;
	}, [formFields]);

	// React Hook Form instance
	const {
		control,
		setValue,
		trigger,
		reset,
	} = useForm({
		defaultValues,
		mode: 'onChange',
	});

	// Keep RHF reset if formFields change (e.g., default values updated externally)
	useEffect(() => {
		reset(defaultValues);
	}, [defaultValues, reset]);

	// initialize country/state/city from formFields values (preserve original)
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
			setCountryStateCity(prev => ({ ...prev, ...countStateCity }));
		}
	}, [formFields]);

	// The original checkErrors function largely unchanged — uses setErrors passed from props
	const checkErrors = useCallback((formField: any, form: any) => {
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
	}, [formFields, setErrors]);

	// We'll reuse your existing onChangeText logic to update `formState` array.
	// Slightly adjusted to be stable inside this component (kept original code intact).
	const onChangeText = useCallback((
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

		// update form state (original logic preserved)
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
			updated[index] = { ...updatedIndex };
			console.log('ME52RETAILERTESTING', 'Final form state after update: ', updated);
			console.log('ME52RETAILERTESTING', 'Calling updateFormData for direct field update:', id);
			if (id == 'keytype') updateFormData?.(updated);
			return updated;
		});
	}, [isCheckError, checkErrors, setFormState, updateFormData, setErrors]);

	// helper to update RHF + original formState (so both are in sync)
	const updateField = useCallback((field: any, value: any, keyParam?: string | any, parentKey?: string, idx?: number) => {
		// set RHF value so controllers/watch reflect latest
		try {
			setValue(field.key, value, { shouldValidate: true, shouldDirty: true });
		} catch (e) {
			// silent: if setValue fails (key absent), ignore
		}
		// Update original formState using your original logic (so external consumers continue to work)
		onChangeText(value, field, field.key, keyParam ?? null, parentKey, idx);
		// trigger external checks if needed
		if (isCheckError) {
			checkErrors(field, value);
		}
		// also request RHF validation run for that field
		trigger(field.key).catch(() => {});
	}, [setValue, onChangeText, isCheckError, checkErrors, trigger]);

	// Render function (keeps your rendering structure but uses Controller for RHF)
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

		// We will use Controller for the field and render your component
		const renderByType = (field: any) => {
			switch (field.type) {
				case 'text':
				case 'number':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							rules={{
								required: field.required ? `${field.label} is required` : false,
								validate: (val: any) => {
									// keep IMEI/pincode/other validations via checkErrors (we still call it), but also provide immediate validate
									if (['imei1', 'imei2'].includes(field.key)) {
										if (!val) return `${field.label} is required`;
										if (!/^\d{15}$/.test(val)) return `${field.label} must be 15 digits`;
									}
									if (field.key === 'pincode') {
										if (!val) return `${field.label} is required`;
										if (val?.length !== 6) return `${field.label} should of 6 digits`;
									}
									return true;
								},
							}}
							render={({ field: { onChange, value } }) => (
								<Input
									key={field.key}
									value={value}
									maxLength={field.maxLength}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									placeholder={field.label}
									error={errors[field.key]}
									secureTextEntry={false}
									keyboardType={field.keyboardType || field.type}
									style={styles.container}
									inputStyle={field.key === 'address' ? { height: getHeight(100) } : undefined}
									readonly={field.readonly}
									icon={field.showIcon}
									formData={formFields}
									autoCapitalize={field.autoCapitalize}
									autoCorrect={field.autoCorrect}
								/>
							)}
						/>
					);

				case 'textArea':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							rules={{ required: field.required ? `${field.label} is required` : false }}
							render={({ field: { onChange, value } }) => (
								<TextArea
									value={value}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									placeholder={field.label}
									key={field.key}
									style={styles.container}
									error={errors[field.key]}
								/>
							)}
						/>
					);

				case 'phonenumber':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							rules={{
								required: field.required ? `${field.label} is required` : false,
							}}
							render={({ field: { onChange, value } }) => (
								<PhoneNumber
									key={field.key}
									onChangeText={(e: any, key?: any) => {
										// PhoneNumber component passes both value and internal key (countryCode/phoneNumber)
										// We ensure updateField is called with the final object expected by your original logic
										onChange(e);
										updateField(field, e, key);
									}}
									error={errors[field.key]}
									value={{
										countryCode:
											field.key === 'phoneNumber'
												? field.value?.['countryCode']
												: field.value?.['alternateCountryCode'],
										phoneNumber:
											field.key === 'phoneNumber'
												? field.value?.['phoneNumber']
												: field.value?.['alternateNumber'],
									}}
									placeholder={field.label}
									name={{
										countryCode:
											field.key === 'phoneNumber'
												? 'countryCode'
												: 'alternateCountryCode',
										phoneNumber:
											field.key === 'phoneNumber'
												? 'phoneNumber'
												: 'alternateNumber',
									}}
									readonly={field.readonly}
									maxLength={field.maxLength}
								/>
							)}
						/>
					);

				case 'countrySelection':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<CountryPicker
									key={field.key}
									onChangeText={(e: any, key?: any) => {
										onChange(e);
										updateField(field, e, key);
									}}
									value={value}
									error={errors[field.key]}
									readonly={field.readonly}
									style={styles.container}
								/>
							)}
						/>
					);

				case 'stateSelection':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<StatePicker
									key={field.key}
									onChangeText={(e: any, key?: any) => {
										onChange(e);
										updateField(field, e, key);
										// Also keep countryStateCity updated
										setCountryStateCity(prev => ({ ...prev, state: e }));
									}}
									value={value}
									error={errors[field.key]}
									readonly={field.readonly}
									parentValue={formFields.find(ff => ff.key === 'country')?.value}
									style={styles.container}
								/>
							)}
						/>
					);

				case 'citySelection':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<CityPicker
									key={field.key}
									onChangeText={(e: any, key?: any) => {
										onChange(e);
										updateField(field, e, key);
										setCountryStateCity(prev => ({ ...prev, city: e }));
									}}
									value={value}
									error={errors[field.key]}
									readonly={field.readonly}
									parentValue={{
										country: formFields.find(ff => ff.key === 'country')?.value,
										state: formFields.find(ff => ff.key === 'state')?.value,
									}}
									style={styles.container}
								/>
							)}
						/>
					);

				case 'dropdown':
					console.log('ME52RETAILERTESTING',
						'Rendering dropdown for: ',
						field.key,
						' with value: ',
						field.value,
					);
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<Dropdown
									options={field.options ? field.options : []}
									multiple={field.multiple}
									value={value}
									key={`${field.key}-${value}`}
									style={styles.container}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									error={errors[field.key]}
									listModal={field.listModal}
									search={field.search}
									apiDetails={field.apiDetails}
									placeholder={field.label}
									readonly={field.readonly}
								/>
							)}
						/>
					);

				case 'date':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<Datepicker
									value={value}
									error={errors[field.key]}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									key={field.key}
									style={styles.container}
									readonly={field.readonly}
									maxDate={field.maxDate}
									placeholder={field.placeholder}
									minDate={field.minDate}
								/>
							)}
						/>
					);

				case 'file':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<Uploader
									value={value}
									key={field.key}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									readonly={field.readonly}
								/>
							)}
						/>
					);

				case 'barcode':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<BarcodeInput
									value={value}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									key={field.key}
									placeholder={field.label}
									style={styles.container}
									name={field.name}
									readonly={field.readonly}
									error={errors[field.key]}
									iconReadonly={field.iconReadonly}
								/>
							)}
						/>
					);

				case 'checkbox':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<Checkbox
									key={field.key}
									value={value}
									label={field.label}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									readonly={field.readonly}
									terms={field.terms}
									border={field.border}
									error={errors[field.key]}
								/>
							)}
						/>
					);

				case 'signaturePad':
					console.log('ME52RETAILERTESTING',
						'Rendering signaturePad for: ',
						field.key,
						' with value: ',
						field.value ? 'has value' : 'no value',
					);
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<SignPad
									value={value}
									key={field.key}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									readonly={field.readonly}
									label={field.label}
									style={styles.container}
									error={errors[field.key]}
									name={field.key}
								/>
							)}
						/>
					);

				case 'orderInput':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<OrderInput
									readonly={field.readonly}
									label={field.label}
									price={field.price}
									discount={field.discount}
									value={value}
									key={field.key}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									features={field.features}
									index={index}
								/>
							)}
						/>
					);

				case 'uploadPicker':
					// handle multiple frames separately – these use UploadPicker directly and updateField
					if (field.multiple && field.no_of_frames) {
						return (
							<View style={commonStyle.pb10}>
								{field.label && (
									<Text
										style={[
											labelStyle,
											{ color: colors?.textDarker ?? '#000', marginBottom: 0 },
										]}
									>
										{field.label}
									</Text>
								)}
								<ScrollView
									key={field.key}
									style={{ flexDirection: 'row', width: SCREEN_WIDTH }}
									horizontal={true}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ gap: moderateScale(15) }}
								>
									{field.value &&
										field.value.length < 10 &&
										Array.from({ length: field.no_of_frames }).map(
											(no_of_frame: any, i) => {
												return (
													<View style={commonStyle.mv10} key={i}>
														<UploadPicker
															width={field.width}
															height={field.height}
															imageOrVideo={field.imageOrVideo}
															value={null}
															onChangeText={(e: any) => {
																updateField(field, e);
															}}
															readonly={field.readonly}
															error={errors[field.key]}
															caption={field.caption}
															maxSize={field.maxSize}
														/>
													</View>
												);
											},
										)}
									{field.value &&
										field.value.length != 0 &&
										field.value.map((val: any, i: number) => (
											<View style={commonStyle.mv10} key={i}>
												<UploadPicker
													width={field.width}
													height={field.height}
													imageOrVideo={field.imageOrVideo}
													value={val}
													onChangeText={(e: any) =>
														updateField(field, e, null, '', i)
													}
													readonly={field.readonly}
													error={errors[field.key]}
													caption={field.caption}
													maxSize={field.maxSize}
												/>
											</View>
										))}
								</ScrollView>
							</View>
						);
					} else {
						return (
							<Controller
								control={control}
								name={field.key}
								defaultValue={field.value}
								render={({ field: { onChange, value } }) => (
									<UploadPicker
										width={field.width}
										label={field.label}
										height={field.height}
										imageOrVideo={field.imageOrVideo}
										value={value}
										onChangeText={(e: any) => {
											onChange(e);
											updateField(field, e);
										}}
										readonly={field.readonly}
										error={errors[field.key]}
										style={styles.container}
										caption={field.caption}
										maxSize={field.maxSize}
									/>
								)}
							/>
						);
					}

				case 'time':
					return (
						<Controller
							control={control}
							name={field.key}
							defaultValue={field.value}
							render={({ field: { onChange, value } }) => (
								<TimePicker
									value={value}
									onChangeText={(e: any) => {
										onChange(e);
										updateField(field, e);
									}}
									label={field.label}
								/>
							)}
						/>
					);

				case 'twoColumn':
					if (field.component) {
						const length = field.component.length;
						return (
							<View
								style={[
									styles.twoColumn,
									styleTwoColumn,
									commonStyle.mb10,
								]}
							>
								{field.component.map((comp: any) => {
									console.log(
										'ME52RETAILERTESTING',
										"Find nested component ",
										comp.key,
										' value: ',
										comp.value,
										' type: ',
										comp.type,
									);
									// Render nested components similarly to top-level using updateField with parentKey
									switch (comp.type) {
										case 'countrySelection':
											return (
												<View
													style={[length === 2 ? styles.width48 : styles.width25]}
													key={comp.key}
												>
													<CountryPicker
														onChangeText={(e: any, key?: any) =>
															updateField(comp, e, key, field.key)
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
														onChangeText={(e: any, key?: any) =>
															updateField(comp, e, key, field.key)
														}
														value={comp.value}
														error={errors[comp.key]}
														readonly={comp.readonly}
														parentValue={countryStateCity.country}
													/>
												</View>
											);

										case 'citySelection':
											return (
												<View
													key={comp.key}
													style={[length === 2 ? styles.width48 : styles.width25]}
												>
													<CityPicker
														onChangeText={(e: any, key?: any) =>
															updateField(comp, e, key, field.key)
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
														onChangeText={(e: any) =>
															updateField(comp, e, null, field.key)
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
													shouldHideFields && { width: '48%' }
													]}
													key={comp.key}
												>
													<Dropdown
														options={comp.options ? comp.options : []}
														multiple={comp.multiple}
														value={comp.value}
														onChangeText={(e: any) => {
															console.log('====================================');
															console.log("onChangeText>>>>", comp.options);
															console.log('====================================');
															updateField(comp, e, null, field.key);
														}}
														onChangeFullText={e => {
															comp.data = e;
															console.log('onChangeFullText>>>>', e);
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

										case 'date':
											return (
												<View
													style={[length === 2 ? styles.width48 : styles.width25, { marginTop: 5 }]}
													key={comp.key}
												>
													<Datepicker
														value={comp.value}
														error={errors[comp.key]}
														onChangeText={(e: any) =>
															updateField(comp, e, null, field.key)
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
														onChangeText={(e: any) =>
															updateField(comp, e, null, field.key)
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
														onChangeText={(e: any) =>
															updateField(comp, e, null, field.key)
														}
														placeholder={comp.label}
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
														onChangeText={(e: any) => updateField(comp, e, null, field.key)}
														placeholder={comp.label}
														style={styles.container}
														error={errors[comp.key]}
													/>
												</View>
											);
										default:
											return null;
									}
								})}
							</View>
						);
					}
					return null;

				default:
					return null;
			}
		};

		return renderByType(formField);
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
