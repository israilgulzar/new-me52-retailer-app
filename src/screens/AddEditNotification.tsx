// AddEditNotification.tsx
import {
    addNotificationService,
    updateNotificationService,
    getNotificationById,
    uploadVideoMedia,
    uploadImageMedia,
} from "../services/notificattions";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { boxShadow, buttonRow, labelStyle, root } from "../styles/styles";
import { useCallback, useLayoutEffect, useState, useMemo } from "react";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { onError, onInfo, onSuccess } from "../utility/Toaster";
import { getNotificationCustomers } from "../services/customer";
import SearchInput from "../components/SearchInput";
import { useTheme } from "../theme/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import Overlay from "../components/Overlat";
import Loader from "../components/Loader";
import Footer from "../components/Footer";
import Button from "../components/Button";
// Removed Forms import
import { IMAGE_BASE_URL } from "../environment";
import { commonStyle } from "../theme";
import { getHeight, moderateScale } from "../common/constants";
import CRootContainer from "../components/CRootContainer";
import CHeader from "../components/CHeader";

import Input from "../components/Input";
import TextArea from "../components/TextArea";
import UploadPicker from "../components/UploadPicker";
import Datepicker from "../components/Date";
import TimePicker from "../components/Time";
import Checkbox from "../components/Checkbox";

import { useForm, Controller } from "react-hook-form";

type STATUS = "SUCCESS" | "LOADING" | "ERROR" | "API_LOADING";
const imageBaseUrl = IMAGE_BASE_URL;

