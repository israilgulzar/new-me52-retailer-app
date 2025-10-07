import React, {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Alert,
} from 'react-native';
import Button from '../components/Button';
import { useTheme } from '../theme/ThemeProvider';
import Forms from '../components/Forms';
import { useAuth } from '../context/AuthContext';


import {
	addCustomer,
	editCustomer,
	deleteCustomerApi,
	getCustomerDetails,
	uploadCustomerProof,
} from '../services/customer';
import { getkeys, keyLink } from '../services/keys';
import { addDevice, editDevice } from '../services/devices';
import { addLoan, editLoan } from '../services/loan';


import { IMAGE_BASE_URL } from "../environment"
import { CountryCode, parsePhoneNumberFromString, } from 'libphonenumber-js';
import { SCREENS } from '../navigation/screens';
import Loader from '../components/Loader';
import Overlay from '../components/Overlat';
import {
	getCountryCodeFromCallCode,
} from '../utility/helpers';
import Footer from '../components/Footer';
import {
	NavigationProp,
	useFocusEffect,
	useIsFocused,
} from '@react-navigation/native';
import { onError } from '../utility/Toaster';
import { getCallingCode } from 'react-native-country-picker-modal';
import { USER_FORM_STRUCTURE } from './userData';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import { commonStyle } from '../theme';
import { getHeight } from '../common/constants';
import Toast from 'react-native-toast-message';

type STATUS = 'LOADING' | 'SUCCESS' | 'ERROR';

