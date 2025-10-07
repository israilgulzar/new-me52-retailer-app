import { addNotificationService, updateNotificationService, getNotificationById, uploadVideoMedia, uploadImageMedia } from "../services/notificattions"
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { boxShadow, buttonRow, labelStyle, root } from "../styles/styles"
import { useCallback, useLayoutEffect, useState } from "react"
import { NavigationProp, useFocusEffect } from "@react-navigation/native"
import { onError, onInfo, onSuccess } from "../utility/Toaster"
import { getNotificationCustomers } from "../services/customer"
import SearchInput from "../components/SearchInput"
import { useTheme } from "../theme/ThemeProvider"
import { useAuth } from "../context/AuthContext"
import Overlay from "../components/Overlat"
import Loader from "../components/Loader"
import Footer from "../components/Footer"
import Button from "../components/Button"
import Forms from "../components/Forms"
import { IMAGE_BASE_URL } from "../environment"
import { commonStyle } from "../theme"
import { getHeight, moderateScale } from "../common/constants"
import CRootContainer from "../components/CRootContainer"
import CHeader from "../components/CHeader"

type STATUS = "SUCCESS" | "LOADING" | "ERROR" | "API_LOADING";
const imageBaseUrl = IMAGE_BASE_URL;

const AddEditNotification = ({ route, navigation }: { route: any, navigation: NavigationProp<any> }) => {


    const notificationId = route.params?.notificationId;
    const notificationtype = route.params?.type;

    const addNotificationFormTitleDescription = [
        {
            "label": "Title",
            "name": "title",
            "key": "title",
            "type": "text",
            "value": "",
            "required": true
        },
        {
            "label": "Description",
            "name": "description",
            "key": "description",
            "type": "textArea",
            "value": "",
            "required": true
        },
        {
            "label": "Images",
            "name": "images",
            "key": "images",
            "type": "uploadPicker",
            "value": [],
            "width": 100,
            "height": 70,
            "multiple": true,
            "no_of_frames": 1,
            "imageOrVideo": "image",
            "required": true,
            "maxSize": 2.5 * 1024 * 1024
        },
        {
            "label": "Video",
            "name": "video",
            "key": "video",
            "type": "uploadPicker",
            "value": "",
            "width": 340,
            "height": 120,
            "caption": "Upload Video here",
            "multiple": false,
            // "no_of_frames": 10,
            "imageOrVideo": "video",
            "required": true,
            "maxSize": 25 * 1024 * 1024
        },
        {
            "type": "twoColumn",
            "key": "datetime",
            component: [
                {
                    "label": "Date",
                    "name": "date",
                    "key": "date",
                    "type": "date",
                    "value": Math.floor(Date.now() / 1000),
                    "maxDate": Math.floor(Date.now() / 1000) + (86400 * 5),
                    "minDate": new Date(),
                    "required": true
                },
                {
                    "label": "Time",
                    "name": "time",
                    "key": "time",
                    "type": "time",
                    "value": Math.floor(Date.now() / 1000),
                    "required": true
                },
            ]
        },
        {
            "name": "allUsers",
            "label": "All users with this key feature",
            "type": "checkbox",
            "key": "allUsers",
            "required": false,
            "value": false,
            "errors": "",
            "border": true
        }
    ]

    const [notification, setNotification] = useState<any>([])
    const [storedNotification, setStoredNotification] = useState<any>({})

    const [errors, setErrors] = useState({})
    const [showSelectedList, setShowSelectedList] = useState("select_more")
    const [status, setStatus] = useState<STATUS>("SUCCESS")
    const [userstatus, setUserStatus] = useState<STATUS>("SUCCESS")

    const [usersList, setUsersList] = useState<Record<string, any>>({
        uList: [],
        selectedUserList: []
    })
    const [listData, setListData] = useState({
        pageno: 0,
        pagesize: 10,
        sort: "createdAt",
        sortDirection: -1,
        search: ""
    })
    const { colors } = useTheme()
    const { users } = useAuth()

    useFocusEffect(useCallback(() => {

        console.log('ME52RETAILERTESTING', "notificationId", notificationId);
        console.log('ME52RETAILERTESTING', "notificationId", notificationId);

        if (notificationId) {
            fetchNotificationDetails(notificationId);
        }
        else {
            if (route.params && route.params.type) {
                const filterKey = route.params.type === "image" ? "video" : "images"
                console.log('ME52RETAILERTESTING', "Filter key here ", filterKey)
                setNotification(addNotificationFormTitleDescription.filter((addNoti) => addNoti.key !== filterKey))
            } else {
                setNotification([...addNotificationFormTitleDescription]);
            }
            //this is set here to trigger user load
            console.log('ME52RETAILERTESTING', "setListData");
            setListData({
                pageno: 1,
                pagesize: 10,
                sort: "createdAt",
                sortDirection: -1,
                search: ""
            })
        }

        return () => {
            setNotification(addNotificationFormTitleDescription)
            setListData({
                pageno: 0,
                pagesize: 10,
                sort: "name",
                sortDirection: -1,
                search: ""
            })
            setErrors({})
            setStatus("SUCCESS")
            setUsersList({ uList: [], selectedUserList: [] })
            setShowSelectedList("select_more")
        }
    }, []))

    useFocusEffect(useCallback(() => {

        let notis = addNotificationFormTitleDescription;
        if (route.params && notificationtype) {
            const filterKey = notificationtype === "image" ? "video" : "images"
            console.log('ME52RETAILERTESTING', "Filter key here ", filterKey)
            notis = addNotificationFormTitleDescription.filter((addNoti) => addNoti.key !== filterKey)
        }
        if (storedNotification && Object.keys(storedNotification).length) {

            console.log('ME52RETAILERTESTING', "storedNotification useFocusEffect ", storedNotification);

            notis.forEach((noti: any) => {
                try {

                    if (noti.key === "images") {

                        noti['value'] = storedNotification['images']?.map((image: string) => { return imageBaseUrl + image });

                    } else if (noti.key === "video" && storedNotification['video']) {

                        noti['value'] = imageBaseUrl + storedNotification['video']

                    } else if (noti.key === "allUsers") {

                        noti['value'] = storedNotification['send_to_all'];

                        if (!storedNotification['send_to_all']) {
                            const recipients = storedNotification['recipients']?.map((recipient: any) => {
                                return {
                                    ...recipient.user,
                                    ...(recipient?.device ? { device: { imei1: recipient.device } } : { device: { imei1: 'imei1' } }),
                                }
                            });

                            console.log('ME52RETAILERTESTING', "recipients", recipients?.length);
                            if (recipients) {
                                console.log('ME52RETAILERTESTING', "SETTING SELECTED USERS");
                                setUsersList((prev) => {
                                    return { ...prev, selectedUserList: [...recipients] }
                                })
                            }
                        }

                    } else if (storedNotification.hasOwnProperty(noti.key)) {

                        if (noti.key === "datetime") {

                            try {

                                console.log('ME52RETAILERTESTING', " ");
                                console.log('ME52RETAILERTESTING', " ");
                                console.log('ME52RETAILERTESTING', " ");
                                console.log('ME52RETAILERTESTING', " ");
                                console.log('ME52RETAILERTESTING', " ");
                                const result = extractDateAndTimeTimestampsFromIST(storedNotification['datetime']);

                                noti.component[0].value = result.date
                                noti.component[0].maxDate = result.date + (86400 * 3)
                                noti.component[1].value = result.time

                            } catch (error: any) {
                                console.error("ME52RETAILERTESTING", error.message);
                            }

                            console.log('ME52RETAILERTESTING', ">>>>>>>>>>", "DATETIME", noti['value']);

                        } else {

                            noti.value = storedNotification[noti.key];

                        }


                    }
                } catch (err) {
                    console.log('ME52RETAILERTESTING', err);
                }
            })

            setNotification([...notis]);
            //this is set here to trigger user load
            console.log('ME52RETAILERTESTING', "setListData");
            setListData({
                pageno: 1,
                pagesize: 10,
                sort: "createdAt",
                sortDirection: -1,
                search: ""
            })
            setStatus("SUCCESS")

        } else {
            setStatus("SUCCESS")
        }

    }, [storedNotification]))

    const extractDateAndTimeTimestampsFromIST = (
        isoString: string
    ): { date: number; time: number } => {
        // 1. Split parts
        const [datePart, timePartWithZ] = isoString.split("T");
        const timePart = timePartWithZ.replace("Z", "");

        console.log('ME52RETAILERTESTING', "Raw ISO:", isoString);
        console.log('ME52RETAILERTESTING', "Date Part:", datePart);
        console.log('ME52RETAILERTESTING', "Time Part:", timePart);

        // 2. Parse date
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute, secondPart] = timePart.split(":");
        const [second, millisecond] = secondPart.includes(".")
            ? secondPart.split(".").map(Number)
            : [Number(secondPart), 0];

        console.log('ME52RETAILERTESTING', "Parsed Year:", year);
        console.log('ME52RETAILERTESTING', "Parsed Month (0-based):", month - 1);
        console.log('ME52RETAILERTESTING', "Parsed Day:", day);
        console.log('ME52RETAILERTESTING', "Parsed Hours:", hour);
        console.log('ME52RETAILERTESTING', "Parsed Minutes:", minute);
        console.log('ME52RETAILERTESTING', "Parsed Seconds:", second);
        console.log('ME52RETAILERTESTING', "Parsed Milliseconds:", millisecond || 0);

        // 3. Date-only timestamp (00:00 IST interpreted as UTC)
        const dateTimestamp = Date.UTC(year, month - 1, day, 0, 0, 0) / 1000;

        // 4. Time timestamp (full timestamp)
        const timeTimestamp =
            Date.UTC(year, month - 1, day, Number(hour), Number(minute), second, millisecond || 0) / 1000;

        console.log('ME52RETAILERTESTING', "Final date timestamp:", dateTimestamp);
        console.log('ME52RETAILERTESTING', "Final time timestamp:", timeTimestamp);

        return {
            date: dateTimestamp,
            time: timeTimestamp,
        };
    };

    useFocusEffect(useCallback(() => {
        console.log('ME52RETAILERTESTING', "Route params here ", route.params)
        if (route.params && route.params.type) {
            const filterKey = route.params.type === "image" ? "video" : "images"
            console.log('ME52RETAILERTESTING', "Filter key here ", filterKey)
            setNotification(addNotificationFormTitleDescription.filter((addNoti) => addNoti.key !== filterKey))
        }
    }, [route.params]))

    const fetchNotificationDetails = useCallback(async (id: string) => {
        if (id) {
            try {

                setStatus("LOADING")
                const response = await getNotificationById(id, users.token)
                const notification = response?.data;

                if (notification) {
                    setStoredNotification(notification);
                } else {
                    setStatus("SUCCESS")
                }

            } catch (error) {
                console.log('ME52RETAILERTESTING', "Fetch key types error ", error)
                console.log('ME52RETAILERTESTING', error)
                setStatus("ERROR")
            }

        }
    }, [])

    useLayoutEffect(() => {
        console.log('ME52RETAILERTESTING', "listData", listData);
        if (listData.pageno) {
            console.log('ME52RETAILERTESTING', "loadUsers useEffect", listData);
            loadUsers()
        }
    }, [listData])

    const buildApiData = (): { apiData: Record<string, any>; hasError: boolean } => {
        const apiData: Record<string, any> = {};
        let hasError = false;

        for (const noti of notification) {
            if (noti.required) {
                if (!noti.value && !Array.isArray(noti.value)) {
                    setErrors(prev => ({ ...prev, [noti.key]: `${noti.label} is required` }));
                    hasError = true;
                } else if (Array.isArray(noti.value) && noti.value.length === 0) {
                    setErrors(prev => ({ ...prev, [noti.key]: `${noti.label} is required` }));
                    hasError = true;
                } else {
                    setErrors(prev => ({ ...prev, [noti.key]: null }));
                }
            }

            if (noti.component) {
                for (const comp of noti.component) {
                    if (comp.required) {
                        if (!comp.value && !Array.isArray(comp.value)) {
                            setErrors(prev => ({ ...prev, [comp.key]: `${comp.label} is required` }));
                            hasError = true;
                        } else if (Array.isArray(comp.value) && comp.value.length === 0) {
                            setErrors(prev => ({ ...prev, [comp.key]: `${comp.label} is required` }));
                            hasError = true;
                        } else {
                            setErrors(prev => ({ ...prev, [comp.key]: null }));
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
        if (
            usersList.selectedUserList &&
            usersList.selectedUserList.length === 0 &&
            !apiData.allUsers
        ) {
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
            ...(selUser?.device?.imei1 ? { device: selUser.device.imei1 } : { device: 'imei1' }),
        }));
    };

    const handleMediaUpload = async (apiData: Record<string, any>): Promise<{
        imagesUploaded: string[];
        videoSecureUrl: string;
        videoThumbnailUrl: string;
    }> => {
        const imagesUploaded: string[] = [];
        let videoSecureUrl = '';
        let videoThumbnailUrl = '';

        if ((apiData.images && apiData.images.length) || apiData.video) {
            if (apiData.images && apiData.images.length) {
                for (const image of apiData.images) {
                    if (typeof image === 'string') {
                        imagesUploaded.push(image.replace(imageBaseUrl, ""));
                    } else {
                        try {
                            const response = await uploadImageMedia({ file: image }, users.token);

                            if (response?.data && response?.data?.success) {
                                imagesUploaded.push(response.data?.data);
                            }
                        } catch (error) {
                            onError("Notification", "Error while uploading image");
                            return { imagesUploaded: [], videoSecureUrl: '', videoThumbnailUrl: '' };
                        }
                    }
                }
            }

            if (apiData.video) {
                if (typeof apiData.video === 'string') {
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
        videoThumbnailUrl: string
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
            if (!apiDatakey.includes(key))
                delete payload[key];
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

        // Create separate Date objects
        const dateObj = new Date(date * 1000); // Converts date timestamp to ms
        const timeObj = new Date(time * 1000); // Converts time timestamp to ms

        // Extract components
        const year = dateObj.getUTCFullYear();
        const month = dateObj.getUTCMonth(); // 0-based
        const day = dateObj.getUTCDate();

        const hours = timeObj.getUTCHours();
        const minutes = timeObj.getUTCMinutes();
        const seconds = timeObj.getUTCSeconds();

        // Combine date and time in UTC
        const combinedUTC = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

        // Convert to IST by adding 5 hours 30 minutes
        const istDate = new Date(combinedUTC.getTime());

        return istDate.toISOString();

    }

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
            console.log('imagesUploaded, videoSecureUrl, videoThumbnailUrl', imagesUploaded, videoSecureUrl, videoThumbnailUrl)

            if (!imagesUploaded.length && !videoSecureUrl) {
                if (notificationtype === "image") onInfo(
                    "Image Upload Failed",
                    "Image upload failed. Please try again."
                )
                else if (notificationtype === "video") onInfo("Video Upload Failed", "Video upload failed. Please try again.")

                setStatus("ERROR");
                return;
            }
            const payload = prepareApiPayload(apiData, recipients, imagesUploaded, videoSecureUrl, apiData.allUsers, videoThumbnailUrl);

            const response = notificationId
                ? await updateNotificationService(payload, users.token)
                : await addNotificationService(payload, users.token);

            if (response?.success) {
                onSuccess("Notification", `Notification ${notificationId ? 'Updated' : 'Added'} Successfully`);
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
        console.log('ME52RETAILERTESTING', "Submit notification ", notification)
        submitForm()
    }

    const loadUsers = async () => {
        console.log('ME52RETAILERTESTING', "\n");
        console.log('ME52RETAILERTESTING', "loadUsers");
        setUserStatus("LOADING")
        try {
            const response = await getNotificationCustomers({
                id: users.id,
                pageno: listData.pageno,
                pagesize: listData.pagesize,
                sort: listData.sort,
                sortDirection: listData.sortDirection,
                search: listData.search,
                notificationtype
            },
                users.token)

            let userListData = response.data

            if (userListData.length === 0) {
                return
            }

            const selectedUsers = usersList?.selectedUserList;
            console.log('ME52RETAILERTESTING', "\n");
            console.log('ME52RETAILERTESTING', "selectedUsers", selectedUsers.length);
            userListData = userListData?.map((uList: any) => {
                if (selectedUsers && selectedUsers.length !== 0) {
                    const isSelectedIndex = selectedUsers.findIndex((su: any) => su._id === uList._id)
                    if (isSelectedIndex !== -1) {
                        return { ...uList, check: true }
                    }
                }
                return { ...uList, check: false }
            })

            console.log('ME52RETAILERTESTING', "User list data ", userListData?.length)
            setUsersList((prev) => {
                return { ...prev, uList: [...userListData] }
            })
            setUserStatus("SUCCESS")
        } catch (error) {
            console.log('ME52RETAILERTESTING', "Error in loadUsers in add notifications ", error)
            setUserStatus("ERROR")
        }
    }

    const handleUserList = async (type: string) => {
        console.log('ME52RETAILERTESTING', "handleUserList");
        setShowSelectedList(type)
        if (type === "select_more") {
            //Show users list
            await loadUsers()
        } else {
            setUsersList((prev) => ({ ...prev, uList: [] }))
            //Show selected users
        }
    }

    const handleCheckboxSelect = (item: any) => {
        console.log('ME52RETAILERTESTING', "Handle checkbox select called ", item._id)
        if (!item.check) {
            const cloneUserList = [...usersList.uList]
            const selectedUser = cloneUserList.findIndex(cl => cl._id === item._id)
            if (selectedUser != -1) {
                cloneUserList[selectedUser] = { ...cloneUserList[selectedUser], check: true }
            }

            let cloneSelectedUserList = [...usersList.selectedUserList]
            const selectedUserIdx = cloneSelectedUserList.findIndex((scl) => scl._id === item._id)
            if (selectedUserIdx === -1) {
                cloneSelectedUserList = [...usersList.selectedUserList, { ...item, check: true }]
            }
            setUsersList((prev) => ({ ...prev, uList: cloneUserList, selectedUserList: cloneSelectedUserList }))

        } else {
            const cloneUserList = [...usersList.uList]
            const selectedUser = cloneUserList.findIndex(cl => cl._id === item._id)
            if (selectedUser != -1) {
                cloneUserList[selectedUser] = { ...cloneUserList[selectedUser], check: false }
            }

            let cloneSelectedUserList = [...usersList.selectedUserList]
            const selectedUserIdx = cloneSelectedUserList.findIndex((scl) => scl._id === item._id)
            if (selectedUserIdx !== -1) {
                cloneSelectedUserList = usersList.selectedUserList.filter((sul: any) => sul._id !== item._id)
            }

            setUsersList((prev) => ({ ...prev, uList: cloneUserList, selectedUserList: cloneSelectedUserList }))
        }
    }

    const onSearchChange = (input: string) => {
        console.log('ME52RETAILERTESTING', "onSearchChange", input);
        setListData((prev) => ({ ...prev, search: input }))
    }

    const renderItems = ({ item }: any) => {
        return (
            <View style={[styles.rowContainer]}>
                <View style={[boxShadow, { backgroundColor: "#fff", flexDirection: "row", alignItems: "center" }]}>
                    <Image source={item?.device?.loan?.photo ? { uri: item?.device?.loan?.photo } : require("../assets/image_placeholder.png")} alt={item.name} resizeMode="cover" style={[styles.images]} />
                    <View style={[styles.contentContainer]}>
                        <View>
                            <Text style={[{ color: colors.text, fontSize: 18, fontWeight: 600 }]}>{item.name}</Text>
                            <Text style={[{ color: colors.text }]}>{`${item.phone_country_code.indexOf("+") != -1 ? item.phone_country_code : '+' + item.phone_country_code} ${item.phone}`}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} onPress={() => handleCheckboxSelect(item)}>
                            {item.check && <Image source={require("../assets/checkbox.png")} style={[styles.checkbox]} />}
                            {!item.check && <Image source={require("../assets/uncheckbox.png")} style={[styles.checkbox]} />}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <CRootContainer style={[root]}>
            {status === "API_LOADING" &&
                <Overlay>
                    <Loader center={true} />
                </Overlay>}
            <CHeader
                style={commonStyle.ph25}
                title={notificationId ? `Edit ${notificationtype === "video" ? 'Video' : 'Image'} Notification` : notificationtype === 'video' ? 'Add Video Notification' : 'Add Image Notification'}
            />

            <View style={commonStyle.flex} >
                <FlatList
                    contentContainerStyle={styles.commonLayout}
                    data={showSelectedList === "select_more" ? usersList['uList'] : usersList['selectedUserList']}
                    renderItem={userstatus === "SUCCESS" && !notification.find((noti: any) => noti.key === "allUsers")?.value ? renderItems : null}
                    keyExtractor={(item) => item._id}
                    extraData={showSelectedList === "select_more" ? usersList['uList'] : usersList['selectedUserList']}
                    ListHeaderComponent={
                        <View >
                            <Forms formFields={notification} formState={notification}
                                isCheckError={true} setFormState={setNotification} errors={errors} setErrors={setErrors} colors={colors} />
                            {!notification.find((noti: any) => noti.key === "allUsers")?.value &&
                                <>
                                    <Text style={[labelStyle, { color: colors.textDarker, marginTop: moderateScale(20), fontSize: 18 }]}>Customers list</Text>
                                    <SearchInput placeholder="Search Customers ..." value={listData.search} onSearchInput={(e) => onSearchChange(e)} />
                                    <View style={[buttonRow, { marginBottom: 20, alignItems: 'center' }]}>
                                        <TouchableOpacity onPress={() => handleUserList("select_more")} style={[boxShadow, { backgroundColor: "#fff", width: "48%", borderColor: showSelectedList === "select_more" ? colors.orange : colors.white, borderWidth: 2, height: 50, paddingVertical: 10 }]} activeOpacity={0.8}>
                                            <Text style={[{ color: showSelectedList === "select_more" ? colors.orange : "#8F999E", fontSize: 16 }]}>Select More</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleUserList("selected")} style={[boxShadow, { backgroundColor: "#fff", width: "48%", borderColor: showSelectedList === "selected" ? colors.orange : colors.white, borderWidth: 2, height: 50, paddingVertical: 10 }]} activeOpacity={0.8}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                                                <Text style={[{ color: showSelectedList === "selected" ? colors.orange : "#8F999E", fontSize: 16, }]}>Selected
                                                </Text>
                                                {usersList.selectedUserList.length !== 0 && <Text style={{ color: colors.orange, marginRight: moderateScale(5), paddingVertical: moderateScale(2), paddingHorizontal: moderateScale(5), backgroundColor: "#F3931454", borderRadius: moderateScale(5) }}>{usersList.selectedUserList.length}</Text>}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            }
                            {userstatus === "LOADING" && <Loader />}
                        </View>
                    }
                    ListEmptyComponent={() =>
                        !notification.find((noti: any) => noti.key === "allUsers")?.value ? (
                            <View style={commonStyle.center}>
                                <Text
                                    style={[
                                        styles.noDataStyle,
                                        { color: colors.textDarker },
                                    ]}
                                >
                                    No Customer Found
                                </Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={() => (
                        <View style={commonStyle.mt10}>
                            <Button variant="darker" title="Submit" onPress={() => handleSubmit()} style={{ width: '100%' }} />
                            <Footer />
                        </View>
                    )}
                />
            </View>
        </CRootContainer>
    )
}

const styles = StyleSheet.create({
    images: {
        width: moderateScale(50),
        height: moderateScale(50),
        borderRadius: moderateScale(16),
        marginRight: moderateScale(10),
        backgroundColor: '#e5e5e5ff'
    },
    commonLayout: {
        ...commonStyle.ph25,
    },
    rowContainer: {
        minHeight: getHeight(70),
        // borderColor: 'black',
        // borderWidth: 1,
        // flexDirection: 'row',
        borderRadius: moderateScale(5),
        ...commonStyle.mb20,

    },
    contentContainer: {
        flexDirection: "row",
        width: '80%',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    checkbox: {
        alignItems: 'center'
    },
    bttn: {
        flex: 1,
    },
    noDataStyle: {
        fontSize: 16,
        textAlign: 'center',
        padding: moderateScale(20)
    }
})

export default AddEditNotification