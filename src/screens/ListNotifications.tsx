import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { moderateScale } from "react-native-size-matters";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../theme/ThemeProvider";
import { commonStyle } from "../theme";

import CRootContainer from "../components/CRootContainer";
import CHeader from "../components/CHeader";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import NoDataFound from "../components/NoDataFound";
import SearchInput from "../components/SearchInput";
import ModalME52 from "../components/Modal";
import Button from "../components/Button";

import { getNotifications, deleteNotification } from "../services/notificattions";
import { dateToString } from "../utility/helpers";

import AddIcon from "../assets/add_black_icon.svg";

import { SCREENS } from "../navigation/screens";
import { NotificationStackParamList } from "../navigation/AppNavigator";
import { boxShadow } from "../styles/styles";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constant";
import { IMAGE_BASE_URL } from "../environment";
import { getHeight } from "../common/constants";

interface ListNotificationProps {
  route: any;
  navigation: NavigationProp<any>;
}

type STATUS = "LOADING" | "SUCCESS" | "ERROR" | "NO_DATA" | "MORE_LOADING";

const ListNotification = ({ navigation }: ListNotificationProps) => {
  const [listNotification, setListNotification] = useState({
    data: [] as Array<any>,
    pageno: 1,
    pagesize: 50,
    sort: "createdAt",
    sortDirection: -1,
    search: "",
    staus: "pending",
  });

  const [hasMore, setHasMore] = useState<boolean>(true);
  const [status, setStatus] = useState<STATUS>("SUCCESS");
  const [refreshing, setRefreshing] = useState(false);
  const [modalData, setModalData] = useState({
    type: "",
    visible: false,
    message: "",
    name: "",
    data: { category: "", item: "" },
  });
  const [filters, setFilters] = useState({
    all: true,
    filter_image_notification: false,
    filter_video_notification: false,
  });

  const isFilterChange = useRef(false);
  const { users } = useAuth();
  const { colors } = useTheme();

  const fetchNotifications = async (mounted: boolean, applyf = null) => {
    if (!mounted) return;
    try {
      setStatus(listNotification.pageno > 1 ? "MORE_LOADING" : "LOADING");

      const response = await getNotifications(
        {
          pageno: listNotification.pageno,
          pagesize: listNotification.pagesize,
          sort: listNotification.sort,
          sortDirection: listNotification.sortDirection,
          search: listNotification.search,
          status: listNotification.staus,
          ...(filters.filter_image_notification
            ? { filter_image_notification: filters.filter_image_notification }
            : {}),
          ...(filters.filter_video_notification
            ? { filter_video_notification: filters.filter_video_notification }
            : {}),
        },
        users.token,
        applyf
      );

      let listData = response?.data ?? [];
      setHasMore(listData.length < listNotification.pagesize);

      let prevData = [...listNotification.data];

      if (listData.length && listNotification.pageno !== 1) {
        const userid = new Set();
        const updatedData: any[] = [];

        prevData.forEach((prevD) => userid.add(prevD._id));
        listData?.forEach((listD: any) => userid.add(listD._id));

        userid.forEach((uid) => {
          const latestUser = listData.find((listD: any) => listD._id === uid);
          updatedData.push(latestUser || prevData.find((prevD: any) => prevD._id === uid));
        });

        listData = [...updatedData];
      }

      if (listNotification.pageno === 1) {
        setListNotification((prev) => ({ ...prev, data: listData }));
      } else {
        setListNotification((prev) => ({ ...prev, data: [...listData] }));
      }

      setStatus("SUCCESS");
    } catch (error: any) {
      console.log("Error fetching notifications:", error);
      setStatus("ERROR");
    }
  };

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      fetchNotifications(mounted);
      return () => {
        mounted = false;
      };
    }, [])
  );

  const handleMenuSelect = (value: string) => {
    navigation.navigate(SCREENS.Notification, {
      screen: SCREENS.AddEditNotification,
      params: { type: value },
    });
  };

  const onSearchInput = (input: string) => {
    setListNotification((prev) => ({ ...prev, search: input }));
  };

  const onClose = () => {
    setModalData((prev) => ({ ...prev, visible: false, type: "" }));
  };

  useEffect(() => {
    if (!listNotification.search && listNotification.pageno === 1) return;
    const timer = setTimeout(() => fetchNotifications(true), 500);
    return () => clearTimeout(timer);
  }, [listNotification.search, listNotification.pageno]);

  useEffect(() => {
    if (!isFilterChange.current) return;
    if (listNotification.pageno !== 1) {
      setListNotification((prev) => ({ ...prev, pageno: 1 }));
      return;
    }
    const timer = setTimeout(() => fetchNotifications(true), 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const onConfirm = async (data: { category: string; item: any }) => {
    const response = await deleteNotification(data.item, users.token);
    if (response.success) {
      const uid = data.item._id;
      const filteredData = listNotification.data.filter((d: any) => d._id !== uid);
      setListNotification((prev) => ({ ...prev, data: filteredData }));
    }
    onClose();
  };

  const openDetailPage = (item: any) => {
    const type = item.images.length
      ? "image"
      : item.video
        ? "video"
        : null;
    navigation.navigate(SCREENS.AddEditNotification as keyof NotificationStackParamList, {
      notificationId: item._id,
      type,
    });
  };

  const openModal = (type: string, toCall: string, item: any) => {
    setModalData((prev) => ({
      ...prev,
      visible: true,
      type,
      message: "You won’t be able to revert Notification!",
      name: "Delete",
      data: { ...prev.data, category: toCall, item },
    }));
  };

  const onChangeFilter = (key: string) => {
    const updatedFilters = Object.keys(filters).reduce((acc: any, curr) => {
      acc[curr] = curr === key;
      return acc;
    }, {});
    isFilterChange.current = true;
    setFilters(updatedFilters);
  };

  const handleLoadMore = () => {
    if (status !== "MORE_LOADING" && hasMore) {
      // Pagination logic if needed
    }
  };

  const renderFooter = () => {
    if (status === "LOADING") {
      return (
        <View>
          <Loader />
          <Footer />
        </View>
      );
    }
    return <Footer />;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(true);
    setRefreshing(false);
  };

  const renderItems = ({ item }: any) => {
    const datetime = item.datetime ? dateToString(item.datetime) : "";
    const typeLabel =
      item.images?.length
        ? "Image"
        : item.video && item.video !== "false"
          ? "Video"
          : "";

    return (
      <View
        style={[
          boxShadow,
          commonStyle.p10,
          commonStyle.mb10,
          {
            flexDirection: "row",
            backgroundColor: "#fff",
            borderRadius: moderateScale(10),
            alignItems: "flex-start",
          },
        ]}
      >
        <View
          style={{
            width: moderateScale(110),
            height: moderateScale(110),
            borderRadius: moderateScale(8),
            overflow: "hidden",
            marginRight: moderateScale(10),
            elevation: 4,
          }}
        >
          <Image
            source={{
              uri:
                typeLabel === "Video"
                  ? IMAGE_BASE_URL + item.video_thumbnail
                  : IMAGE_BASE_URL + (item.images?.[0] || ""),
            }}
            style={{ width: "100%", height: "100%", borderRadius: moderateScale(8) }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{ color: colors.textDarker, fontSize: 16, fontWeight: "600" }}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: colors.text, fontSize: 14, marginTop: moderateScale(2) }}
          >
            {item.description}
          </Text>

          <View style={{ flexDirection: "row", marginTop: moderateScale(6), alignItems: "center", flexWrap: "wrap" }}>
            <Text style={{ color: colors.textDarker, fontSize: 12, marginRight: moderateScale(8) }}>
              {datetime}
            </Text>
            {typeLabel !== "" && (
              <View
                style={{
                  backgroundColor: "#F3931454",
                  paddingHorizontal: moderateScale(8),
                  paddingVertical: moderateScale(2),
                  borderRadius: moderateScale(8),
                  marginLeft: "auto",
                }}
              >
                <Text style={{ color: colors.orange, fontSize: moderateScale(10), fontWeight: "600" }}>
                  {typeLabel}
                </Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: "row", width: "100%", columnGap: moderateScale(10) }}>
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
              onPress={() => openModal("delete", "delete", item)}
              textStyle={{ fontSize: moderateScale(12) }}
              style={{ paddingVertical: 0, height: getHeight(30), flex: 2, borderRadius: moderateScale(7) }}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <CRootContainer style={{ marginHorizontal: moderateScale(15), flex: 1 }}>
      <CHeader
        title="Upcoming Notifications"
        RightContainer={
          <View>
            <Menu
              style={[styles.addIcon, { backgroundColor: "#DEDEDE" }]}
              onSelect={handleMenuSelect}
            >
              <MenuTrigger customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
                <View style={{ flexDirection: "row", alignItems: "center", padding: moderateScale(12), borderRadius: 10 }}>
                  <AddIcon height={moderateScale(16)} width={moderateScale(16)} />
                </View>
              </MenuTrigger>
              <MenuOptions customStyles={menuStyles}>
                <MenuOption style={styles.menuItm} value="image">
                  <Text style={{ color: colors.text, fontWeight: "500" }}>Image</Text>
                  <View style={styles.separator} />
                </MenuOption>
                <MenuOption style={styles.menuItm} value="video">
                  <Text style={{ color: colors.text, fontWeight: "500" }}>Video</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
        }
      />

      <View style={{ flex: 1 }}>
        <View style={{ alignItems: "center" }}>
          <View style={styles.filterRowContainer}>
            {[
              { key: "all", label: "All" },
              { key: "filter_image_notification", label: "Images" },
              { key: "filter_video_notification", label: "Videos" },
            ].map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => onChangeFilter(f.key)}
                disabled={filters[f.key as keyof typeof filters]}
                activeOpacity={0.9}
              >
                <View
                  style={[
                    boxShadow,
                    styles.categoryContainer,
                    {
                      borderColor: filters[f.key as keyof typeof filters]
                        ? colors.orange
                        : colors.white,
                      backgroundColor: colors.white,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterTextStyle,
                      {
                        color: filters[f.key as keyof typeof filters]
                          ? colors.orange
                          : colors.textDarker,
                      },
                    ]}
                  >
                    {f.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <SearchInput
            placeholder="Search Notifications"
            leftIcon
            onSearchInput={onSearchInput}
            value={listNotification.search}
          />
        </View>

        {status === "ERROR" && (
          <View style={styles.loaderContainer}>
            <NoDataFound label="No Notifications Found" />
          </View>
        )}

        {status === "LOADING" && <Loader center />}
        {status === "NO_DATA" && (
          <View style={styles.loaderContainer}>
            <NoDataFound label="No Notifications Found" />
          </View>
        )}

        {(status === "SUCCESS" || status === "MORE_LOADING") && (
          <FlatList
            data={listNotification.data}
            renderItem={renderItems}
            keyExtractor={(item) => item._id}
            style={{ marginTop: moderateScale(20) }}
            onEndReachedThreshold={0.1}
            onEndReached={handleLoadMore}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={<NoDataFound label="No Notifications Found" />}
            contentContainerStyle={commonStyle.flexGrow1}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.darker]}
                tintColor={colors.darker}
              />
            }
          />
        )}
      </View>

      <ModalME52
        type={modalData.type as any}
        onClose={onClose}
        onSuccess={onConfirm}
        message={modalData.message}
        name={modalData.name}
        visible={modalData.visible}
        data={modalData.data}
      />
    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    height: SCREEN_HEIGHT - getHeight(200),
    width: SCREEN_WIDTH,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItm: {
    overflow: "hidden",
    paddingLeft: 10,
    paddingVertical: 7,
  },
  addIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  separator: {
    borderWidth: moderateScale(1),
    borderColor: "#eee",
    width: moderateScale(200),
    position: "absolute",
    left: moderateScale(-50),
    top: moderateScale(30),
  },
  filterRowContainer: {
    flexDirection: "row",
    marginBottom: getHeight(15),
    justifyContent: "flex-start",
    width: "100%",
    gap: moderateScale(10),
  },
  categoryContainer: {
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(10),
    borderWidth: moderateScale(1),
  },
  filterTextStyle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});

const menuStyles = {
  optionsContainer: {
    width: 130,
    borderRadius: 16,
    paddingVertical: 10,
  },
};

export default ListNotification;