const AddCustomerScreen = ({
	route,
	navigation,
}: {
	route: any;
	navigation: NavigationProp<any>;
}) => {

	// State to control hiding fields below keytype
	const [hideFieldsBelowKeyType, setHideFieldsBelowKeyType] = useState(false);

	const { users } = useAuth();
	const isFocused = useIsFocused();

	const customerId = route.params?.customerId ?? "";

	const [status, setStatus] = useState<STATUS>('LOADING');
	const [deviceId, setDeviceId] = useState('');
	const [loanId, setLoanId] = useState('');
	const [errors, setErrors] = useState<any>('');
	const [isEdit, setIsEdit] = useState<boolean>(false);
	const [originalFormStructure, setOriginalFormStructure] = useState<any>([]);
	const [formFieldStructure, setFormFieldStructure] = useState<any>([]);


	const addUserId = useRef(null);

	let formStructure: any = [];

	const users_data = [
		{ fekey: 'name', bekey: 'name' },
		{ fekey: 'email', bekey: 'email' },
		{ fekey: 'address', bekey: 'address' },
		{ fekey: 'countryCode', bekey: 'phone_country_code' },
		{ fekey: 'phoneNumber', bekey: 'phone' },
		{ fekey: 'alternateCountryCode', bekey: 'alternate_phone_country_code' },
		{ fekey: 'alternateNumber', bekey: 'alternate_phone' },
		{ fekey: 'country', bekey: 'country' },
		{ fekey: 'state', bekey: 'state' },
		{ fekey: 'city', bekey: 'city' },
		{ fekey: 'pincode', bekey: 'pincode' },
	];

	const device_data = [
		{ fekey: 'model_number', bekey: 'model_number' },
		{ fekey: 'imei1', bekey: 'imei1' },
		{ fekey: 'imei2', bekey: 'imei2' },
	];

	const loan_data = [
		{ fekey: 'loan.signature', bekey: 'signature' },
		{ fekey: 'loan.alt_id_proof', bekey: 'alt_id_proof' },
		{ fekey: 'loan.id_proof', bekey: 'id_proof' },
		{ fekey: 'loan.photo', bekey: 'photo' },
		{ fekey: 'termsAndConditions', bekey: 'terms_and_conditions' },
		{ fekey: 'emiDate', bekey: 'emi_start_date' },
		{ fekey: 'actualPrice', bekey: 'actual_price' },
		{ fekey: 'prepaidPrice', bekey: 'down_payment' },
		{ fekey: 'noOfEmis', bekey: 'no_of_emis' },
		{ fekey: 'installmentType', bekey: 'installment_type' },
		{ fekey: 'loanByCompany', bekey: 'ledger' },
	];

	// Central list of fields that should be hidden when hideFieldsBelowKeyType is true
	const getHiddenFields = (): string[] => [
		'loanByCompany',
		'emiDate',
		'actualPrice',
		'prepaidPrice',
		'installmentType',
		'noOfEmis',
		'customerPhoto',
		'idProof1Photo',
		'idProof2Photo',
		'signature',
	];

	useFocusEffect(
		useCallback(() => {
			let mounted = true;
			console.log("LOADING CUSTOMER ADD EDIT PAGE", customerId);
			setIsEdit(!!customerId);
			if (customerId) {
				console.log("EDIT FORM");
				loadCustomerDetails(customerId, mounted);
			} else {
				console.log("FRESH FORM");
				const formData = resetFormStructure(USER_FORM_STRUCTURE);
				setFormFieldStructure(formData);
				// Store original structure for potential field hiding
				setOriginalFormStructure(formData);
				setStatus('SUCCESS')
			}
		}, [customerId])
	);

	const resetFormStructure = (form: any[]) => {
		return form.map((field) => {
			const newField = { ...field };

			// If field has a nested component array → reset recursively
			if (Array.isArray(newField.component)) {
				newField.component = resetFormStructure(newField.component);
			}

			// If the field has a 'value' property → reset it
			if (newField.hasOwnProperty("value")) {
				if (typeof newField.value === "object" && newField.value !== null) {
					// Reset nested object values to empty string
					newField.value = Object.fromEntries(
						Object.keys(newField.value).map((key) => [key, key === 'countryCode' || key === 'alternateCountryCode' ? "IN" : ""])
					);
				} else {
					// Preserve sensible defaults for certain types/keys
					if (newField.type === 'date' && newField.key === 'emiDate') {
						// default to today (epoch seconds)
						newField.value = Math.floor(Date.now() / 1000);
					} else {
						newField.value = "";
					}
				}
			}

			return newField;
		});
	}

	const loadKeyType = async (key: any) => {
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
			const filterData = items?.filter(itm => itm.key == key)
			return filterData

		} catch (error) {
			Toast.show({ type: 'error', text1: (error as any)?.message ?? 'Something went to wrong', })
			console.log('ME52RETAILERTESTING', 'Error while loading keytypes ', error);

		}
	};

	const loadCustomerDetails = async (customerId: any, mounted: boolean) => {
		if (mounted) {
			try {

				const formData = resetFormStructure(USER_FORM_STRUCTURE);
				formStructure = formData;

				setStatus('LOADING');
				const response = await getCustomerDetails(
					{ id: customerId },
					users.token,
				);

				console.log('ME52RETAILERTESTING', 'Response of customer details ', response.data);

				const loanDetails = response.data.loan;
				setLoanId(loanDetails._id);
				const deviceDetails = response.data.device;
				setDeviceId(deviceDetails._id);
				console.log('ME52RETAILERTESTING', 'deviceDetails ', deviceDetails.key);
				const keytype = deviceDetails?.key?.keytype;
				console.log('ME52RETAILERTESTING', 'keytype data structure:', keytype);
				if (keytype && keytype.data) {
					console.log('ME52RETAILERTESTING', 'keytype metadata:', keytype.data.metadata);
				}

				const formDetails: Record<string, any> = {};

				for (let udata of users_data) {
					if (
						['countryCode', 'alternateCountryCode'].includes(udata['fekey'])
					) {
						let cc = getCountryCodeFromCallCode(response.data[udata['bekey']]);
						// Fallback to 'IN' if calling code is 91 or mapping fails
						if (!cc || String(cc) === '' || (response.data[udata['bekey']] === '91')) {
							cc = 'IN';
						}
						formDetails[udata['fekey']] = cc;
					} else {
						formDetails[udata['fekey']] = response.data[udata['bekey']];
					}
				}

				for (let ldata of loan_data) {
					if (['emiDate', 'loanCreatedDate'].includes(ldata['fekey'])) {
						const date = new Date(loanDetails[ldata['bekey']]);
						const epochtime = Math.floor(date.getTime() / 1000) + 19800;
						formDetails[ldata['fekey']] = epochtime;
					} else {
						formDetails[ldata['fekey']] = loanDetails[ldata['bekey']]?.toString();
					}
				}

				formDetails['signature'] = loanDetails['signature'];
				formDetails['idProof1Photo'] = loanDetails['id_proof'];
				formDetails['idProof2Photo'] = loanDetails['alt_id_proof'];
				formDetails['customerPhoto'] = loanDetails['photo'];
				formDetails['keytype'] = keytype;

				console.log('ME52RETAILERTESTING',
					'formDetails: ',
					formDetails,
				);

				for (let ddata of device_data) {
					formDetails[ddata['fekey']] = deviceDetails[ddata['bekey']];
				}
				formStructure = formStructure.filter(
					(formStruct: any) => formStruct.key !== 'termsAndConditions',
				);

				formStructure.forEach((formS: any) => {
					// if (formS.type == 'barcode') {
					// 	formS['iconReadonly'] = true;
					// }
					if (formS.component) {
						for (let formScomp of formS.component) {
							if (formScomp.key === 'country')
								formScomp.value = (formDetails[formScomp.key]).toUpperCase();
							else if (formScomp.key === 'state')
								formScomp.value = (formDetails[formScomp.key]).toUpperCase();
							else if (formScomp.key === 'city')
								formScomp.value = (formDetails[formScomp.key]).toUpperCase();
							else if (formScomp.key === 'keytype') {
								// Set the keytype value and ensure data structure is preserved
								formScomp.value = formDetails['keytype'];
								// If the keytype has metadata, preserve it
								if (keytype && keytype.data) {
									formScomp.data = keytype.data;
								}
							} else
								formScomp.value = formDetails[formScomp.key];
						}
					} else if (formS.key === 'phoneNumber') {
						formS.value = {
							countryCode: formDetails['countryCode'],
							phoneNumber: formDetails['phoneNumber'],
						};
					} else if (formS.key === 'alternateNumber') {
						formS.value = {
							alternateCountryCode: formDetails['alternateCountryCode'],
							alternateNumber: formDetails['alternateNumber'],
						};
					} else {
						formS.value = formDetails[formS.key];
					}
				});

				// formStructure.forEach((field: any) => {
				// 	if (field.component) {
				// 		field.component.forEach((subfield: any) => {
				// 			console.log("subfield", subfield.key, subfield.value);
				// 			if (subfield.key === 'keytype') {
				// 				console.log("keytype subfield data:", subfield.data);
				// 			}
				// 		});
				// 	}
				// });

				const keyFilterData = await loadKeyType(deviceDetails?.key?.keytype)

				let shouldHideFields = false;
				if (keyFilterData && keytype.length > 0) {
					shouldHideFields = keyFilterData[0]?.metadata.some((meta: any) => {
						if (meta.key === "phone_block" && meta.active) {
							return true;
						}
						if (meta.key === "location_tracking" && meta.active) {
							return true;
						}
						if (meta.key === "sim_tracking" && meta.active) {
							return true;
						}
						return false;
					}
					);
				}

				const targetKeys = [
					!isEdit && shouldHideFields && "keytype",
					'loanByCompany',
					'emiDate',
					'actualPrice',
					'prepaidPrice',
					'installmentType',
					'noOfEmis',
					'customerPhoto',
					'idProof1Photo',
					'idProof2Photo',
					'signature'
				];
				if (shouldHideFields) {
					// Show fields as readonly (do not hide)
					const keySet = new Set([
						!isEdit && shouldHideFields && "keytype",
						'loanByCompany',
						'emiDate',
						'actualPrice',
						'prepaidPrice',
						'installmentType',
						'noOfEmis',
					]);
					const readonlyStructure = formStructure.map((field: any) => {
						const nf = { ...field };
						if (nf.component && Array.isArray(nf.component)) {
							nf.component = nf.component.map((c: any) => keySet.has(c.key) ? { ...c, readonly: true } : { ...c });
						} else if (keySet.has(nf.key)) {
							nf.readonly = true;
						}
						return nf;
					});
					setFormFieldStructure(readonlyStructure);
					setHideFieldsBelowKeyType(false);
				} else {
					// Hide those fields
					const fieldsToHide = targetKeys;
					const filteredFormStructure = formStructure.filter((field: any) => {
						if (!field.component && !fieldsToHide.includes(field.key)) return true;
						if (!field.component && fieldsToHide.includes(field.key)) return false;
						if (field.component && Array.isArray(field.component)) {
							const filteredComponents = field.component.filter((comp: any) => !fieldsToHide.includes(comp.key));
							if (filteredComponents.length > 0) {
								field.component = filteredComponents;
								return true;
							}
							return false;
						}
						return true;
					});
					const keySet = new Set(['keytype']);
					const readonlyStructure = filteredFormStructure.map((field: any) => {
						const nf = { ...field };
						if (nf.component && Array.isArray(nf.component)) {
							nf.component = nf.component.map((c: any) => keySet.has(c.key) ? { ...c, readonly: true } : { ...c });
						} else if (keySet.has(nf.key)) {
							nf.readonly = true;
						}
						return nf;
					});
					setFormFieldStructure(readonlyStructure);
					setHideFieldsBelowKeyType(true);
				}
				setStatus('SUCCESS');

			} catch (error) {
				Toast.show({ type: 'error', text1: (error as any)?.message ?? 'Something went to wrong', })
				console.log('ME52RETAILERTESTING', 'Loading customer details error ', error);
				setStatus('ERROR');
			}
		}
	};

	const checkError = (formField: any, form: any, err: boolean) => {

		console.log(" ");
		const BEFORE = Boolean(err) ? "ERROR HAI" : "NAHI HAI";

		if (Boolean(err)) {
			console.log("BEFORE ", BEFORE);
			console.log("BEFORE ", formField.name);
		}

		if (Boolean(err)) {
			console.log("BEFORE ", BEFORE);
			console.log("BEFORE ", formField.name);
		}

		if (
			formField.required &&
			formField.type !== 'file' &&
			formField.type !== 'signaturePad' &&
			formField.key !== 'termsAndConditions'
		) {
			if (!form[formField.key as keyof typeof form]) {
				setErrors((prev: any) => ({
					...prev,
					[formField.key]: `${formField.label} is required`,
				}));
				err = true;
			} else {
				setErrors((prev: any) => ({ ...prev, [formField.key]: null }));
			}
		}

		if (['phoneNumber', 'alternateNumber'].includes(formField.key)) {
			// Get the current country code from the form structure, not from the form object
			const currentPhoneField = formFieldStructure.find(
				(field: any) => field.key === formField.key
			);

			let countryCode: CountryCode;
			let phoneValue: string;

			if (formField.key === 'phoneNumber') {
				// For phone number, get country code from the current field's value object
				countryCode = currentPhoneField?.value?.countryCode || 'IN';
				phoneValue = form[formField.key as keyof typeof form] as string;
			} else {
				// For alternate number, get alternate country code from the current field's value object
				countryCode = currentPhoneField?.value?.alternateCountryCode || 'IN';
				phoneValue = form[formField.key as keyof typeof form] as string;
			}

			// Ensure countryCode is valid
			if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
				countryCode = 'IN';
			}

			const parseNumber = parsePhoneNumberFromString(
				phoneValue,
				countryCode,
			);

			let invalid = false;
			if (formField.required && !phoneValue) {
				setErrors((prev: any) => ({
					...prev,
					[formField.key]: `${formField.label} is required`,
				}));
				err = true;
				invalid = true;
			} else if (phoneValue) {
				// Prefer library validation when available
				const isLibValid = Boolean(parseNumber && parseNumber.isValid());

				// Fallback: accept generic numbers with 6-15 digits (E.164 range)
				const digitOnly = String(phoneValue).replace(/[^0-9]/g, '');
				const isFallbackValid = digitOnly.length >= 6 && digitOnly.length <= 15;

				if (isLibValid || isFallbackValid) {
					setErrors((prev: any) => ({ ...prev, [formField.key]: null }));
				} else {
					setErrors((prev: any) => ({
						...prev,
						[formField.key]: `${formField.label} is not valid`,
					}));
					err = true;
					invalid = true;
				}
			}

			const phoneNumberField = formFieldStructure.find(
				(formField: any) => formField.key === 'phoneNumber',
			);
			const alternatephoneNumberField = formFieldStructure.find(
				(formField: any) => formField.key === 'alternateNumber',
			);

			if (phoneNumberField && alternatephoneNumberField && !invalid) {
				const phoneNumberCountryCode = (phoneNumberField.value as any)?.countryCode || 'IN';
				const phoneNumber = (phoneNumberField.value as any)?.phoneNumber || '';
				const alternateCountryCode = (alternatephoneNumberField.value as any)?.alternateCountryCode || 'IN';
				const alertnatePhoneNumber = (alternatephoneNumberField.value as any)?.alternateNumber || '';

				if (
					phoneNumberCountryCode === alternateCountryCode &&
					phoneNumber && alertnatePhoneNumber &&
					phoneNumber === alertnatePhoneNumber
				) {
					setErrors((prev: any) => ({
						...prev,
						alternateNumber: `Phone number and Alternate number cannot be same`,
					}));
					err = true;
				} else {
					setErrors((prev: any) => ({ ...prev, alternateNumber: null }));
				}
			}
		}

		if (formField.key === 'pincode') {
			const pincodeValue = form['pincode'];
			if (pincodeValue.length !== 6) {
				setErrors((prev: any) => ({
					...prev,
					pincode: `${formField.label} should of 6 digits`,
				}));
				err = true;
			} else {
				setErrors((prev: any) => ({ ...prev, pincode: null }));
			}
		}

		if (formField.key === 'email') {
			const emailValue = form['email'];
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

			if (formField.required && !emailValue) {
				setErrors((prev: any) => ({
					...prev,
					email: `${formField.label} is required`,
				}));
				err = true;
			} else if (emailValue && !emailRegex.test(emailValue)) {
				setErrors((prev: any) => ({
					...prev,
					email: `${formField.label} is not valid`,
				}));
				err = true;
			} else {
				setErrors((prev: any) => ({ ...prev, email: null }));
			}
		}

		if (
			formField.required &&
			(formField.type === 'file' ||
				formField.key === 'termsAndConditions' ||
				formField.type === 'signaturePad')
		) {
			if (!form[formField.key as keyof typeof form]) {
				setErrors((prev: any) => ({
					...prev,
					[formField.key]: `${formField.label} is required`,
				}));
				err = true;
			} else {
				setErrors((prev: any) => ({ ...prev, [formField.key]: null }));
			}
		}

		const AFTER = Boolean(err) ? "ERROR HAI" : "NAHI HAI";
		if (Boolean(err)) {
			console.log("AFETR ", AFTER, formField.name);
		}

		if (Boolean(err)) {
			console.log("AFETR ", AFTER, formField.name);
		}

		return err
	};

	const addCustomers = async () => {
		try {
			let form = buildFormDataFromStructure(formFieldStructure);

			let hasError = validateFormFields(formFieldStructure, form);
			if (hasError) return;

			hasError = validateFormFields(formStructure, form);
			if (hasError) return;

			setStatus('LOADING');

			await handleImageUploads(form);
			console.log('====================================');
			console.log("users_data", users_data);
			console.log('====================================');

			const addUserData = await prepareUserData(form, users_data);
			console.log("prepareUserData", addUserData);
			const customerAdded = await createOrUpdateCustomer(addUserData);
			console.log("createOrUpdateCustomer", customerAdded);
			const custId = isEdit ? customerId : customerAdded?.data?._id;
			addUserId.current = custId;

			const updateKeyRes = isEdit ? null : await linkCustomerKey(custId, form['keytype']);
			console.log("linkCustomerKey", updateKeyRes);

			const addDeviceData = prepareDeviceData(form, device_data, updateKeyRes?.data?.keyId, custId);
			console.log("prepareDeviceData", addDeviceData, deviceId);

			const deviceAdded = await createOrUpdateDevice(addDeviceData);
			console.log("createOrUpdateDevice", deviceAdded);

			const devId = isEdit ? deviceId : deviceAdded?.data?._id;

			const addLoanData = prepareLoanData(form, loan_data, devId);
			console.log("prepareLoanData", addLoanData);

			const reposnev = await createOrUpdateLoan(addLoanData);
			console.log("createOrUpdateLoan", reposnev);

			setStatus('SUCCESS');
			Toast.show({ type: 'success', text1: `Customer ${isEdit ? 'Updated' : 'Added'} Successfully` })
			navigation.navigate(SCREENS.Customer, {
				screen: SCREENS.ListCustomer,
			})

		} catch (error: any) {
			setStatus('ERROR');
			Toast.show({ type: 'error', text1: (error as any)?.message ?? 'Something went to wrong', })
			console.log(error);
			handleAddCustomerError(error);
		}
	};

	// Build the form object from the field structure
	function buildFormDataFromStructure(fieldStructure: any[]) {
		let form: any = {};

		const hidden = hideFieldsBelowKeyType ? new Set(getHiddenFields()) : null;

		for (let field of fieldStructure) {
			if (!field.component && hidden && hidden.has(field.key)) continue;
			if (field.key === 'phoneNumber' && typeof field.value === 'object') {
				form['phoneNumber'] = field.value.phoneNumber || '';
				form['countryCode'] = field.value.countryCode || 'IN';
			} else if (field.key === 'alternateNumber' && typeof field.value === 'object') {
				form['alternateNumber'] = field.value.alternateNumber || '';
				form['alternateCountryCode'] = field.value.alternateCountryCode || 'IN';
			} else if (typeof field.value === 'object' && !['customerPhoto', 'idProof1Photo', 'idProof2Photo', 'signature'].includes(field.key)) {
				form = { ...form, ...field.value };
			} else if (field.component) {
				for (let comp of field.component) {
					if (hidden && hidden.has(comp.key)) continue;
					form[comp.key] = comp.value;
				}
			} else {
				form[field.key] = field.value;
			}
		}
		if (!form['countryCode']) form['countryCode'] = 'IN';
		if (!form['alternateCountryCode']) form['alternateCountryCode'] = 'IN';
		return form;
	}

	// Validate form fields and return true if errors exist
	function validateFormFields(fieldStructure: any[], form: any) {
		let err = false;

		console.log("A validateFormFields", fieldStructure, form);
		console.log("V validateFormFields", form);

		const hidden = hideFieldsBelowKeyType ? new Set(getHiddenFields()) : null;
		const shouldSkip = (key?: string) => hidden && key ? hidden.has(key) : false;

		for (let field of fieldStructure) {
			console.log('====================================');
			console.log("FIELD", field);
			console.log('====================================');
			// Skip hidden direct fields
			if (!field.component && shouldSkip(field.key)) continue;
			if (field.component) {
				for (let comp of field.component) {
					// Skip hidden nested fields
					if (shouldSkip(comp.key)) continue;
					err = checkError(comp, form, err);
				}
			}
			err = checkError(field, form, err);
		}

		console.log("B validateFormFields", err);

		return err;
	}

	// Uploads images and updates form fields
	async function handleImageUploads(form: any) {

		try {

			// If fields are hidden, do not upload corresponding files and unset any pre-filled values
			if (hideFieldsBelowKeyType) {
				const hidden = new Set(getHiddenFields());
				if (hidden.has('idProof1Photo')) delete form['idProof1Photo'];
				if (hidden.has('idProof2Photo')) delete form['idProof2Photo'];
				if (hidden.has('customerPhoto')) delete form['customerPhoto'];
				if (hidden.has('signature')) delete form['signature'];
			}

			if (isImageBlob(form['idProof1Photo'])) {
				const folderName = 'idProofOne';
				const res = await uploadCustomerProof({ folderName, file: form['idProof1Photo'] as unknown as File }, users.token);
				if (res) form['loan.id_proof'] = IMAGE_BASE_URL + res.data;
			}

			if (isImageBlob(form['idProof2Photo'])) {
				const folderName = 'idProofTwo';
				const res = await uploadCustomerProof({ folderName, file: form['idProof2Photo'] as unknown as File }, users.token);
				if (res) form['loan.alt_id_proof'] = IMAGE_BASE_URL + res.data;
			}

			if (isImageBlob(form['customerPhoto'])) {
				const folderName = 'signature';
				const res = await uploadCustomerProof({ folderName, file: form['customerPhoto'] as unknown as File }, users.token);
				if (res) form['loan.photo'] = IMAGE_BASE_URL + res.data;
			}

			if (form['signature']?.includes('data:image')) {
				const folderName = 'signature';
				const signatureFile = {
					uri: form['signature'],
					fileName: `${form['name']}.jpg`,
					type: 'image/png',
				};
				const res = await uploadCustomerProof({ folderName, file: signatureFile as unknown as File }, users.token);
				if (res) form['loan.signature'] = IMAGE_BASE_URL + res.data;
			}

		} catch (err) {
			throw err
		}
	}

	// Prepare user object to send to API
	async function prepareUserData(form: any, users_data: any[]) {

		const addUserData: Record<string, any> = {};

		for (let u of users_data) {
			if (['countryCode', 'alternateCountryCode'].includes(u['fekey'])) {
				addUserData[u['bekey']] = await getCallingCode(form[u['fekey']]);
			} else if ((u['fekey'] === 'city' && form[u['fekey']] === 'no_city') ||
				(u['fekey'] === 'state' && form[u['fekey']] === 'no_state')) {
				addUserData[u['bekey']] = '';
			} else {
				addUserData[u['bekey']] = form[u['fekey']];
			}
		}

		if (customerId && isEdit)
			addUserData['_id'] = customerId;

		addUserData['parent'] = users.id;
		addUserData['type'] = 'customer';
		return addUserData;

	}

	async function createOrUpdateCustomer(data: any) {
		return isEdit
			? await editCustomer({ data }, users.token)
			: await addCustomer({ data }, users.token);
	}

	async function linkCustomerKey(customerId: string, keytype: string) {
		return await keyLink({ user: customerId, keytype }, users.token);
	}

	function prepareDeviceData(form: any, device_data: any[], keyId: string, customerId: string) {
		const device: Record<string, any> = {};

		for (let d of device_data) {
			device[d['bekey']] = form[d['fekey']];
		}

		console.log("prepareDeviceData", isEdit, deviceId);


		if (deviceId && isEdit)
			device['_id'] = deviceId;

		if (keyId && !isEdit)
			device['key'] = keyId;
		device['user'] = customerId;
		return device;
	}

	async function createOrUpdateDevice(data: any) {
		return isEdit
			? await editDevice({ data }, users.token)
			: await addDevice({ data }, users.token);
	}

	function prepareLoanData(form: any, loan_data: any[], deviceId: string) {
		const loan: Record<string, any> = {};
		const hidden = hideFieldsBelowKeyType ? new Set(getHiddenFields()) : null;
		for (let l of loan_data) {
			// Skip hidden fields when building loan payload
			if (hidden && hidden.has(l['fekey'].replace('loan.', ''))) continue;
			if (['emi_start_date', 'loan_date'].includes(l['bekey'])) {
				// If emi date missing, fallback to today
				const epoch = form[l['fekey']] ? form[l['fekey']] : Math.floor(Date.now() / 1000);
				const dateObj = new Date(epoch * 1000);
				loan[l['bekey']] = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
			} else {
				loan[l['bekey']] = form[l['fekey']];
			}
		}

		if (loanId && isEdit)
			loan['_id'] = loanId;

		loan['device'] = deviceId;
		// Only compute loan price if both inputs are present (not hidden)
		if (loan['actual_price'] != null && loan['down_payment'] != null) {
			loan['loan_price'] = Number(loan['actual_price']) - Number(loan['down_payment']);
		}
		return loan;
	}

	async function createOrUpdateLoan(data: any) {
		return isEdit
			? await editLoan({ data }, users.token)
			: await addLoan({ data }, users.token);
	}

	async function handleAddCustomerError(error: any) {

		console.log('Error while submitting form', error.response.data, addUserId);
		setStatus('ERROR');

		const message = error.response?.data?.message || 'Some error occurred. Please try again';
		onError('Customer', message);

		if (addUserId.current && !isEdit) {
			await deleteCustomerApi({ _id: addUserId.current }, users.token);
			addUserId.current = null;
		}

	}

	const isImageBlob = (file: any) => {
		// Check if it's a Blob or File object
		const isBlob = typeof file === 'object' && file?.uri;
		return isBlob;

	};

	const handleSubmit = async () => await addCustomers();

	const updateFormData = (data: any) => {

		const keyTypeField = Array.isArray(data)
			? data.find((field: any) => field?.key === "keytype")
			: null;

		const keytypeField = keyTypeField?.component?.find((key: any) => key?.key === 'keytype');

		// Fallback: search for keytype field in all components
		let fallbackKeytypeField = null;
		if (!keytypeField) {
			for (const field of data) {
				if (field.component && Array.isArray(field.component)) {
					const found = field.component.find((comp: any) => comp.key === 'keytype');
					if (found) {
						fallbackKeytypeField = found;
						break;
					}
				}
			}
		}

		const finalKeytypeField = keytypeField || fallbackKeytypeField;

		let shouldHideFields = false;

		if (finalKeytypeField && finalKeytypeField.data && Array.isArray(finalKeytypeField.data.metadata)) {

			shouldHideFields = finalKeytypeField.data.metadata.some((meta: any) => {
				if (meta.key === "phone_block" && meta.active) {
					return true;
				}
				if (meta.key === "location_tracking" && meta.active) {
					return true;
				}
				if (meta.key === "sim_tracking" && meta.active) {
					return true;
				}
				return false;
			}
			);

		} else {
			if (finalKeytypeField) {
				console.log("finalKeytypeField structure:", finalKeytypeField);
				console.log("finalKeytypeField keys:", Object.keys(finalKeytypeField));
			}
		}

		// Store original template (not current values) if we don't have it yet
		if (originalFormStructure.length === 0) {
			setOriginalFormStructure(resetFormStructure(USER_FORM_STRUCTURE));
		}

		setHideFieldsBelowKeyType(!shouldHideFields);

		// Filter out fields that should be hidden when shouldHideFields is true
		if (!shouldHideFields) {
			const fieldsToHide = [
				'loanByCompany',
				'emiDate',
				'actualPrice',
				'prepaidPrice',
				'installmentType',
				'noOfEmis',
				'customerPhoto',
				'idProof1Photo',
				'idProof2Photo',
				'signature'
			];
			// Remove values for hidden fields from the form state
			data.forEach((field: any) => {
				if (!field.component && fieldsToHide.includes(field.key)) {
					field.value = '';
				}
				if (Array.isArray(field.component)) {
					field.component.forEach((comp: any) => {
						if (fieldsToHide.includes(comp.key)) {
							comp.value = '';
						}
					});
				}
			});

			// Create a filtered version of the data without hidden fields (without mutating incoming data)
			const filteredData = data.reduce((acc: any[], field: any) => {
				// If it's a direct field, check if it should be hidden
				if (!field.component) {
					if (!fieldsToHide.includes(field.key)) {
						acc.push({ ...field });
					}
					return acc;
				}

				// If it has nested components, filter out hidden ones
				if (Array.isArray(field.component)) {
					const filteredComponents = field.component.filter((comp: any) => !fieldsToHide.includes(comp.key));
					if (filteredComponents.length > 0) {
						acc.push({ ...field, component: filteredComponents });
					}
					return acc;
				}
				acc.push({ ...field });
				return acc;
			}, []);

			setFormFieldStructure(filteredData);
		} else {
			// Restore full structure and preserve currently entered values
			const buildValueMap = (structure: any[]) => {
				const map: Record<string, any> = {};
				for (const f of structure) {
					if (Array.isArray(f.component)) {
						for (const c of f.component) map[c.key] = c.value;
					} else {
						map[f.key] = f.value;
					}
				}
				return map;
			};

			const applyValues = (template: any[], values: Record<string, any>) => {
				return template.map((f) => {
					const nf: any = { ...f };
					if (Array.isArray(nf.component)) {
						nf.component = nf.component.map((c: any) => ({ ...c, value: values[c.key] ?? c.value }));
					} else {
						nf.value = values[nf.key] ?? nf.value;
					}
					return nf;
				});
			};

			const currentValues = buildValueMap(data);
			const template = originalFormStructure.length > 0 ? originalFormStructure : resetFormStructure(USER_FORM_STRUCTURE);
			const restored = applyValues(template, currentValues);
			// Not hiding: mark selected fields readonly
			const keySet = new Set([
				isEdit && "keytype",
				'loanByCompany',
				'emiDate',
				'actualPrice',
				'prepaidPrice',
				'installmentType',
				'noOfEmis',
				'customerPhoto',
				'idProof1Photo',
				'idProof2Photo',
				'signature'
			]);
			const readonlyRestored = restored.map((f: any) => {
				const nf = { ...f };
				if (Array.isArray(nf.component)) {
					nf.component = nf.component.map((c: any) => keySet.has(c.key) ? { ...c, readonly: isEdit } : { ...c });
				} else if (keySet.has(nf.key)) {
					nf.readonly = isEdit;
				}
				return nf;
			});
			setFormFieldStructure(readonlyRestored);
		}
	};

	return (
		<CRootContainer style={styles.card}>
			<CHeader
				title={(isEdit ? 'Edit' : 'Create') + ' Customer Form'}
				style={commonStyle.ph25}
			/>
			{
				status === 'LOADING' && (
					<Overlay>
						<Loader center={true} />
					</Overlay>
				)
			}
			<View style={styles.formScroll}>
				<ScrollView
					nestedScrollEnabled
					keyboardShouldPersistTaps="handled"
				>
					<Forms
						formFields={formFieldStructure}
						formState={formFieldStructure}
						setFormState={setFormFieldStructure}
						updateFormData={updateFormData}
						errors={errors}
						setErrors={setErrors}
						isCheckError={true}
						shouldHideFields={hideFieldsBelowKeyType}
						contentContainerStyle={commonStyle.ph25}
					/>
					<View style={commonStyle.mh25}>
						<Button
							variant="darker"
							title="Submit"
							onPress={handleSubmit}
							style={styles.btn}
						/>
					</View>
					<Footer />
				</ScrollView>
			</View>
		</CRootContainer>
	);
};

export default React.memo(AddCustomerScreen);

const styles = StyleSheet.create({
	card: {
		flex: 1,
		width: '100%',
		// paddingLeft: 10,
		// paddingRight: 10,
	},
	headerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	headerText: {
		fontWeight: 'bold',
		fontSize: 20,
	},
	formScroll: {
		flex: 1,
	},
	termsRow: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginTop: 8,
		bottom: '-25%',
		marginBottom: 15,
	},
	checkbox: {
		padding: 4,
	},
	buttonRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
		gap: 8,
	},
	btn: {
		height: getHeight(50),
		...commonStyle.mt15,
		width: '100%'
	},
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.4)', // semi-transparent dark
		...commonStyle.center,
	},
	loaderContainer: {
		padding: 20,
		backgroundColor: '#000',
		borderRadius: 10,
	},
	hiddenFieldsMessage: {
		backgroundColor: '#fff3cd',
		borderColor: '#ffeaa7',
		borderWidth: 1,
		borderRadius: 8,
		padding: 12,
		marginBottom: 16,
	},
	hiddenFieldsText: {
		color: '#856404',
		fontSize: 14,
		textAlign: 'center',
		fontWeight: '500',
	},
});
