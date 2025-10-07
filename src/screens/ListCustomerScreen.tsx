import { useTheme } from "../theme/ThemeProvider"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { FlatList, StyleSheet, TouchableOpacity, View, Share, RefreshControl, Alert } from "react-native"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constant"
import { useAuth } from "../context/AuthContext"
import { SCREENS } from "../navigation/screens"
import { boxShadow } from "../styles/styles"
import NoDataFound from "../components/NoDataFound"
import Loader from "../components/Loader"
import SearchInput from "../components/SearchInput"
import Filter from "../assets/filter.svg"
import {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetModal,
    BottomSheetScrollView,
    WINDOW_WIDTH
} from "@gorhom/bottom-sheet"
import ModalME52 from "../components/Modal"

import { onError, onInfo, onSuccess } from "../utility/Toaster"
import { blockunblockCommand } from "../services/devices"
import QRCodeView from './QRCodeView';
import useFetchCustomer from '../hooks/useFetchCustomer';
import { useFocusEffect } from '@react-navigation/native';

import CustomerCard from './CustomerCard';
import CustomerFilters from './CustomerFilters';
import Footer from "../components/Footer"
import CHeader from "../components/CHeader"
import { commonStyle } from "../theme"
import CRootContainer from "../components/CRootContainer"
import { getHeight, moderateScale } from "../common/constants"
import AddIcon from '../assets/add_black_icon.svg';

