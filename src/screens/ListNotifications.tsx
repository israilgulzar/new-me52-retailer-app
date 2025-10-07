import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { getNotifications, deleteNotification } from '../services/notificattions';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl
} from 'react-native';

import { useAuth } from '../context/AuthContext';
import { boxShadow } from '../styles/styles';
import Loader from '../components/Loader';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../constant';
import NoDataFound from '../components/NoDataFound';
import SearchInput from '../components/SearchInput';
import ModalME52 from '../components/Modal';
import Button from '../components/Button';

import { useTheme } from '../theme/ThemeProvider';
import { dateToString } from '../utility/helpers';
import { SCREENS } from '../navigation/screens';
import { NotificationStackParamList } from '../navigation/AppNavigator';
import Footer from '../components/Footer';
import AddIcon from '../assets/add_black_icon.svg';
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { IMAGE_BASE_URL } from '../environment';
import { moderateScale } from 'react-native-size-matters';
import { getHeight } from '../common/constants';
import CRootContainer from '../components/CRootContainer';
import CHeader from '../components/CHeader';
import { commonStyle } from '../theme';


interface ListNotificationProps {
  route: any;
  navigation: NavigationProp<any>;
}

type STATUS = 'LOADING' | 'SUCCESS' | 'ERROR' | 'NO_DATA' | 'MORE_LOADING';