const AddEditNotification = ({ route, navigation }: { route: any; navigation: NavigationProp<any> }) => {
    const notificationId = route.params?.notificationId;
    const notificationtype = route.params?.type;

    const addNotificationFormTitleDescription = [
        {
            label: "Title",
            name: "title",
            key: "title",
            type: "text",
            value: "",
            required: true,
        },
        {
            label: "Description",
            name: "description",
            key: "description",
            type: "textArea",
            value: "",
            required: true,
        },
        {
            label: "Images",
            name: "images",
            key: "images",
            type: "uploadPicker",
            value: [],
            width: 100,
            height: 70,
            multiple: true,
            no_of_frames: 1,
            imageOrVideo: "image",
            required: true,
            maxSize: 2.5 * 1024 * 1024,
        },
        {
            label: "Video",
            name: "video",
            key: "video",
            type: "uploadPicker",
            value: "",
            width: 340,
            height: 120,
            caption: "Upload Video here",
            multiple: false,
            // "no_of_frames": 10,
            imageOrVideo: "video",
            required: true,
            maxSize: 25 * 1024 * 1024,
        },
        {
            type: "twoColumn",
            key: "datetime",
            component: [
                {
                    label: "Date",
                    name: "date",
                    key: "date",
                    type: "date",
                    value: Math.floor(Date.now() / 1000),
                    maxDate: Math.floor(Date.now() / 1000) + 86400 * 5,
                    minDate: new Date(),
                    required: true,
                },
                {
                    label: "Time",
                    name: "time",
                    key: "time",
                    type: "time",
                    value: Math.floor(Date.now() / 1000),
                    required: true,
                },
            ],
        },
        {
            name: "allUsers",
            label: "All users with this key feature",
            type: "checkbox",
            key: "allUsers",
            required: false,
            value: false,
            errors: "",
            border: true,
        },
    ];

    const [notification, setNotification] = useState<any[]>([]);
    const [storedNotification, setStoredNotification] = useState<any>({});

    const [errors, setErrors] = useState<any>({});
    const [showSelectedList, setShowSelectedList] = useState("select_more");
    const [status, setStatus] = useState<STATUS>("SUCCESS");
    const [userstatus, setUserStatus] = useState<STATUS>("SUCCESS");

    const [usersList, setUsersList] = useState<Record<string, any>>({
        uList: [],
        selectedUserList: [],
    });
    const [listData, setListData] = useState({
        pageno: 0,
        pagesize: 10,
        sort: "createdAt",
        sortDirection: -1,
        search: "",
    });
    const { colors } = useTheme();
    const { users } = useAuth();

    // --- React Hook Form setup ---
    // Build default values from notification structure
    const defaultValues = useMemo(() => {
        const dv: Record<string, any> = {};
        // initialize with addNotificationFormTitleDescription defaults to avoid missing keys
        addNotificationFormTitleDescription.forEach(f => {
            if (f.component && Array.isArray(f.component)) {
                f.component.forEach((c: any) => {
                    dv[c.key] = c.value;
                });
            } else {
                dv[f.key] = f.value;
            }
        });
        // overlay with current notification values if present
        notification.forEach(f => {
            if (f.component && Array.isArray(f.component)) {
                f.component.forEach((c: any) => {
                    dv[c.key] = c.value;
                });
            } else {
                dv[f.key] = f.value;
            }
        });
        return dv;
    }, [notification]);

    const { control, setValue, trigger, reset } = useForm({
        defaultValues,
        mode: "onChange",
    });

    // keep RHF reset when notification changes
    // (mimics Forms.tsx behavior)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useMemo(() => {
        reset(defaultValues);
    }, [defaultValues]);

    // --- copied checkErrors & update logic adapted from Forms.tsx to keep behavior identical ---
    // This ensures immediate validation behavior mirrors previous Forms component (no logic change)
    const isCheckError = true;

    // checkErrors function copied/adapted (keeps same rules you had)
    const checkErrors = useCallback(
        (formField: any, form: any) => {
            if (
                formField.required &&
                formField.type !== "file" &&
                formField.type !== "signaturePad" &&
                formField.key !== "termsAndConditions"
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
                let imei1 = notification.find(f => f.key === "imei1")?.value || "";
                let imei2 = notification.find(f => f.key === "imei2")?.value || "";
                if (formField.key === "imei1") imei1 = form;
                if (formField.key === "imei2") imei2 = form;

                let imei1Error = null;
                if (!imei1) {
                    imei1Error = "IMEI 1 is required";
                } else if (!imeiRegex.test(imei1)) {
                    imei1Error = "IMEI 1 must be 15 digits";
                }

                let imei2Error = null;
                if (!imei2) {
                    imei2Error = "IMEI 2 is required";
                } else if (!imeiRegex.test(imei2)) {
                    imei2Error = "IMEI 2 must be 15 digits";
                }

                if (!imei1Error && !imei2Error && imei1 === imei2) {
                    imei2Error = "IMEI 1 and IMEI 2 cannot be the same";
                }

                setErrors((prev: any) => ({
                    ...prev,
                    imei1: imei1Error,
                    imei2: imei2Error,
                }));
            }

            if (["phoneNumber", "alternateNumber"].includes(formField.key)) {
                // We won't re-copy the entire phone validation complexity (it references libphonenumber-js).
                // But preserve basic behavior: required check & equality check.
                const safeValue = {
                    countryCode: formField.value?.countryCode || "IN",
                    phoneNumber: formField.value?.phoneNumber || "",
                    alternateCountryCode: formField.value?.alternateCountryCode || "IN",
                    alternateNumber: formField.value?.alternateNumber || "",
                };
                // use the form param to test if empty
                if (formField.required && !form) {
                    setErrors((prev: any) => ({
                        ...prev,
                        [formField.key]: `${formField.label} is required`,
                    }));
                } else {
                    setErrors((prev: any) => ({ ...prev, [formField.key]: null }));
                }

                // equality check between phoneNumber and alternateNumber (if both exist)
                const phoneNumberField = notification.find(formF => formF.key === "phoneNumber");
                const alternatephoneNumberField = notification.find(formF => formF.key === "alternateNumber");
                let phoneNumberCountryCode = "";
                let phoneNumber = "";
                let alternateCountryCode = "";
                let alternateNumber = "";
                if (phoneNumberField && alternatephoneNumberField) {
                    if (formField.key === "phoneNumber") {
                        phoneNumberCountryCode = safeValue.countryCode;
                        phoneNumber = form;
                        alternateCountryCode = alternatephoneNumberField.value?.alternateCountryCode || "IN";
                        alternateNumber = alternatephoneNumberField.value?.alternateNumber || "";
                    } else {
                        phoneNumberCountryCode = phoneNumberField.value?.countryCode || "IN";
                        phoneNumber = phoneNumberField.value?.phoneNumber || "";
                        alternateCountryCode = safeValue.alternateCountryCode;
                        alternateNumber = form;
                    }
                    if (
                        phoneNumberCountryCode === alternateCountryCode &&
                        phoneNumber &&
                        alternateNumber &&
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
                return;
            }

            if (formField.key === "pincode") {
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
                (formField.type === "file" || formField.key === "termsAndConditions" || formField.type === "signaturePad")
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
        },
        [notification],
    );

    // onChangeText and update logic adapted from Forms.tsx
    const onChangeText = useCallback(
        (event: any, field: any, id: string, key: string | null = null, parentKey?: string, idx?: number) => {
            // update errors
            if (isCheckError) {
                checkErrors(field, event);
            }

            setNotification((prev: any[]) => {
                const index = prev.findIndex((item: any) => item.key === id);
                // if not found, it might be child component inside parentKey
                if (index === -1 && parentKey) {
                    const parentIndex = prev.findIndex(compA => compA.key === parentKey);
                    if (parentIndex !== -1) {
                        const clonePrev = [...prev];
                        const parentData = clonePrev[parentIndex];
                        if (parentData.component) {
                            const childIndex = parentData.component.findIndex((compC: any) => compC.key === id);
                            if (childIndex !== -1) {
                                // update child
                                const childData = [...parentData.component];
                                let childDataIndex = childData[childIndex];
                                childDataIndex = {
                                    ...childDataIndex,
                                    value: event,
                                };
                                childData[childIndex] = { ...childDataIndex };
                                parentData.component = [...childData];
                                clonePrev[parentIndex] = { ...parentData };
                                // update RHF value as well
                                try {
                                    setValue(id, event, { shouldValidate: true, shouldDirty: true });
                                } catch (e) { }
                                // notify (keeps same API)
                                return clonePrev;
                            }
                        }
                    }
                    return prev;
                }
                if (index === -1) {
                    return prev;
                }
                const updated = [...prev];
                let updatedIndex = updated[index];

                if (updatedIndex.value && typeof updatedIndex.value === "object" && !Array.isArray(updatedIndex.value)) {
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
                } else if (updatedIndex.value && updatedIndex.no_of_frames && Array.isArray(updatedIndex.value)) {
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

                // update RHF value as well
                try {
                    setValue(id, event, { shouldValidate: true, shouldDirty: true });
                } catch (e) { }

                return updated;
            });
        },
        [checkErrors, setValue],
    );

    const updateField = useCallback(
        (field: any, value: any, keyParam?: string | any, parentKey?: string, idx?: number) => {
            try {
                setValue(field.key, value, { shouldValidate: true, shouldDirty: true });
            } catch (e) {
                // ignore if RHF setValue fails
            }
            onChangeText(value, field, field.key, keyParam ?? null, parentKey, idx);
            if (isCheckError) {
                checkErrors(field, value);
            }
            trigger(field.key).catch(() => { });
        },
        [onChangeText, setValue, trigger, checkErrors],
    );

    // --- end of RHF & update logic ---

    useFocusEffect(
        useCallback(() => {
            console.log("ME52RETAILERTESTING", "notificationId", notificationId);
            console.log("ME52RETAILERTESTING", "notificationId", notificationId);

            if (notificationId) {
                fetchNotificationDetails(notificationId);
            } else {
                if (route.params && route.params.type) {
                    const filterKey = route.params.type === "image" ? "video" : "images";
                    console.log("ME52RETAILERTESTING", "Filter key here ", filterKey);
                    setNotification(addNotificationFormTitleDescription.filter(addNoti => addNoti.key !== filterKey));
                } else {
                    setNotification([...addNotificationFormTitleDescription]);
                }
                console.log("ME52RETAILERTESTING", "setListData");
                setListData({
                    pageno: 1,
                    pagesize: 10,
                    sort: "createdAt",
                    sortDirection: -1,
                    search: "",
                });
            }

            return () => {
                setNotification(addNotificationFormTitleDescription);
                setListData({
                    pageno: 0,
                    pagesize: 10,
                    sort: "name",
                    sortDirection: -1,
                    search: "",
                });
                setErrors({});
                setStatus("SUCCESS");
                setUsersList({ uList: [], selectedUserList: [] });
                setShowSelectedList("select_more");
            };
        }, []),
    );

    useFocusEffect(
        useCallback(() => {
            let notis = addNotificationFormTitleDescription;
            if (route.params && notificationtype) {
                const filterKey = notificationtype === "image" ? "video" : "images";
                console.log("ME52RETAILERTESTING", "Filter key here ", filterKey);
                notis = addNotificationFormTitleDescription.filter(addNoti => addNoti.key !== filterKey);
            }
            if (storedNotification && Object.keys(storedNotification).length) {
                console.log("ME52RETAILERTESTING", "storedNotification useFocusEffect ", storedNotification);

                notis.forEach((noti: any) => {
                    try {
                        if (noti.key === "images") {
                            noti["value"] = storedNotification["images"]?.map((image: string) => {
                                return imageBaseUrl + image;
                            });
                        } else if (noti.key === "video" && storedNotification["video"]) {
                            noti["value"] = imageBaseUrl + storedNotification["video"];
                        } else if (noti.key === "allUsers") {
                            noti["value"] = storedNotification["send_to_all"];
                            if (!storedNotification["send_to_all"]) {
                                const recipients = storedNotification["recipients"]?.map((recipient: any) => {
                                    return {
                                        ...recipient.user,
                                        ...(recipient?.device ? { device: { imei1: recipient.device } } : { device: { imei1: "imei1" } }),
                                    };
                                });

                                console.log("ME52RETAILERTESTING", "recipients", recipients?.length);
                                if (recipients) {
                                    console.log("ME52RETAILERTESTING", "SETTING SELECTED USERS");
                                    setUsersList(prev => {
                                        return { ...prev, selectedUserList: [...recipients] };
                                    });
                                }
                            }
                        } else if (storedNotification.hasOwnProperty(noti.key)) {
                            if (noti.key === "datetime") {
                                try {
                                    const result = extractDateAndTimeTimestampsFromIST(storedNotification["datetime"]);
                                    noti.component[0].value = result.date;
                                    noti.component[0].maxDate = result.date + 86400 * 3;
                                    noti.component[1].value = result.time;
                                } catch (error: any) {
                                    console.error("ME52RETAILERTESTING", error.message);
                                }
                                console.log("ME52RETAILERTESTING", ">>>>>>>>>>", "DATETIME", noti["value"]);
                            } else {
                                noti.value = storedNotification[noti.key];
                            }
                        }
                    } catch (err) {
                        console.log("ME52RETAILERTESTING", err);
                    }
                });

                setNotification([...notis]);
                console.log("ME52RETAILERTESTING", "setListData");
                setListData({
                    pageno: 1,
                    pagesize: 10,
                    sort: "createdAt",
                    sortDirection: -1,
                    search: "",
                });
                setStatus("SUCCESS");
            } else {
                setStatus("SUCCESS");
            }
        }, [storedNotification]),
    );

    const extractDateAndTimeTimestampsFromIST = (isoString: string): { date: number; time: number } => {
        const [datePart, timePartWithZ] = isoString.split("T");
        const timePart = timePartWithZ.replace("Z", "");

        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute, secondPart] = timePart.split(":");
        const [second, millisecond] = secondPart.includes(".") ? secondPart.split(".").map(Number) : [Number(secondPart), 0];

        const dateTimestamp = Date.UTC(year, month - 1, day, 0, 0, 0) / 1000;
        const timeTimestamp = Date.UTC(year, month - 1, day, Number(hour), Number(minute), second, millisecond || 0) / 1000;

        return {
            date: dateTimestamp,
            time: timeTimestamp,
        };
    };

    useFocusEffect(
        useCallback(() => {
            console.log("ME52RETAILERTESTING", "Route params here ", route.params);
            if (route.params && route.params.type) {
                const filterKey = route.params.type === "image" ? "video" : "images";
                console.log("ME52RETAILERTESTING", "Filter key here ", filterKey);
                setNotification(addNotificationFormTitleDescription.filter(addNoti => addNoti.key !== filterKey));
            }
        }, [route.params]),
    );

    const fetchNotificationDetails = useCallback(
        async (id: string) => {
            if (id) {
                try {
                    setStatus("LOADING");
                    const response = await getNotificationById(id, users.token);
                    const notification = response?.data;

                    if (notification) {
                        setStoredNotification(notification);
                    } else {
                        setStatus("SUCCESS");
                    }
                } catch (error) {
                    console.log("ME52RETAILERTESTING", "Fetch key types error ", error);
                    console.log("ME52RETAILERTESTING", error);
                    setStatus("ERROR");
                }
            }
        },
        [users.token],
    );

    useLayoutEffect(() => {
        console.log("ME52RETAILERTESTING", "listData", listData);
        if (listData.pageno) {
            console.log("ME52RETAILERTESTING", "loadUsers useEffect", listData);
            loadUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [listData]);

    const buildApiData = (): { apiData: Record<string, any>; hasError: boolean } => {
        const apiData: Record<string, any> = {};
        let hasError = false;

        for (const noti of notification) {
            if (noti.required) {
                if (!noti.value && !Array.isArray(noti.value)) {
                    setErrors((prev: any) => ({ ...prev, [noti.key]: `${noti.label} is required` }));
                    hasError = true;
                } else if (Array.isArray(noti.value) && noti.value.length === 0) {
                    setErrors((prev: any) => ({ ...prev, [noti.key]: `${noti.label} is required` }));
                    hasError = true;
                } else {
                    setErrors((prev: any) => ({ ...prev, [noti.key]: null }));
                }
            }

            if (noti.component) {
                for (const comp of noti.component) {
                    if (comp.required) {
                        if (!comp.value && !Array.isArray(comp.value)) {
                            setErrors((prev: any) => ({ ...prev, [comp.key]: `${comp.label} is required` }));
                            hasError = true;
                        } else if (Array.isArray(comp.value) && comp.value.length === 0) {
                            setErrors((prev: any) => ({ ...prev, [comp.key]: `${comp.label} is required` }));
                            hasError = true;
                        } else {
                            setErrors((prev: any) => ({ ...prev, [comp.key]: null }));
                        }
                    }
                    apiData[comp.key] = comp.value;
                }
            } else {
                apiData[noti.key] = noti.value;
            }
        }

        return { apiData, hasError };
    };

    const validateRecipients = (apiData: Record<string, any>): boolean => {
        if (usersList.selectedUserList && usersList.selectedUserList.length === 0 && !apiData.allUsers) {
            onError("Notification", "Please select one user");
            return false;
        }
        return true;
    };

    const buildRecipients = (apiData: any): { user: string; device: string }[] => {
        if (apiData.allUsers) {
            return [];
        }

        return usersList.selectedUserList.map((selUser: any) => ({
            user: selUser._id,
            ...(selUser?.device?.imei1 ? { device: selUser.device.imei1 } : { device: "imei1" }),
        }));
    };

    const handleMediaUpload = async (apiData: Record<string, any>): Promise<{
        imagesUploaded: string[];
        videoSecureUrl: string;
        videoThumbnailUrl: string;
    }> => {
        const imagesUploaded: string[] = [];
        let videoSecureUrl = "";
        let videoThumbnailUrl = "";

        if ((apiData.images && apiData.images.length) || apiData.video) {
            if (apiData.images && apiData.images.length) {
                for (const image of apiData.images) {
                    if (typeof image === "string") {
                        imagesUploaded.push(image.replace(imageBaseUrl, ""));
                    } else {
                        try {
                            const response = await uploadImageMedia({ file: image }, users.token);

                            if (response?.data && response?.data?.success) {
                                imagesUploaded.push(response.data?.data);
                            }
                        } catch (error) {
                            onError("Notification", "Error while uploading image");
                            return { imagesUploaded: [], videoSecureUrl: "", videoThumbnailUrl: "" };
                        }
                    }
                }
            }

            if (apiData.video) {
                if (typeof apiData.video === "string") {
                    videoSecureUrl = apiData.video.replace(imageBaseUrl, "");
                } else {
                    try {
                        const response = await uploadVideoMedia({ file: apiData.video }, users.token);
                        if (response?.success && response.data) {
                            videoSecureUrl = response.data;
                        }

                        const thumbForUpload = await uploadVideoMedia({ file: apiData.video.video_thumbnail }, users.token);
                        if (thumbForUpload?.success && thumbForUpload.data) {
                            videoThumbnailUrl = thumbForUpload.data;
                        }
                    } catch (error) {
                        console.error("ME52RETAILERTESTING", "Error uploading video:", error);
                        onError("Notification", "Error while uploading video");
                    }
                }
            }
        }

        return { imagesUploaded, videoSecureUrl, videoThumbnailUrl };
    };

    const prepareApiPayload = (
        apiData: Record<string, any>,
        recipients: any[],
        imagesUploaded: string[],
        videoSecureUrl: string,
        send_to_all: boolean,
        videoThumbnailUrl: string,
    ): Record<string, any> => {
        const payload: any = { ...apiData, recipients, send_to_all };

        if (imagesUploaded.length) payload.images = imagesUploaded;
        if (videoSecureUrl) payload.video = videoSecureUrl;
        if (!!apiData?.video?.video_thumbnail && !!videoThumbnailUrl) payload.video_thumbnail = videoThumbnailUrl;

        payload.datetime = createDateTime(apiData.date, apiData.time);

        const apiDatakey = ["title", "description", "datetime", "recipients", "images", "video", "send_to_all"];
        if (!!apiData?.video?.video_thumbnail) {
            apiDatakey.push("video_thumbnail");
        }
        Object.keys(payload).forEach(key => {
            if (!apiDatakey.includes(key)) delete payload[key];
        });

        if (notificationId) {
            payload._id = notificationId;
        }

        return payload;
    };

    const createDateTime = (date: number, time: number) => {
        if (typeof date !== "number" || isNaN(date) || date <= 0) {
            onError("Date Issue", "Invalid date");
        }
        if (typeof time !== "number" || isNaN(time) || time < 0) {
            onError("Time Issue", "Invalid time");
        }

        const dateObj = new Date(date * 1000);
        const timeObj = new Date(time * 1000);

        const year = dateObj.getUTCFullYear();
        const month = dateObj.getUTCMonth();
        const day = dateObj.getUTCDate();

        const hours = timeObj.getUTCHours();
        const minutes = timeObj.getUTCMinutes();
        const seconds = timeObj.getUTCSeconds();

        const combinedUTC = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

        const istDate = new Date(combinedUTC.getTime());

        return istDate.toISOString();
    };

    const submitForm = async (): Promise<void> => {
        if (usersList?.uList?.length === 0 && usersList?.selectedUserList?.length === 0) {
            onError("Notification", `Sorry, you don't have any ${notificationtype} customers yet!`);
            return;
        }

        try {
            const { apiData, hasError } = buildApiData();

            if (hasError) return;

            if (!validateRecipients(apiData)) return;

            setStatus("API_LOADING");

            const recipients = buildRecipients(apiData);
            const { imagesUploaded, videoSecureUrl, videoThumbnailUrl } = await handleMediaUpload(apiData);
            console.log("imagesUploaded, videoSecureUrl, videoThumbnailUrl", imagesUploaded, videoSecureUrl, videoThumbnailUrl);

            if (!imagesUploaded.length && !videoSecureUrl) {
                if (notificationtype === "image")
                    onInfo("Image Upload Failed", "Image upload failed. Please try again.");
                else if (notificationtype === "video") onInfo("Video Upload Failed", "Video upload failed. Please try again.");

                setStatus("ERROR");
                return;
            }
            const payload = prepareApiPayload(apiData, recipients, imagesUploaded, videoSecureUrl, apiData.allUsers, videoThumbnailUrl);

            const response = notificationId ? await updateNotificationService(payload, users.token) : await addNotificationService(payload, users.token);

            if (response?.success) {
                onSuccess("Notification", `Notification ${notificationId ? "Updated" : "Added"} Successfully`);
                navigation.goBack();
            } else {
                onError("Notification", response?.message || "Something went wrong");
            }

            setStatus("SUCCESS");
        } catch (error: any) {
            console.error("ME52RETAILERTESTING", "Error in submitForm:", error);
            setStatus("ERROR");
        }
    };

    const handleSubmit = () => {
        console.log("ME52RETAILERTESTING", "Submit notification ", notification);
        submitForm();
    };

    const loadUsers = async () => {
        console.log("ME52RETAILERTESTING", "\n");
        console.log("ME52RETAILERTESTING", "loadUsers");
        setUserStatus("LOADING");
        try {
            const response = await getNotificationCustomers(
                {
                    id: users.id,
                    pageno: listData.pageno,
                    pagesize: listData.pagesize,
                    sort: listData.sort,
                    sortDirection: listData.sortDirection,
                    search: listData.search,
                    notificationtype,
                },
                users.token,
            );

            let userListData = response.data;

            if (userListData.length === 0) {
                return;
            }

            const selectedUsers = usersList?.selectedUserList;
            userListData = userListData?.map((uList: any) => {
                if (selectedUsers && selectedUsers.length !== 0) {
                    const isSelectedIndex = selectedUsers.findIndex((su: any) => su._id === uList._id);
                    if (isSelectedIndex !== -1) {
                        return { ...uList, check: true };
                    }
                }
                return { ...uList, check: false };
            });

            console.log("ME52RETAILERTESTING", "User list data ", userListData?.length);
            setUsersList(prev => {
                return { ...prev, uList: [...userListData] };
            });
            setUserStatus("SUCCESS");
        } catch (error) {
            console.log("ME52RETAILERTESTING", "Error in loadUsers in add notifications ", error);
            setUserStatus("ERROR");
        }
    };

    const handleUserList = async (type: string) => {
        console.log("ME52RETAILERTESTING", "handleUserList");
        setShowSelectedList(type);
        if (type === "select_more") {
            await loadUsers();
        } else {
            setUsersList(prev => ({ ...prev, uList: [] }));
        }
    };

    const handleCheckboxSelect = (item: any) => {
        console.log("ME52RETAILERTESTING", "Handle checkbox select called ", item._id);
        if (!item.check) {
            const cloneUserList = [...usersList.uList];
            const selectedUser = cloneUserList.findIndex(cl => cl._id === item._id);
            if (selectedUser != -1) {
                cloneUserList[selectedUser] = { ...cloneUserList[selectedUser], check: true };
            }

            let cloneSelectedUserList = [...usersList.selectedUserList];
            const selectedUserIdx = cloneSelectedUserList.findIndex(scl => scl._id === item._id);
            if (selectedUserIdx === -1) {
                cloneSelectedUserList = [...usersList.selectedUserList, { ...item, check: true }];
            }
            setUsersList(prev => ({ ...prev, uList: cloneUserList, selectedUserList: cloneSelectedUserList }));
        } else {
            const cloneUserList = [...usersList.uList];
            const selectedUser = cloneUserList.findIndex(cl => cl._id === item._id);
            if (selectedUser != -1) {
                cloneUserList[selectedUser] = { ...cloneUserList[selectedUser], check: false };
            }

            let cloneSelectedUserList = [...usersList.selectedUserList];
            const selectedUserIdx = cloneSelectedUserList.findIndex((scl) => scl._id === item._id);
            if (selectedUserIdx !== -1) {
                cloneSelectedUserList = usersList.selectedUserList.filter((sul: any) => sul._id !== item._id);
            }

            setUsersList(prev => ({ ...prev, uList: cloneUserList, selectedUserList: cloneSelectedUserList }));
        }
    };

    const onSearchChange = (input: string) => {
        console.log("ME52RETAILERTESTING", "onSearchChange", input);
        setListData(prev => ({ ...prev, search: input }));
    };

    const renderItems = ({ item }: any) => {
        return (
            <View style={[styles.rowContainer]}>
                <View style={[boxShadow, { backgroundColor: "#fff", flexDirection: "row", alignItems: "center" }]}>
                    <Image source={item?.device?.loan?.photo ? { uri: item?.device?.loan?.photo } : require("../assets/image_placeholder.png")} alt={item.name} resizeMode="cover" style={[styles.images]} />
                    <View style={[styles.contentContainer]}>
                        <View>
                            <Text style={[{ color: colors.text, fontSize: 18, fontWeight: "600" }]}>{item.name}</Text>
                            <Text style={[{ color: colors.text }]}>{`${item.phone_country_code.indexOf("+") != -1 ? item.phone_country_code : "+" + item.phone_country_code} ${item.phone}`}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => handleCheckboxSelect(item)}>
                            {item.check && <Image source={require("../assets/checkbox.png")} style={[styles.checkbox]} />}
                            {!item.check && <Image source={require("../assets/uncheckbox.png")} style={[styles.checkbox]} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    // --- Manual rendering of the form fields (replacing <Forms />) ---
    const renderFormFieldsJSX = useMemo(() => {
        return notification.map((field: any) => {
            // dynamic filter: hide video/images based on route param type
            if (route.params && route.params.type) {
                const filterKey = route.params.type === "image" ? "video" : "images";
                if (field.key === filterKey) return null;
            }

            switch (field.type) {
                case "text":
                case "number":
                    return (
                        <View key={field.key}>
                            <Input
                                control={control}
                                name={field.key}
                                rules={{
                                    required: field.required ? `${field.label} is required` : false,
                                    validate: (val: any) => {
                                        if (["imei1", "imei2"].includes(field.key)) {
                                            if (!val) return `${field.label} is required`;
                                            if (!/^\d{15}$/.test(val)) return `${field.label} must be 15 digits`;
                                        }
                                        if (field.key === "pincode") {
                                            if (!val) return `${field.label} is required`;
                                            if (val?.length !== 6) return `${field.label} should be 6 digits`;
                                        }
                                        return true;
                                    },
                                }}
                                placeholder={field.label}
                                value={field.value}
                                maxLength={field.maxLength}
                                keyboardType={field.keyboardType || field.type}
                                style={styles.container}
                                inputStyle={field.key === "address" ? { height: getHeight(100) } : undefined}
                                readonly={field.readonly}
                                icon={field.showIcon}
                                formData={notification}
                                autoCapitalize={field.autoCapitalize}
                                autoCorrect={field.autoCorrect}
                                error={errors[field.key]}
                                onChangeText={(e: any) => updateField(field, e)}
                            />
                        </View>
                    );

                case "textArea":
                    return (
                        <View key={field.key}>
                            <TextArea
                                control={control}
                                name={field.key}
                                rules={{ required: field.required ? `${field.label} is requireddd` : false }}
                                placeholder={field.label}
                                value={field.value}
                                style={styles.container}
                                error={errors[field.key]}
                                onChangeText={(e: any) => updateField(field, e)}
                            />
                        </View>
                    );

                case "uploadPicker":
                    return (
                        <View key={field.key}>
                            <UploadPicker
                                width={field.width}
                                label={field.label}
                                height={field.height}
                                imageOrVideo={field.imageOrVideo}
                                value={field.value}
                                onChangeText={(e: any) => updateField(field, e)}
                                readonly={field.readonly}
                                error={errors[field.key]}
                                style={styles.container}
                                caption={field.caption}
                                maxSize={field.maxSize}
                            />
                        </View>
                    );

                case "date":
                    return (
                        <View key={field.key}>
                            <Datepicker
                                control={control}
                                name={field.key}
                                rules={{ required: field.required ? `${field.label} is required` : false }}
                                value={field.value}
                                error={errors[field.key]}
                                onChangeText={(e: any) => updateField(field, e)}
                                style={styles.container}
                                readonly={field.readonly}
                                maxDate={field.maxDate}
                                placeholder={field.placeholder}
                                minDate={field.minDate}
                            />
                        </View>
                    );

                case "time":
                    return (
                        <View key={field.key}>
                            <TimePicker
                                control={control}
                                name={field.key}
                                rules={{ required: field.required ? `${field.label} is required` : false }}
                                value={field.value}
                                onChangeText={(e: any) => updateField(field, e)}
                                label={field.label}
                            />
                        </View>
                    );

                case "twoColumn":
                    if (field.component) {
                        const length = field.component.length;
                        return (
                            <View key={field.key} style={[styles.twoColumn, commonStyle.mb10]}>
                                {field.component.map((comp: any) => {
                                    switch (comp.type) {
                                        case "date":
                                            return (
                                                <View
                                                    key={comp.key}
                                                    style={[
                                                        length === 2 ? styles.width48 : styles.width25,
                                                        { marginTop: 5 },
                                                    ]}
                                                >
                                                    <Datepicker
                                                        control={control}
                                                        name={comp.key}
                                                        rules={{
                                                            required: comp.required ? `${comp.label} is required` : false,
                                                        }}
                                                        value={comp.value}
                                                        error={errors[comp.key]}
                                                        onChangeText={(e: any) => updateField(comp, e, null, field.key)}
                                                        readonly={comp.readonly}
                                                        maxDate={comp.maxDate}
                                                        minDate={comp.minDate}
                                                        placeholder={comp.label}
                                                    />
                                                </View>
                                            );

                                        case "time":
                                            return (
                                                <View
                                                    key={comp.key}
                                                    style={[
                                                        length === 2 ? styles.width48 : styles.width25,
                                                        commonStyle.mt5,
                                                    ]}
                                                >
                                                    <TimePicker
                                                        control={control}
                                                        name={comp.key}
                                                        rules={{
                                                            required: comp.required ? `${comp.label} is required` : false,
                                                        }}
                                                        value={comp.value}
                                                        onChangeText={(e: any) => updateField(comp, e, null, field.key)}
                                                        placeholder={comp.label}
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

                case "checkbox":
                    return (
                        <View key={field.key}>
                            <Checkbox
                                value={field.value}
                                label={field.label}
                                onChangeText={(e: any) => updateField(field, e)}
                                readonly={field.readonly}
                                terms={field.terms}
                                border={field.border}
                                error={errors[field.key]}
                            />
                        </View>
                    );

                default:
                    return null;
            }
        });
    }, [notification, errors, route.params?.type, updateField, control]);


    return (
        <CRootContainer style={[root]}>
            {status === "API_LOADING" && (
                <Overlay>
                    <Loader center={true} />
                </Overlay>
            )}
            <CHeader style={commonStyle.ph25} title={notificationId ? `Edit ${notificationtype === "video" ? "Video" : "Image"} Notification` : notificationtype === "video" ? "Add Video Notification" : "Add Image Notification"} />

            <View style={commonStyle.flex}>
                <FlatList
                    contentContainerStyle={styles.commonLayout}
                    data={showSelectedList === "select_more" ? usersList["uList"] : usersList["selectedUserList"]}
                    renderItem={userstatus === "SUCCESS" && !notification.find((noti: any) => noti.key === "allUsers")?.value ? renderItems : null}
                    keyExtractor={(item) => item._id}
                    extraData={showSelectedList === "select_more" ? usersList["uList"] : usersList["selectedUserList"]}
                    ListHeaderComponent={
                        <View>
                            {renderFormFieldsJSX}

                            {!notification.find((noti: any) => noti.key === "allUsers")?.value && (
                                <>
                                    <Text style={[labelStyle, { color: colors.textDarker, marginTop: moderateScale(20), fontSize: 18 }]}>Customers list</Text>
                                    <SearchInput placeholder="Search Customers ..." value={listData.search} onSearchInput={(e) => onSearchChange(e)} />
                                    <View style={[buttonRow, { marginBottom: 20, alignItems: "center" }]}>
                                        <TouchableOpacity onPress={() => handleUserList("select_more")} style={[boxShadow, { backgroundColor: "#fff", width: "48%", borderColor: showSelectedList === "select_more" ? colors.orange : colors.white, borderWidth: 2, height: 50, paddingVertical: 10 }]} activeOpacity={0.8}>
                                            <Text style={[{ color: showSelectedList === "select_more" ? colors.orange : "#8F999E", fontSize: 16 }]}>Select More</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleUserList("selected")} style={[boxShadow, { backgroundColor: "#fff", width: "48%", borderColor: showSelectedList === "selected" ? colors.orange : colors.white, borderWidth: 2, height: 50, paddingVertical: 10 }]} activeOpacity={0.8}>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                                <Text style={[{ color: showSelectedList === "selected" ? colors.orange : "#8F999E", fontSize: 16, }]}>Selected</Text>
                                                {usersList.selectedUserList.length !== 0 && <Text style={{ color: colors.orange, marginRight: moderateScale(5), paddingVertical: moderateScale(2), paddingHorizontal: moderateScale(5), backgroundColor: "#F3931454", borderRadius: moderateScale(5) }}>{usersList.selectedUserList.length}</Text>}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )}
                            {userstatus === "LOADING" && <Loader />}
                        </View>
                    }
                    ListEmptyComponent={() =>
                        !notification.find((noti: any) => noti.key === "allUsers")?.value ? (
                            <View style={commonStyle.center}>
                                <Text style={[styles.noDataStyle, { color: colors.textDarker }]}>No Customer Found</Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={() => (
                        <View style={commonStyle.mt10}>
                            <Button variant="darker" title="Submit" onPress={() => handleSubmit()} style={{ width: "100%" }} />
                            <Footer />
                        </View>
                    )}
                />
            </View>
        </CRootContainer>
    );
};

const styles = StyleSheet.create({
    images: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(16),
        marginRight: moderateScale(10),
        backgroundColor: "#e5e5e5ff",
    },
    commonLayout: {
        ...commonStyle.ph25,
    },
    rowContainer: {
        minHeight: getHeight(70),
        borderRadius: moderateScale(5),
        ...commonStyle.mb20,
    },
    contentContainer: {
        flexDirection: "row",
        width: "80%",
        justifyContent: "space-between",
        alignItems: "center",
    },
    checkbox: {
        alignItems: "center",
    },
    bttn: {
        flex: 1,
    },
    noDataStyle: {
        fontSize: 16,
        textAlign: "center",
        padding: moderateScale(20),
    },
    container: {
        ...commonStyle.mt5,
        ...commonStyle.mb20,
        zIndex: -5,
    },
    twoColumn: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    width48: {
        width: "48%",
    },
    width25: {
        width: "31%",
    },
});

export default AddEditNotification;