const ListCustomer = ({ route, navigation }: any) => {

    const { users } = useAuth()
    const { colors } = useTheme()
    const [filters, setFilters] = useState({})
    const [refreshing, setRefreshing] = useState(false);

    const [search, setSearch] = useState('');
    const [pageno, setPageno] = useState(1);
    const [modalData, setModalData] = useState({
        type: "",
        visible: false,
        message: "",
        name: "",
        data: {
            category: "",
            item: ""
        }
    })
    const [modalData1, setModalData1] = useState<{
        type: string;
        visible: boolean;
        message: string;
        name: string;
        data: {
            category: string;
            item: any;
        };
    }>({
        type: "",
        visible: false,
        message: "",
        name: "",
        data: {
            category: "",
            item: ""
        }
    })


    const bottomSheetRef = useRef<BottomSheetModal>(null)
    const qrBottomSheet = useRef<BottomSheetModal>(null)
    const snapPoints = useMemo(() => [800], [])

    const { hasMore, customers, loadingStatus, deleteCustomer, fetchCustomer, setCustomers } = useFetchCustomer({
        search,
        users,
        filters,
        setFilters,
    });
    const { users: userData } = useAuth();

    useFocusEffect(
        useCallback(() => {

            setFilters({});
            setPageno(1);

        }, [])
    )

    useFocusEffect(
        useCallback(() => {

            let mounted = true

            if (pageno > 0) {
                fetchCustomer(pageno, mounted, filters)
            }

        }, [search, pageno, filters])
    )

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            setCustomers([]);
        });

        return unsubscribe;
    }, [navigation, setCustomers]);

    const openDetailPage = (item: any) => {
        navigation.navigate(SCREENS.AddCustomer, { customerId: item._id });
    }

    const onSearchInput = (input: string) => {
        console.log('ME52RETAILERTESTING', "On search input is here ", input)
        setPageno(1);
        setSearch(input)
    }

    const onClose = () => {
        setModalData((prev) => ({ ...prev, visible: false, type: "" }))
    }

    const onClose1 = () => {
        setModalData1((prev) => ({ ...prev, visible: false, type: "" }))
    }

    const deleteCust = async (data: any) => {

        setModalData((prev) => ({ ...prev, visible: false }))

        const response = await deleteCustomer(data);

        if (response.success)
            setModalData((prev) => ({ ...prev, visible: true, type: "success", message: "Your record has been deleted successfully!", name: "Ok" }))

    }

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                pressBehavior="close" // tap outside to dismiss
            />
        ),
        []
    );

    const unblockDevice = async (data: any) => {
        try {
            setModalData((prev) => ({ ...prev, visible: false }))
            const item = data.item
            const apiData = {
                imei: item.device.imei1,
                staus: item.device.status,
                _id: item._id,
                command: item.device.status === 'blocked' ? 'unblock' : 'block'
            }

            const response = await blockunblockCommand({ data: apiData }, users.token)
            if (response.success) {
                setModalData((prev) => ({ ...prev, visible: true, type: "success", message: `Your record has been ${data.category === 'unblock' ? 'Unlocked' : 'Locked'} successfully!`, name: "Ok" }))
            } else {
                console.log('ME52RETAILERTESTING', "Fail to delete customer ", response)
            }

        } catch (error: any) {
            console.log('ME52RETAILERTESTING', "Error while ublocking/blocking device ", error)
            if (error.response?.staus === 400) {
                const message = error.response?.data?.message || 'Some went wrong'
                onError("Customer", message)
            }
        }
    }

    const unInstallDevice = async (data: any) => {
        try {
            setModalData1((prev) => ({ ...prev, visible: false }))
            // Need to check with kamran bhai 
            const response = await blockunblockCommand(data.item, users.token)
            if (response.success) {
                setModalData((prev) => ({ ...prev, visible: true, type: "success", message: `Your uninstalled request sent successfully!`, name: "Ok" }))
            } else {
                console.log('ME52RETAILERTESTING', "Fail to delete customer ", response)
            }

        } catch (error: any) {
            console.log('ME52RETAILERTESTING', "Error while ublocking/blocking device ", error)
            if (error.response?.status === 400) {
                const message = error.response?.data?.message || 'Some went wrong'
                onError("Customer", message)
            }
        }
    }

    const onConfirm = async (data: { category: string, item: any }) => {

        console.log('ME52RETAILERTESTING', "User confirmed ", data)
        switch (data.category) {
            case "delete":
                //Delete customer
                await deleteCust(data)
                break;

            case "unlock":
            case "lock":
                unblockDevice(data)
                //Lock/Unlock customer    

                break
            default:
                break;
        }

    }

    const openModal = (type: string, toCall: string, item: any) => {
        let message = "You won’t be able to revert Customer!"
        let name = "Delete"

        if (type == "delete") {
            if (toCall === "unlock") {
                message = "You want to unlock the Device !"
                name = "Yes"
            } else if (toCall == "lock") {
                message = "You want to lock the Device !"
                name = "Yes"
            }
        }

        setModalData((prev) => ({ ...prev, visible: true, type: type, message: message, name: name, data: { ...prev.data, category: toCall, item: item } }))
    }

    const handleLoadMore = () => {
        console.log('ME52RETAILERTESTING', "handleLoadMore hasMore", hasMore, customers?.length);
        if (hasMore && loadingStatus == 'SUCCESS') {
            console.log('ME52RETAILERTESTING', "INCREASE PAGE NO");
            setPageno(pageno + 1);
        }
    }

    const handleOnSelectMenu = async (value: string, item: any) => {
        switch (value) {
            case "share":
                try {
                    const text = `
                        👤 Name : ${item.name}
📞 Phone Number : +${item.phone_country_code}${item.phone}
📞 Alternate Number : +${item.alternate_phone_country_code}${item.alternate_phone}
📧 Email : ${item.email}
📱 IMEI : ${item.device && item.device.imei1 ? item.device.imei1 : ''}
🏦 Loan By : ${item.device && item.device.loan && item.device.loan.ledger ? item.device.loan.ledger : ''}
📅 Loan Dates : ${item.loan_date ? item.loan_date : ''}
                    `

                    const result = await Share.share({
                        message: text
                    })

                    if (result.action === Share.sharedAction) {
                        onSuccess("Share", "Message shared successfully")
                    } else if (result.action === Share.dismissedAction) {
                        onInfo("Share", "Share dismissed")
                    }
                } catch (error: any) {
                    onError("Share", "Error while share " + error.message)
                }
                break;
            case "qrcode":
                qrBottomSheet?.current?.present(item?.nameId);
                break;
            case "uninstall":
                const data = {
                    userid: item._id,
                    imei: item.device.imei1,
                    data: {
                        triggerer: userData.id,
                        userid: item._id,
                        imei: item.device.imei1,
                        status: 'normal',
                        _id: item.device._id,
                        command: "uninstall"
                    }
                }
                setModalData1((prev) => ({
                    ...prev,
                    visible: true,
                    type: "delete",
                    message: `Are you sure you want to uninstall this device from the ${item.name}?`,
                    name: "Uninstall",
                    data: { category: "uninstall", item: data }
                }))
                break;
            default:
                break;
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        setPageno(1);          // reset pagination
        await fetchCustomer(1, true, filters); // reload first page
        setRefreshing(false);
    };

    const renderItems = useCallback(
        ({ item }: any) => {
            return (
                <CustomerCard
                    openModal={openModal}
                    openDetailPage={openDetailPage}
                    item={item}
                    handleOnSelectMenu={handleOnSelectMenu}
                />
            )
        }, []
    )

    const applyFilter = (filters: any) => {
        bottomSheetRef.current?.close()
        setPageno(1);
        // Always include date range in filters
        setFilters((prev) => ({
            ...prev,
            ...filters,
            startDate: filters.startDate || '',
            endDate: filters.endDate || '',
        }))
    }

    const handleResetFilter = () => {
        setFilters({ startDate: '', endDate: '' });
        setPageno(1);
        bottomSheetRef.current?.close();
    }

    const openDrawer = () => {
        console.log('ME52RETAILERTESTING', "Opening drawer ", bottomSheetRef.current)
        bottomSheetRef.current?.present()
    }

    const onPressCustomer = () => {
        navigation.navigate(SCREENS.AddCustomer);
    }

    console.log('ME52RETAILERTESTING', "RERENDER");

    const renderFooter = () => {
        console.log("renderFooter", loadingStatus);
        if (loadingStatus === "MORE_LOADING") {
            return (
                <View style={{ height: getHeight(100) }}>
                    <Loader />
                    <Footer />
                </View>
            )
        }
        return <Footer />

    }

    const showList = () => {

        if (loadingStatus == "LOADING") {
            console.log("RENDER MAIN LOADER", loadingStatus);
            return (
                <View style={[styles.loaderContainer]}>
                    <Loader center={true} />
                </View>
            )
        }

        if (loadingStatus === "ERROR") {
            console.log("RENDER MAIN ERROR", loadingStatus);
            return (
                <View style={[styles.loaderContainer]}>
                    <NoDataFound label="No customers found" />
                    <Footer />
                </View>
            )
        }

        if (loadingStatus == "NO_DATA") {
            console.log("RENDER MAIN NO_DATA", loadingStatus);
            return (
                <View style={[styles.loaderContainer]}>
                    <NoDataFound label="No customers found" />
                    <Footer />
                </View>
            )
        }

        return (
            <FlatList
                data={customers}
                renderItem={renderItems}
                keyExtractor={item => item.nameId.toString()}
                onEndReachedThreshold={0}
                onEndReached={handleLoadMore}
                ListFooterComponent={renderFooter}
                contentContainerStyle={commonStyle.ph15}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[colors.darker]}   // Android spinner color
                        tintColor={colors.darker} // iOS spinner color
                    />
                }
            />
        )

    }

    return (
        <CRootContainer style={{ flex: 1 }}>
            <CHeader title="Customers" style={commonStyle.ph15}
                RightContainer={<TouchableOpacity
                    style={styles.addIconContainer}
                    onPress={onPressCustomer}
                >
                    <AddIcon height={moderateScale(16)} width={moderateScale(16)} />
                </TouchableOpacity>}
            />
            <View style={{ width: WINDOW_WIDTH, flex: 1 }}>
                <View style={{
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    ...commonStyle.ph15,
                    ...commonStyle.mb5
                }}>
                    <SearchInput
                        leftIcon={true}
                        widthP={"85%"}
                        value={search}
                        placeholder={"Search Users"}
                        onSearchInput={(value) => onSearchInput(value)}
                    />
                    <TouchableOpacity
                        style={
                            [
                                {
                                    width: moderateScale(45),
                                    height: getHeight(50),
                                    backgroundColor: "#fff",
                                    borderRadius: moderateScale(16),
                                    alignItems: "center",
                                    justifyContent: "center"
                                },
                                boxShadow
                            ]} activeOpacity={0.8} onPress={openDrawer}>
                        <Filter />
                    </TouchableOpacity>
                </View>
                {showList()}
            </View>

            <ModalME52
                type={modalData.type as any}
                onClose={onClose}
                onSuccess={(toCall) => onConfirm(toCall)}
                message={modalData.message}
                name={modalData.name}
                visible={modalData.visible}
                data={modalData.data}
            />
            <ModalME52
                type={modalData1.type as any}
                onClose={onClose1}
                onSuccess={unInstallDevice}
                message={modalData1.message}
                name={modalData1.name}
                visible={modalData1.visible}
                data={modalData1.data}
            />
            <BottomSheetModal
                ref={bottomSheetRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backdropComponent={renderBackdrop}
            >
                <BottomSheetScrollView style={{ flex: 1 }}>
                    <CustomerFilters
                        filters={filters}
                        handleApplyFilter={applyFilter}
                        handleResetFilter={handleResetFilter}
                    />
                </BottomSheetScrollView>
            </BottomSheetModal>
            <BottomSheetModal
                ref={qrBottomSheet}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
                backdropComponent={renderBackdrop}
            >
                {(data) => (
                    <BottomSheetScrollView style={{ flex: 1 }}>
                        <QRCodeView header="Scan QR to activate Customer App" data={(data?.data).toString()} />
                    </BottomSheetScrollView>
                )}
            </BottomSheetModal>
        </CRootContainer>
    )
}

const styles = StyleSheet.create({
    loader: {
        alignItems: 'center',
        height: SCREEN_HEIGHT
    },
    loaderContainer: {
        // flex: 1,
        ...commonStyle.flexCenter,
        alignItems: 'center',
        justifyContent: 'center'
    },
    noData: {
        fontSize: 18,
        fontWeight: 600
    },
    name: {
        fontSize: 18,
        fontWeight: 500,
        paddingBottom: 5,
    },
    margin6: {
        marginRight: 6
    },
    filterRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 20,
        alignItems: 'center'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    menuText: {
        marginLeft: 20,
        fontSize: 14,
        color: '#333',
    },
    addIconContainer: {
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: moderateScale(14),
        backgroundColor: '#DEDEDE',
        alignItems: 'center',
        justifyContent: 'center',
    },
})


export default ListCustomer