const ListNotification = ({ route, navigation }: ListNotificationProps) => {

  const [listNotification, setListNotification] = useState({
    data: [] as Array<any>,
    pageno: 1,
    pagesize: 50,
    sort: 'createdAt',
    sortDirection: -1,
    search: '',
    staus: "pending"
  });

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [status, setStatus] = useState<STATUS>('SUCCESS');
  const [refreshing, setRefreshing] = useState(false);

  const { users } = useAuth();
  const { colors } = useTheme();
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

  const [filters, setFilters] = useState({
    all: true,
    filter_image_notification: false,
    filter_video_notification: false
  });
  const isFilterChange = useRef(false)

  const fetchNotifications = async (mounted: boolean, applyf = null) => {
    if (mounted) {
      try {

        setStatus(listNotification.pageno > 1 ? 'MORE_LOADING' : 'LOADING');

        const response = await getNotifications(
          {
            pageno: listNotification.pageno,
            pagesize: listNotification.pagesize,
            sort: listNotification.sort,
            sortDirection: listNotification.sortDirection,
            search: listNotification.search,
            status: listNotification.staus,
            ...(filters.filter_image_notification ? { filter_image_notification: filters.filter_image_notification } : {}),
            ...(filters.filter_video_notification ? { filter_video_notification: filters.filter_video_notification } : {}),
          },
          users.token,
          applyf,
        );

        console.log("FILTERS");
        console.log({
          pageno: listNotification.pageno,
          pagesize: listNotification.pagesize,
          sort: listNotification.sort,
          sortDirection: listNotification.sortDirection,
          search: listNotification.search,
          status: listNotification.staus,
          ...(filters.filter_image_notification ? { filter_image_notification: filters.filter_image_notification } : {}),
          ...(filters.filter_video_notification ? { filter_video_notification: filters.filter_video_notification } : {}),
        });

        console.log("RESPONSE", response?.data?.length);


        let listData = response?.data ?? [];

        setHasMore(listData.length < listNotification.pagesize);

        let prevData = [...listNotification.data]

        if (listData.length && listNotification.pageno !== 1) {

          const userid = new Set()
          const updatedData = [];

          for (let prevD of prevData) {
            userid.add(prevD._id)
          }
          for (let listD of listData) {
            userid.add(listD._id)
          }
          for (let uid of userid) {
            const lastestUser = listData.find((listD: any) => listD._id === uid)
            if (lastestUser) {
              updatedData.push(lastestUser)
            } else {
              const prevUser = prevData.find((prevD: any) => prevD._id === uid)
              if (prevUser) {
                updatedData.push(prevUser)
              }
            }
          }

          listData = [...updatedData];

        }

        // if (listData.length === 0 && listNotification.pageno === 1) {
        // 	setListNotification(prev => ({ ...prev, data: [] }));
        // 	setStatus('NO_DATA');
        // } else {
        if (listNotification.pageno === 1) {
          console.log("listData", listNotification.pageno);
          console.log("listData", listData?.length);
          // First page -> replace data
          setListNotification(prev => ({
            ...prev,
            data: listData
          }));
        } else {
          // Next pages -> append / merge data
          setListNotification(prev => ({
            ...prev,
            data: [...listData]
          }));
        }

        setStatus('SUCCESS');
        // }

      } catch (error: any) {
        console.log('ME52RETAILERTESTING', 'Error while fetching notifications ', error, " error status code ", error.response.status);
        setStatus('ERROR');
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      fetchNotifications(mounted);
      return () => {
        mounted = false;
      };
    }, []),
  );

  const handleMenuSelect = (value: string) => {
    switch (value) {
      case "image":
        navigation.navigate(SCREENS.Notification, {
          screen: SCREENS.AddEditNotification,
          params: { type: "image" }
        })
        break;
      case "video":
        navigation.navigate(SCREENS.Notification, {
          screen: SCREENS.AddEditNotification,
          params: { type: "video" }
        })
        break;
      default:
        break;
    }
  }
  const onSearchInput = (input: string) => {
    console.log('ME52RETAILERTESTING', 'On search input is here ', input);
    setListNotification(prev => ({ ...prev, search: input }));
  };

  const onClose = () => {
    setModalData(prev => ({ ...prev, visible: false, type: '' }));
  };

  useEffect(() => {
    if (!listNotification.search && listNotification.pageno === 1)
      return

    let timer = setTimeout(() => fetchNotifications(true), 500);

    return () => {
      clearTimeout(timer)
    }
  }, [listNotification.search, listNotification.pageno]);

  useEffect(() => {
    console.log('ME52RETAILERTESTING', "Filter value is here ", filters)
    if (!isFilterChange.current)
      return

    //If page no is 1, make a call or set page to 1
    if (listNotification.pageno !== 1) {
      setListNotification(prev => ({ ...prev, pageno: 1 }));
      return
    }

    let timer = setTimeout(
      () => fetchNotifications(true),
      500
    );

    return () => {
      clearTimeout(timer)
    }

  }, [filters]);

  const onConfirm = async (data: { category: string; item: any }) => {
    const response = await deleteNotification(data.item, users.token)
    if (response.success) {
      const uid = data.item._id;
      const listData: any = listNotification.data.filter((listD: any) => listD._id !== uid);
      setListNotification(prev => ({ ...prev, data: [...listData] }));
    }
    onClose();
  };

  const openDetailPage = (item: any) => {
    let type = item.images.length !== 0 ? "image" : item.video ? "video" : null
    navigation.navigate(SCREENS.AddEditNotification as keyof NotificationStackParamList, {
      notificationId: item._id,
      type: type
    });
  };

  const renderItems = ({ item }: any) => {
    let datetime = item.datetime ? dateToString(item.datetime) : '';
    const typeLabel =
      item.images && item.images.length !== 0
        ? 'Image'
        : item.video && item.video !== 'false'
          ? 'Video'
          : '';

    return (
      <View
        style={[
          boxShadow,
          commonStyle.p10,
          commonStyle.mb10,
          {
            justifyContent: 'space-between',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#fff',
            borderRadius: moderateScale(10),
            alignItems: 'flex-start',
          },
        ]}
      >
        <View
          style={{
            width: moderateScale(110),
            height: moderateScale(110),
            borderRadius: moderateScale(8),
            overflow: 'hidden',
            marginRight: moderateScale(10),
            position: 'relative',
            elevation: 4,
          }}
        >
          {typeLabel === 'Video' ? (
            <Image
              source={{ uri: IMAGE_BASE_URL + item.video_thumbnail }}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: moderateScale(8),
              }}
            />
          ) : (
            item.images && item.images.length > 0 && (
              <Image
                source={{ uri: IMAGE_BASE_URL + item.images[0] }}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: moderateScale(8),
                }}
              />
            )
          )}
        </View>

        <View style={{ flex: 1, flexDirection: 'row' }}>

          {/* Text Content */}
          <View style={{ flex: 1 }}>
            {/* Title */}
            <Text
              style={{ color: colors.textDarker, fontSize: 16, fontWeight: '600' }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>

            {/* Description */}
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: colors.text, fontSize: 14, marginTop: moderateScale(2) }}
            >
              {item.description}
            </Text>

            {/* Date & Type */}
            <View style={{ flexDirection: 'row', marginTop: moderateScale(6), alignItems: 'center', flexWrap: 'wrap' }}>
              <Text style={{ color: colors.textDarker, fontSize: 12, marginRight: moderateScale(8) }}>
                {datetime}
              </Text>
              {typeLabel !== '' && (
                <View
                  style={{
                    backgroundColor: '#F3931454',
                    paddingHorizontal: moderateScale(8),
                    paddingVertical: moderateScale(2),
                    borderRadius: moderateScale(8),
                    marginLeft: 'auto'
                  }}
                >
                  <Text style={{ color: colors.orange, fontSize: moderateScale(10), fontWeight: '600' }}>
                    {typeLabel}
                  </Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', width: '100%', columnGap: moderateScale(10) }}>
              <Button
                title="Edit"
                variant="outline_darker"
                onPress={() => openDetailPage(item)}
                textStyle={{ fontSize: moderateScale(12) }}
                style={{ paddingVertical: 0, height: getHeight(30), flex: 2, borderRadius: moderateScale(7) }}
              />
              <Button
                title="Delete"
                variant="darker"
                onPress={() => openModal('delete', 'delete', item)}
                textStyle={{ fontSize: moderateScale(12) }}
                style={{ paddingVertical: 0, height: getHeight(30), flex: 2, borderRadius: moderateScale(7) }}
              />
            </View>
          </View>

        </View>
        {/* RIGHT MAIN BOX (Buttons) */}


      </View>
    );
  };

  const openModal = (type: string, toCall: string, item: any) => {
    let message = 'You won’t be able to revert Notification!';
    let name = 'Delete';

    setModalData(prev => ({
      ...prev,
      visible: true,
      type: type,
      message: message,
      name: name,
      data: { ...prev.data, category: 'delete', item: item },
    }));
  };

  const onChangeFilter = (key: string) => {

    console.log(' ');
    console.log(' ');
    console.log(' ');
    console.log(' ');
    console.log(' ');
    console.log('ME52RETAILERTESTING', "onChangeFilter");
    console.log('ME52RETAILERTESTING', filters);

    const prevState = { ...filters }
    for (let prevS in prevState) {
      if (prevS === key) {
        prevState[prevS as keyof typeof prevState] = true
      } else {
        prevState[prevS as keyof typeof prevState] = false
      }
    }

    isFilterChange.current = true;

    setFilters({ ...prevState })

  }

  const handleLoadMore = () => {
    if (status !== "MORE_LOADING" && hasMore) {
      // setListNotification((prev) => ({ ...prev, pageno: prev.pageno + 1 }))
    }
  }

  // const renderItems = ({ item, index }: any) => {
  //   let datetime = item.datetime;
  //   if (datetime) {
  //     datetime = dateToString(datetime);
  //   }

  //   return (
  //     <View
  //       style={[
  //         boxShadow,
  //         {
  //           backgroundColor: '#fff',
  //           marginBottom: 20,
  //           paddingHorizontal: 15,
  //           marginHorizontal: 5
  //         },
  //       ]}
  //     >
  //       <View
  //         style={[{ flexDirection: 'row', justifyContent: 'space-between' }]}
  //       >
  //         <Text
  //           style={[
  //             { color: colors.textDarker, fontSize: 14, fontWeight: 600 },
  //           ]}
  //         >
  //           {item.title}
  //         </Text>
  //         {/* Chip of image or video */}
  //         <View
  //           style={[
  //             {
  //               backgroundColor:
  //                 (item.images && item.images.length != 0) ||
  //                   (item.video && item.video !== 'false')
  //                   ? '#F3931454'
  //                   : 'transparent',
  //               paddingVertical: 5,
  //               paddingHorizontal: 15,
  //               borderRadius: 16,
  //             },
  //           ]}
  //         >
  //           <Text style={[{ color: colors.orange, fontSize: 9 }]}>
  //             {item.images && item.images.length != 0
  //               ? 'Image'
  //               : item.video && item.video !== 'false'
  //                 ? 'Video'
  //                 : ''}
  //           </Text>
  //         </View>
  //       </View>
  //       <Text
  //         style={[{ color: colors.textDarker }]}
  //         numberOfLines={1}
  //         ellipsizeMode="tail"
  //       >
  //         {item.description}
  //       </Text>
  //       <View
  //         style={[
  //           {
  //             flexDirection: 'row',
  //             justifyContent: 'space-between',
  //             alignItems: 'center',
  //           },
  //         ]}
  //       >
  //         <Text style={[{ color: colors.textDarker, marginRight: 5 }]}>
  //           {datetime}
  //         </Text>
  //         <View style={[{ flexDirection: 'row', gap: 5 }]}>
  //           <Button
  //             title="Edit"
  //             variant="outline_darker"
  //             onPress={() => openDetailPage(item)}
  //             textStyle={{ fontSize: 12 }}
  //             style={{ paddingVertical: 0, height: 30, width: 70 }}
  //           />
  //           <Button
  //             title="Delete"
  //             variant="darker"
  //             onPress={() => openModal('delete', 'delete', item)}
  //             textStyle={{ fontSize: 12 }}
  //             style={{ paddingVertical: 0, height: 30, width: 70 }}
  //           />
  //         </View>
  //       </View>
  //     </View>
  //   );
  // };

  const renderFooter = () => {
    if (status === "LOADING") {
      return (
        <View>
          <Loader />
          <Footer />
        </View>
      )
    }
    return <Footer />
  }
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(true); // reload page 1
    setRefreshing(false);
  };


  return (
    <CRootContainer style={{ marginHorizontal: moderateScale(15), flex: 1 }}>
      <CHeader
        title='Upcoming Notifications'
        RightContainer={<View>
          <Menu style={[styles.addIcon, { backgroundColor: "#DEDEDE" }]} onSelect={handleMenuSelect}>
            <MenuTrigger customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
              <View style={{ flexDirection: "row", alignItems: "center", padding: moderateScale(12), borderRadius: 10, }}>
                <AddIcon height={moderateScale(16)} width={moderateScale(16)} />
              </View>
            </MenuTrigger>

            <MenuOptions customStyles={menuStyles}>
              <MenuOption style={styles.menuItm} value="image">
                <Text style={{ color: colors.text, fontWeight: '500' }}>Image</Text>
                <View style={[styles.sperator]} />
              </MenuOption>
              <MenuOption style={styles.menuItm} value="video">
                <Text style={{ color: colors.text, fontWeight: '500' }}>Video</Text>
              </MenuOption>
            </MenuOptions>
          </Menu>

        </View>}
      />
      <View style={{ flex: 1 }}>
        <View
          style={{
            alignItems: 'center',
          }}
        >
          <View style={{ flexDirection: 'row', marginBottom: getHeight(15), justifyContent: 'flex-start', width: "100%", gap: moderateScale(10) }}>
            <TouchableOpacity onPress={() => onChangeFilter("all")} disabled={filters.all} activeOpacity={0.9}>
              <View style={[boxShadow, styles.categoryContainer, { borderColor: filters.all ? colors.orange : colors.white, backgroundColor: colors.white }]}>
                <Text style={[styles.filterTextStyle, { color: filters.all ? colors.orange : colors.textDarker }]}>All</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onChangeFilter("filter_image_notification")} activeOpacity={0.9} disabled={filters.filter_image_notification}>
              <View style={[boxShadow, styles.categoryContainer, { borderColor: filters.filter_image_notification ? colors.orange : colors.white, backgroundColor: colors.white }]}>
                <Text style={[{ color: filters.filter_image_notification ? colors.orange : colors.textDarker }, styles.filterTextStyle]}>Images</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onChangeFilter("filter_video_notification")} activeOpacity={0.9} disabled={filters.filter_video_notification}>
              <View style={[boxShadow, styles.categoryContainer, { borderColor: filters.filter_video_notification ? colors.orange : colors.white, backgroundColor: colors.white }]}>
                <Text style={[{ color: filters.filter_video_notification ? colors.orange : colors.textDarker }, styles.filterTextStyle]}>Videos</Text>
              </View>
            </TouchableOpacity>
          </View>
          <SearchInput
            placeholder={'Search Notifications'}
            leftIcon={true}
            onSearchInput={value => onSearchInput(value)}
            value={listNotification.search}
          />
        </View>

        {status == 'ERROR' && (
          <View style={[styles.loaderContainer]}>
            <NoDataFound label='No Notifications Found' />
          </View>
        )}

        {status == 'LOADING' && (
          // <View style={[styles.loaderContainer]}>
          //     <ActivityIndicator size="large" color={colors.primary} />
          // </View>
          <Loader center={true} />
        )}

        {status !== 'LOADING' && status === 'NO_DATA' && (
          <View style={[styles.loaderContainer]}>
            <NoDataFound label='No Notifications Found' />
          </View>
        )}
        {(status === 'SUCCESS' || status === "MORE_LOADING") && (
          <FlatList
            data={listNotification.data}
            renderItem={renderItems}
            keyExtractor={item => item._id}
            style={{ height: '90%', marginTop: moderateScale(20) }}
            onEndReachedThreshold={0.1}
            onEndReached={handleLoadMore}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={<NoDataFound label='No Notifications Found' />}
            contentContainerStyle={commonStyle.flexGrow1}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                colors={[colors.darker]}   // Android spinner color
                tintColor={colors.darker} // iOS spinner color
              />
            }
          />
        )}

      </View>
      <ModalME52
        type={modalData.type as any}
        onClose={onClose}
        onSuccess={toCall => onConfirm(toCall)}
        message={modalData.message}
        name={modalData.name}
        visible={modalData.visible}
        data={modalData.data}
      />
    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    alignItems: 'center',
    height: SCREEN_HEIGHT,
  },
  menuItm: {
    overflow: 'hidden', paddingLeft: 10, paddingVertical: 7,
  },
  loaderContainer: {
    // flex: 1,
    height: SCREEN_HEIGHT - getHeight(200),
    width: SCREEN_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noData: {
    fontSize: 18,
    fontWeight: 600,
  },
  card: {
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 0,
    marginRight: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  imageCard: {
    // shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 10,
    shadowColor: '#00000040',
    borderRadius: 18,
    // borderColor: 'black'
  },
  name: {
    fontSize: 18,
    fontWeight: 500,
    paddingBottom: 5,
  },
  cardContainer: {
    // flexDirection: 'row',
    // justifyContent: "space-between"
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  image: {
    width: 55,
    height: 55,
    borderRadius: 5,
    marginRight: '5%',
  },
  contentContainer: {
    flexDirection: 'row',
  },
  shareIcon: {
    position: 'absolute',
    right: '-30%',
    top: '-10%',
  },
  button: {
    width: 90,
    height: 38,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 0,
    justifyContent: 'center',
    marginRight: 4,
  },
  buttonOrange: {
    width: 110,
    height: 38,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 5,
    paddingRight: 0,
    justifyContent: 'center',
    marginRight: 4,
  },
  filterContent: {
    width: 150,
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
  },
  filterTextStyle: {
    textAlign: 'center', fontSize: 16,
    fontWeight: 600
  },
  addIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    backgroundColor: '#DEDEDE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sperator: {
    borderWidth: moderateScale(1),
    borderColor: "#eee",
    width: moderateScale(200),
    position: 'absolute',
    left: moderateScale(-50),
    top: moderateScale(30)
  },
  categoryContainer: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(10),
    borderWidth: moderateScale(1),
  }
});

const menuStyles = {
  optionsContainer: {
    width: 130,
    borderRadius: 16,
    paddingVertical: 10,
  }
}

export default ListNotification;
