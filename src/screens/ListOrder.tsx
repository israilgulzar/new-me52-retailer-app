import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "../theme/ThemeProvider";
import { useAuth } from "../context/AuthContext";
import { commonStyle } from "../theme";

import CRootContainer from "../components/CRootContainer";
import CHeader from "../components/CHeader";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import NoDataFound from "../components/NoDataFound";
import ModalME52 from "../components/Modal";
import Button from "../components/Button";
import { Card } from "../components/Card";
import SearchInput from "../components/SearchInput";
import DateRangeInput from "../components/DateRangeCalendars";

import AddIcon from "../assets/add_black_icon.svg";
import FilterI from "../assets/filter.svg";

import { deleteOrder, getlistOrder } from "../services/orders";
import { dateToString } from "../utility/helpers";
import { SCREENS } from "../navigation/screens";
import { OrderStackParamList } from "../navigation/AppNavigator";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constant";
import { boxShadow } from "../styles/styles";
import { moderateScale } from "../common/constants";

type STATUS = 'LOADING' | 'SUCCESS' | 'ERROR' | 'NO_DATA';

const screenWidth = Dimensions.get('window').width;
const isSmall = screenWidth < 350; // adjust breakpoint

const ListOrder = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const { users } = useAuth();

  const [listOrder, setListOrder] = useState({
    data: [] as Array<any>,
    pageno: 1,
    pagesize: 10,
    sort: 'createdAt',
    sortDirection: -1,
    search: '',
  });
  const [status, setStatus] = useState<STATUS>('NO_DATA');
  const [refreshing, setRefreshing] = useState(false);
  const [modalData, setModalData] = useState({
    type: '',
    visible: false,
    message: '',
    name: '',
    data: {
      category: '',
      item: '',
    },
  });
  const [showKeyDetails, setShowKeyDetails] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  // --- Filter State ---
  const defaultFilterState = {
    startDate: '',
    endDate: '',
    orderType: 'all',    // 'all' | 'pending' | 'fulfilled' | 'rejected'
    orderStatus: 'all',  // 'all' | 'buy' | 'return'
  };
  const [pendingFilters, setPendingFilters] = useState({ ...defaultFilterState });
  const [applyFilters, setApplyFilters] = useState({ ...defaultFilterState });
  const snapPoints = useMemo(() => [800], []);
  const insets = useSafeAreaInsets();

  const fetchOrder = async (mounted: boolean) => {
    console.log('ME52RETAILERTESTING', 'COMPONENET mounted ', mounted);
    if (mounted) {
      setStatus('LOADING');
      try {
        // Build API params from applyFilters
        let params: any = {
          id: users.id,
          pageno: 1,
          pagesize: listOrder.pagesize,
          sort: listOrder.sort,
          sortDirection: listOrder.sortDirection,
          search: listOrder.search,
        };
        let filterParams: any = {};
        if (applyFilters.orderType !== 'all') filterParams.status = applyFilters.orderType;
        if (applyFilters.orderStatus !== 'all') filterParams.type = applyFilters.orderStatus;
        if (applyFilters.startDate && applyFilters.endDate) {
          filterParams.startDate = applyFilters.startDate;
          filterParams.endDate = applyFilters.endDate;
        }
        const response = await getlistOrder(params, users.token, filterParams);

        let listData = response.data;

        console.log('ME52RETAILERTESTING', 'List data is here ', listData);

        if (listData.length === 0) {
          setStatus('NO_DATA');
          return;
        }
        listData = listData.map((listD: any) => {
          const keyCount = listD.keys.reduce((acc: number, lDkey: any) => {
            if (lDkey.status === 'fulfilled') {
              return acc + (lDkey.fulfilled || 0);
            } else {
              return acc + (lDkey.asked || 0);
            }
          }, 0);

          const formatted_created = dateToString(listD.createdAt, '-');
          listD.createdAt = formatted_created;
          listD.key_count = keyCount;
          return { ...listD };
        });
        setListOrder(prev => ({
          ...prev,
          data: [...listData],
        }));

        setStatus('SUCCESS');
      } catch (error) {
        console.log(
          'ME52RETAILERTESTING',
          'Error while listing orders ',
          error,
        );
        setStatus('ERROR');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      fetchOrder(mounted);
      return () => {
        mounted = false;
      };
    }, []),
  );

  useEffect(() => {
    let mounted = true;
    fetchOrder(mounted);
    return () => {
      mounted = false;
    };
  }, [listOrder.search]);

  // Fetch orders when filters change (including reset)
  useEffect(() => {
    let mounted = true;
    fetchOrder(mounted);
    return () => {
      mounted = false;
    };
  }, [applyFilters]);

  const handleLoadMore = () => {
    console.log('ME52RETAILERTESTING', 'handleLoadMore');
    if (status !== 'LOADING') {
      setListOrder(prev => ({ ...prev, pageno: prev.pageno + 1 }));
      // fetchOrder(true)
    }
  };

  const renderFooter = () => {
    if (status === 'LOADING') {
      return (
        <>
          <Loader />
          <Footer />
        </>
      );
    }
    return <Footer />;
  };

  const openModal = (type: string, toCall: string, item: any) => {
    let message = 'You won’t be able to revert Customer!';
    let name = 'Delete';

    if (type == 'delete') {
      if (toCall === 'unlock') {
        message = 'You want to unlock the Order !';
        name = 'Yes';
      } else if (toCall == 'lock') {
        message = 'You want to lock the Order !';
        name = 'Yes';
      }
    }

    setModalData(prev => ({
      ...prev,
      visible: true,
      type: type,
      message: message,
      name: name,
      data: { ...prev.data, category: toCall, item: item },
    }));
  };

  const deleteSelectedOrder = async (data: any) => {
    try {
      setModalData(prev => ({ ...prev, visible: false }));
      setStatus('LOADING');

      const response = await deleteOrder({ _id: data.item._id }, users.token);
      console.log(
        'ME52RETAILERTESTING',
        'Delete customer response in list customer ',
        response,
      );
      if (response.success) {
        const prevData = listOrder.data.filter(d => d._id !== data.item._id);
        setListOrder(prev => ({ ...prev, data: prevData }));
        if (prevData.length !== 0) {
          setStatus('SUCCESS');
        } else {
          setStatus('NO_DATA');
        }
        setModalData(prev => ({
          ...prev,
          visible: true,
          type: 'success',
          message: 'Your Order has been deleted successfully!',
          name: 'Ok',
        }));
      } else {
        console.log(
          'ME52RETAILERTESTING',
          'Fail to delete customer ',
          response,
        );
      }
    } catch (error) {
      console.log(
        'ME52RETAILERTESTING',
        'Error while deleting customer ',
        error,
      );
      setStatus('SUCCESS');
    }
  };

  const onClose = () => {
    setModalData(prev => ({ ...prev, visible: false, type: '' }));
  };

  const onConfirm = async (data: { category: string; item: any }) => {
    console.log('ME52RETAILERTESTING', 'User confirmed ', data);
    switch (data.category) {
      case 'delete':
        //Delete customer
        await deleteSelectedOrder(data);
        break;

      case 'unlock':
      case 'lock':
        //Lock/Unlock customer

        break;
      default:
        break;
    }
  };

  const onSearchInput = (value: string) => {
    setListOrder(prev => ({ ...prev, search: value }));
  };

  const redirectToOrderDetails = (orderId: string, viewOnly?: boolean) => {
    navigation.navigate(
      viewOnly
        ? SCREENS.ViewOrder
        : (SCREENS.AddEditOrder as keyof OrderStackParamList),
      {
        orderId,
        viewOnly,
      },
    );
  };

  const handleMenuSelect = () => {
    navigation.navigate(SCREENS.Order, {
      screen: SCREENS.AddEditOrder,
      params: { type: 'buy' },
    });
  };

  const openDrawer = () => {
    bottomSheetRef.current?.present();
  };

  // --- Filter Modal Handlers ---
  const handleChangeDateRange = (value: any) => {
    setPendingFilters(prev => ({
      ...prev,
      startDate: value.startDate,
      endDate: value.endDate,
    }));
  };
  const handleOrderTypeChange = (type: string) => {
    setPendingFilters(prev => ({ ...prev, orderType: type }));
  };
  const handleOrderStatusChange = (status: string) => {
    setPendingFilters(prev => ({ ...prev, orderStatus: status }));
  };
  const handleApplyFilter = () => {
    setApplyFilters({ ...pendingFilters });
    bottomSheetRef.current?.close();
  };
  const handleResetFilter = () => {
    setPendingFilters({ ...defaultFilterState });
    setApplyFilters({ ...defaultFilterState });
    bottomSheetRef.current?.close();
  };

  const handleKeyDetails = (id: string) => {
    setListOrder(prev => {
      prev.data = prev.data.map(d => {
        if (d._id === id) {
          return { ...d, showDetails: !d.showDetails };
        }
        return { ...d };
      });

      return { ...prev };
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setListOrder(prev => ({ ...prev, pageno: 1 })); // reset pagination
    await fetchOrder(true);
    setRefreshing(false);
  };


  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close" // tap outside to dismiss
      />
    ),
    [],
  );

  const renderItems = ({ item }: any) => {
    return (
      <Card key={item.id} style={styles.card}>
        <View style={[styles.contentContainer]}>
          <View style={commonStyle.rowSpaceBetween}>
            <View style={styles.detail}>
              <Text style={[styles.label, { color: colors.textDark }]}>
                Order Id:
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {item.orderId}
              </Text>
            </View>
            <View style={styles.typeContainer}>
              <Text
                style={[
                  styles.type,
                  {
                    backgroundColor:
                      item.type === 'buy'
                        ? '#7CD42B44' // light green background
                        : '#b83e4444', // light red background
                    color:
                      item.type === 'buy'
                        ? '#2E3B2E' // dark green text
                        : '#ff0011ff', // dark red text
                  },
                ]}
              >
                {item.type === 'buy' ? 'Sale' : 'Sale Return'}
              </Text>
            </View>
          </View>
          <View style={styles.detail}>
            <Text style={[styles.label, { color: colors.textDark }]}>
              Created:
            </Text>
            <Text style={[styles.value, { color: colors.text }]}>
              {item.createdAt}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={[styles.label, { color: colors.textDark }]}>
              Status:
            </Text>
            <Text
              style={[
                styles.statusvalue,
                {
                  backgroundColor:
                    item.status === 'pending'
                      ? '#F3931444' // light orange shadow
                      : item.status === 'fulfilled'
                        ? '#7CD42B44' // light green shadow
                        : '#BE454B44', // light red shadow
                  color:
                    item.status === 'pending'
                      ? '#F39314' // dark orange text
                      : item.status === 'fulfilled'
                        ? '#2E3B2E' // dark green text
                        : '#ff0011ff', // dark red text
                },
              ]}
            >
              {item.status === 'pending'
                ? 'Pending'
                : item.status === 'fulfilled'
                  ? 'Completed'
                  : 'Rejected'}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={[styles.label, { color: colors.textDark }]}>
              Order For:
            </Text>
            <Text
              style={[styles.value, { color: colors.text, fontWeight: 'bold' }]}
            >
              {item.orderFor.name}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={[styles.label, { color: colors.textDark }]}>
              Order Keys:
            </Text>
            <Text
              style={[styles.value, { color: colors.text, fontWeight: 'bold' }]}
            >
              {item.key_count ?? 0}
            </Text>
          </View>
        </View>
        <View style={[styles.footerContainer]}>
          {/* <View>
                <TouchableOpacity
                style={[styles.keyDetails]}
                onPress={() => handleKeyDetails(item._id)}
                activeOpacity={0.8}
                >
                <Text
                    style={[{ color: colors.text, fontSize: 14, fontWeight: 500 }]}
                >
                    Key details
                </Text>
                {item.showDetails ? (
                    <CaretUp width={15} height={15} />
                ) : (
                    <CaretDown />
                )}
                </TouchableOpacity>
            </View> */}
          <View style={[styles.buttonContainer]}>
            <Button
              title={'View'}
              onPress={() => redirectToOrderDetails(item._id, true)}
              variant={item.is_blocked ? 'outline_orange' : 'orange'}
              style={
                item.status === 'pending'
                  ? styles.buttonOrange
                  : {
                    ...styles.buttonOrange,
                    flexBasis: '100%',
                  }
              }
              left={true}
              smaller={true}
            />

            {item.status === 'pending' && (
              <Button
                title={'Edit'}
                onPress={() => redirectToOrderDetails(item._id)}
                variant="outline_darker"
                style={{ ...styles.button, paddingVertical: 0 }}
                smaller={true}
              />
            )}
            {/* <Button
                                title="Delete"
                                onPress={() => openModal("delete", "delete", item)}
                                variant="darker"
                                style={styles.button}
                                smaller={true}
                            /> */}
          </View>
          {item.showDetails && item.keys && (
            <View>
              {item.keys.map((key: any, index: number) => (
                <View
                  style={[
                    styles.keyDetail,
                    {
                      borderBottomWidth: index != item.keys.length - 1 ? 1 : 0,
                      borderBottomColor:
                        index !== item.keys.length ? colors.textDark : '',
                    },
                  ]}
                >
                  <Text style={[{ color: colors.text }]}>{key._id}</Text>
                  <Text style={[{ color: colors.text }]}>
                    {key.status === 'fulfilled' ? key.fulfilled : key.asked}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Card>
    );
  };


  return (
    <CRootContainer style={{ flex: 1 }}>
      <CHeader
        title='Orders'
        RightContainer={<TouchableOpacity
          style={styles.addIconContainer}
          onPress={() => handleMenuSelect()}
        >
          <AddIcon height={moderateScale(16)} width={moderateScale(16)} />
        </TouchableOpacity>}
        style={commonStyle.ph15}
      />
      {status == 'LOADING' && (
        <View style={[styles.loaderContainer]}>
          <Loader center={true} />
        </View>
      )}
      {(status === 'SUCCESS' || status == 'ERROR' || status == 'NO_DATA') && (
        <View style={styles.page}>
          <View style={[styles.headerContainer]}>
            <SearchInput
              placeholder={'Search Orders'}
              leftIcon={true}
              onSearchInput={value => onSearchInput(value)}
              value={listOrder.search}
              widthP={'85%'}
            />
            <TouchableOpacity
              style={[
                boxShadow,
                {
                  backgroundColor: '#fff',
                  width: 45,
                  height: 50,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}
              onPress={openDrawer}
            >
              <FilterI />
            </TouchableOpacity>
          </View>
          {(status == 'ERROR' || status == 'NO_DATA') && (
            <View style={[styles.loaderContainer]}>
              <NoDataFound label='No orders found' />
              <Footer />
            </View>
          )}
          {status === 'SUCCESS' && (
            <FlatList
              data={listOrder.data}
              renderItem={renderItems}
              keyExtractor={item => item._id}
              onEndReachedThreshold={0.8}
              onEndReached={handleLoadMore}
              ListFooterComponent={renderFooter}
              contentContainerStyle={commonStyle.flexGrow1}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.darker]}   // Android spinner color
                  tintColor={colors.darker} // iOS spinner color
                />
              }
            />
          )}
        </View>
      )}
      <ModalME52
        type={modalData.type as any}
        onClose={onClose}
        onSuccess={toCall => onConfirm(toCall)}
        message={modalData.message}
        name={modalData.name}
        visible={modalData.visible}
        data={modalData.data}
      />
      <BottomSheetModal
        ref={bottomSheetRef}
        // onChange={handleOnChanges}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetScrollView style={{ flex: 1 }}>
          {/* <Text style={{color: colors.text}}>Yayyy!!! drawer open</Text> */}
          <View style={commonStyle.ph15} >
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
              Filters
            </Text>
            <View style={commonStyle.mv15}>
              <DateRangeInput
                value={{
                  startDate: pendingFilters.startDate,
                  endDate: pendingFilters.endDate,
                }}
                onChangeText={handleChangeDateRange}
                placeholder="Start Date - End Date"
              />
            </View>
            <Text style={{ ...styles.labelTextStyle, color: colors.text }}>Order Type</Text>
            <View style={styles.filterRow}>
              {['all', 'pending', 'fulfilled', 'rejected'].map(type => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleOrderTypeChange(type)}
                  style={{
                    ...styles.filterContent,
                    ...boxShadow,
                    backgroundColor: pendingFilters.orderType === type ? colors.orange : colors.white,
                  }}
                >
                  <Text style={{ color: pendingFilters.orderType === type ? colors.white : colors.orange }}>
                    {type === 'all' ? 'All' : type === 'pending' ? 'Pending' : type === 'fulfilled' ? 'Completed' : 'Rejected'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={{ ...styles.labelTextStyle, color: colors.text }}>Order Status</Text>
            <View style={styles.filterRow}>
              {['all', 'buy', 'return'].map(status => (
                <TouchableOpacity
                  key={status}
                  onPress={() => handleOrderStatusChange(status)}
                  style={{
                    ...styles.filterContent,
                    ...boxShadow,
                    backgroundColor: pendingFilters.orderStatus === status ? colors.orange : colors.white,
                  }}
                >
                  <Text style={{ color: pendingFilters.orderStatus === status ? colors.white : colors.orange }}>
                    {status === 'all' ? 'All' : status === 'buy' ? 'Sale' : 'Sale Return'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.buttonContainer2} >
            <Button variant="darker" title="Reset" onPress={handleResetFilter}
              textStyle={{ color: colors.textDark }}
              style={{ ...styles.resetButtonStyle, backgroundColor: colors.white, borderColor: colors.textDark }} />
            <Button variant="darker" title="Apply" onPress={() => handleApplyFilter()}
              style={styles.applyButtonStyle}

            />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  page: {
    ...commonStyle.mb10,
    ...commonStyle.flex,
  },
  card: {
    ...commonStyle.mh15,
    ...commonStyle.mv10,
    padding: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 5,
  },
  contentContainer: {
    padding: 20,
  },
  typeContainer: {
    // width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  type: {
    backgroundColor: '#d3d3d3',
    borderRadius: 20,
    paddingTop: 2,
    paddingBottom: 2,
    paddingRight: 10,
    paddingLeft: 10,
    fontSize: 12,
  },
  footerContainer: {
    backgroundColor: '#eee',
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // allows wrapping on small screens
    gap: 10,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  loader: {
    alignItems: 'center',
    height: SCREEN_HEIGHT,
  },
  loaderContainer: {
    // flex: 1,
    display: 'flex',
    height: SCREEN_HEIGHT - 300,
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noData: {
    fontSize: 18,
    fontWeight: 600,
  },
  label: {
    fontWeight: 500,
  },
  name: {
    fontWeight: 500,
    paddingBottom: 5,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  value: {
    marginLeft: 5,
  },
  statusvalue: {
    marginLeft: 5,
    borderRadius: 20,
    paddingRight: 10,
    paddingLeft: 10,
    paddingVertical: 3,
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 5,
    marginRight: '5%',
  },
  shareIcon: {
    position: 'absolute',
    right: '-30%',
    top: '-10%',
  },

  button: {
    flexBasis: isSmall ? '100%' : '48%',
    height: 38,
    justifyContent: 'center',
  },

  buttonOrange: {
    flexBasis: isSmall ? '100%' : '48%',
    height: 38,
    justifyContent: 'center',
  },
  filterContent: {
    width: '47%',
    height: 55,
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingLeft: 20,
    justifyContent: 'space-between',
  },
  margin6: {
    marginRight: 6,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  keyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 10,
    paddingLeft: 25,
  },
  keyDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...commonStyle.mh15,
    ...commonStyle.mb5,
  },
  addIconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    backgroundColor: '#DEDEDE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sperator: {
    borderWidth: 1,
    borderColor: '#eee',
    width: 200,
    position: 'absolute',
    left: -50,
    top: 30,
  },
  buttonContainer2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    ...commonStyle.mb20,
    ...commonStyle.mh15,
  },
  applyButtonStyle: {
    width: '65%'
  },
  resetButtonStyle: {
    width: '30%',
    borderWidth: 1,
  },
  labelTextStyle: {
    fontSize: 16,
    marginBottom: 6,
  }
});

const menuStyles = {
  optionsContainer: {
    width: 150,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
};

export default ListOrder;
