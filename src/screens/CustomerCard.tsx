import { memo } from "react";
import { Image, View, Text, StyleSheet } from "react-native";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";

import { useTheme } from "../theme/ThemeProvider";
import { commonStyle } from "../theme";

import Button from "../components/Button";
import { Card } from "../components/Card";

import KebabMenu from "../assets/menu.svg";
import ShareI from "../assets/share.svg";
import Uninstalled from "../assets/uninstall.svg";
import Qrcode from "../assets/qr-code-2.svg";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constant";
import { moderateScale } from "../common/constants";

const CustomerCard = ({
  item,
  handleOnSelectMenu,
  openDetailPage,
}: {
  item: any;
  handleOnSelectMenu: any;
  openModal: any;
  openDetailPage: any;
}) => {
  const { colors } = useTheme();

  return (
    <Card key={item.id} style={cardStyles.card}>
      <View style={cardStyles.cardContainer}>
        <View style={cardStyles.contentContainer}>
          <View style={cardStyles.imageCard}>
            <Image
              style={cardStyles.image}
              source={
                item.device?.loan?.photo
                  ? { uri: item.device.loan.photo }
                  : require("../assets/image_placeholder.png")
              }
              alt={item.name}
              resizeMode="cover"
            />
            <Text style={cardStyles.active}>
              {item.is_blocked ? "Blocked" : "Active"}
            </Text>
          </View>

          <View style={cardStyles.personalCard}>
            <View style={cardStyles.nameBlock}>
              <Text style={[cardStyles.name, { color: colors.textDark }]}>
                {item.name}
              </Text>

              <Menu onSelect={(value) => handleOnSelectMenu(value, item)}>
                <MenuTrigger style={{ paddingHorizontal: 15 }}>
                  <KebabMenu />
                </MenuTrigger>
                <MenuOptions customStyles={menuStyles}>
                  <MenuOption value="share" style={{ overflow: "hidden" }}>
                    <View style={[styles.menuItem, { marginBottom: 10 }]}>
                      <View
                        style={{
                          width: 25,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <ShareI />
                      </View>
                      <Text style={{ color: colors.textDarker, marginLeft: 10 }}>
                        Share
                      </Text>
                    </View>
                    <View
                      style={{
                        borderColor: "#F2F2F2",
                        borderWidth: 1,
                        width: "100%",
                      }}
                    />
                  </MenuOption>

                  <MenuOption value="uninstall">
                    <View style={styles.menuItem}>
                      <View
                        style={{
                          width: 25,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Uninstalled />
                      </View>
                      <Text style={{ color: colors.textDarker, marginLeft: 10 }}>
                        Uninstall
                      </Text>
                    </View>
                    <View
                      style={{
                        borderColor: "#F2F2F2",
                        borderWidth: 1,
                        width: "100%",
                      }}
                    />
                  </MenuOption>

                  <MenuOption value="qrcode">
                    <View style={styles.menuItem}>
                      <View
                        style={{
                          width: 25,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Qrcode />
                      </View>
                      <Text style={{ color: colors.textDarker, marginLeft: 10 }}>
                        QR Code
                      </Text>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
            </View>

            <Text style={{ color: colors.textLight }}>{item.email}</Text>
            <Text style={{ color: colors.textLight }}>
              {item.phone_country_code.startsWith("+")
                ? item.phone_country_code
                : `+${item.phone_country_code}`}{" "}
              {item.phone} /{" "}
              {item.alternate_phone_country_code.startsWith("+")
                ? item.alternate_phone_country_code
                : `+${item.alternate_phone_country_code}`}{" "}
              {item.alternate_phone}
            </Text>
            <Text style={{ color: colors.textLight }}>
              IMEI : {item.device.imei1}
            </Text>
          </View>
        </View>

        {item?.loan_company_by && item?.loan_date && (
          <View>
            <Text style={{ color: colors.textLight }}>
              Loan By : {item.loan_company_by?.name || "N/A"}
            </Text>
            <Text style={{ color: colors.textLight }}>
              Loan Date :{" "}
              {item.loan_date ? item.loan_date.split(" - ")[0] : "N/A"}
            </Text>
          </View>
        )}

        <View style={cardStyles.buttonContainer}>
          <Button
            title="Edit"
            onPress={() => openDetailPage(item)}
            variant="orange"
            style={cardStyles.button}
            smaller
          />
        </View>
      </View>
    </Card>
  );
};

const menuStyles = {
  optionsContainer: {
    borderRadius: 10,
    width: 150,
  },
};

const cardStyles = StyleSheet.create({
  card: {
    ...commonStyle.mv10,
    marginHorizontal: 0,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  imageCard: {
    width: "30%",
    padding: 5,
    borderRadius: 18,
    backgroundColor: "#fff",
    shadowOpacity: 0.2,
    elevation: 4,
    shadowColor: "#000",
    alignItems: "center",
    marginBottom: 20,
    marginRight: 10,
  },
  image: {
    width: moderateScale(80),
    height: moderateScale(80),
    borderRadius: moderateScale(10),
    backgroundColor: "#e5e5e5ff",
  },
  active: {
    fontSize: 12,
    fontWeight: "500",
    color: "#555",
    backgroundColor: "#eee",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    marginTop: 8,
    overflow: "hidden",
    textTransform: "capitalize",
  },
  personalCard: {
    width: "70%",
    borderRadius: 18,
    padding: 5,
  },
  nameBlock: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 18,
    fontWeight: "500",
    paddingBottom: 5,
  },
  contentContainer: {
    flexDirection: "row",
  },
  cardContainer: {},
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    width: "100%",
    paddingVertical: 5,
    paddingLeft: 5,
    justifyContent: "center",
    marginRight: 4,
  },
});

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  menuText: {
    marginLeft: 20,
    fontSize: 14,
    color: "#333",
  },
});

const areEqual = (prev: any, next: any) => prev.item._id === next.item._id;

export default memo(CustomerCard, areEqual);
