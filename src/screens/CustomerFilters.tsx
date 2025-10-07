import { memo, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../theme/ThemeProvider"
import Button from "../components/Button"
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../constant"
import Uninstalled from "../assets/uninstall.svg"
import DateRangeInput from "../components/DateRangeCalendars"
import { scaleSM } from "../utility/helpers"
import { boxShadow } from "../styles/styles"

import ActiveUser from "../assets/active.svg"
import InactiveUser from "../assets/inactive.svg"
import Lockfilter from "../assets/lock_filter.svg"
import LockfilterWhite from "../assets/lock_filter_white.svg"
import Unlockfilter from "../assets/unlock_filter.svg"
import UnlockfilterWhite from "../assets/unlock_filter_white.svg"
import AllFilterWhite from "../assets/menu_all_white.svg"
import AllFilter from "../assets/menu_all.svg"

import Forms from "../components/Forms"
import { USER_FILE_FORM } from "./userData"
import { getHeight, moderateScale } from "../common/constants";
import { commonStyle } from "../theme";

const CustomerFilters = memo(({ filters, handleApplyFilter, handleResetFilter }:
    { filters: any, handleApplyFilter: any, handleResetFilter: any }) => {

    const [myfilters, setMyFilters] = useState<any>({})
    const [filterform, setFilterForm] = useState(USER_FILE_FORM)
    const [errors, setErrors] = useState({})
    const { colors } = useTheme();
    const [applyFilters, setApplyFilters] = useState({
        all: false,
        blocked: false,
        unblocked: false,
        startDate: '',
        endDate: ''
    });

    useEffect(() => {

        if (filters) {
            let newApplyFilters = {
                all: false,
                blocked: false,
                unblocked: false,
                startDate: '',
                endDate: ''
            };
            if (filters.hasOwnProperty('is_blocked')) {
                newApplyFilters.blocked = filters.is_blocked === true;
                newApplyFilters.unblocked = filters.is_blocked === false;
            } else {
                newApplyFilters.all = true;
            }
            if (filters.startDate) newApplyFilters.startDate = filters.startDate;
            if (filters.endDate) newApplyFilters.endDate = filters.endDate;
            setApplyFilters(newApplyFilters);
            setMyFilters({ ...filters, ...newApplyFilters });
        }

        for (const formFields of filterform) {
            if (formFields.component) {
                for (const formComp of formFields.component) {
                    if (filters.hasOwnProperty(formComp.key))
                        formComp.value = (filters[formComp.key]).toUpperCase();
                }
            }
        }
        setFilterForm([...filterform]);
    }, [filters])

    useEffect(() => {
        let updatedFilters = { ...myfilters };
        for (const formFields of filterform) {
            if (formFields.component) {
                for (const formComp of formFields.component) {
                    if (formComp.value)
                        updatedFilters[formComp.key] = (formComp.value).toLowerCase();
                    else
                        delete updatedFilters[formComp.key];
                }
            }
        }
        setMyFilters({ ...updatedFilters });
    }, [filterform])

    useEffect(() => {
        // Keep myfilters in sync with applyFilters toggles
        let updatedFilters = { ...myfilters };
        if (applyFilters.all) {
            delete updatedFilters['is_active'];
            delete updatedFilters['is_blocked'];
        } else {
            if (applyFilters.blocked) {
                updatedFilters['is_blocked'] = true;
            } else if (applyFilters.unblocked) {
                updatedFilters['is_blocked'] = false;
            } else {
                delete updatedFilters['is_blocked'];
            }
        }
        // Always sync date fields
        updatedFilters.startDate = applyFilters.startDate;
        updatedFilters.endDate = applyFilters.endDate;
        setMyFilters({ ...updatedFilters });
    }, [applyFilters])

    const handleChangeDateRange = (value: any, key: string) => {
        // Update both applyFilters and myfilters for date range
        setApplyFilters((prev: any) => ({ ...prev, startDate: value.startDate, endDate: value.endDate }));
        setMyFilters((prev: any) => ({ ...prev, startDate: value.startDate, endDate: value.endDate }));
    }

    const onFilterChange = (key: string, prevState: boolean) => {
        // Update both applyFilters and myfilters for toggles
        setApplyFilters((prev: any) => {
            let all = false;
            let count = 0;
            if (key === "all") {
                all = true;
                let newState = { ...prev };
                for (let p in newState) {
                    if (p !== "startDate" && p !== "endDate" && p !== "all") {
                        newState[p] = false;
                    }
                }
                newState.all = all;
                return newState;
            } else {
                if (!prevState) {
                    all = false;
                } else {
                    for (let pr in prev) {
                        if (pr !== "all" && pr !== key && pr !== "startDate" && pr !== "endDate") {
                            if (!prev[pr as keyof typeof prev]) {
                                count++;
                            }
                        }
                    }
                    if (prevState) count++;
                    if (Object.keys(prev).length - 1 === count) all = true;
                }
            }
            return { ...prev, [key]: !prevState, all };
        });
    }

    const onPressApply = () => {
        console.log("APPLY FILTERS<<<<<", myfilters);
        handleApplyFilter(myfilters);
    }

    return (
        <View>
            <View style={commonStyle.ph15} >
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                    Filters
                </Text>
                <View style={commonStyle.mv15}>
                    <DateRangeInput
                        value={{
                            startDate: myfilters.startDate,
                            endDate: myfilters.endDate
                        }}
                        onChangeText={(value, key) => handleChangeDateRange(value, key)}
                        placeholder="Start Date - End Date"
                    />
                </View>
                <View style={[styles.filterRow]}>
                    {/* <TouchableOpacity onPress={() => onFilterChange("all", applyFilters.all)} style={[styles.filterContent, boxShadow, { backgroundColor: applyFilters.all ? colors.orange : '#fff' }]} activeOpacity={0.8}>
                        <Text style={[{ color: applyFilters.all ? "#fff" : colors.textDarker, lineHeight: 24 }, styles.margin6]}>All</Text>
                        {applyFilters.all ? <AllFilterWhite /> : <AllFilter stroke={applyFilters.all ? "#fff" : colors.textDarker} strokeWidth={100} />}
                    </TouchableOpacity> */}
                    {/* <TouchableOpacity style={[styles.filterContent, boxShadow, { backgroundColor: applyFilters.uninstalled ? colors.orange : '#fff' }]}
                        onPress={() => onFilterChange("uninstalled", applyFilters.uninstalled)}>
                        <Text style={[{ color: applyFilters.uninstalled ? "#fff" : colors.textDarker }, styles.margin6]}>Uninstalled</Text>
                        <Uninstalled strokeWidth={100} stroke={applyFilters.uninstalled ? "#fff" : colors.textDarker} />
                    </TouchableOpacity> */}
                </View>
                {/* <View style={[styles.filterRow]}>
                    <TouchableOpacity onPress={() => onFilterChange("active", applyFilters.active)} style={[styles.filterContent, boxShadow, { backgroundColor: applyFilters.active ? colors.orange : '#fff' }]} activeOpacity={0.8}>
                        <Text style={[{ color: applyFilters.active ? "#fff" : colors.textDarker, lineHeight: 24 }]}>Active</Text>
                        <ActiveUser stroke={applyFilters.active ? "#fff" : colors.textDarker} strokeWidth={100} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterContent, boxShadow, { backgroundColor: applyFilters.inactive ? colors.orange : '#fff' }]}
                        onPress={() => onFilterChange("inactive", applyFilters.inactive)}>
                        <Text style={[{ color: applyFilters.inactive ? "#fff" : colors.textDarker }]}>Inactive</Text>
                        <InactiveUser stroke={applyFilters.inactive ? "#fff" : colors.textDarker} strokeWidth={100} />
                    </TouchableOpacity>
                </View> */}
                {/* <View style={[styles.filterRow]}>
                    <TouchableOpacity onPress={() => onFilterChange("blocked", applyFilters.blocked)} style={[styles.filterContent, boxShadow, { backgroundColor: applyFilters.blocked ? colors.orange : '#fff' }]} activeOpacity={0.8}>
                        <Text style={[{ color: applyFilters.blocked ? "#fff" : colors.textDarker, lineHeight: 24 }]}>Blocked</Text>
                        {applyFilters.blocked ? <LockfilterWhite /> : <Lockfilter color={colors.textDark} />}
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.filterContent, boxShadow, { backgroundColor: applyFilters.unblocked ? colors.orange : '#fff' }]}
                        onPress={() => onFilterChange("unlocked", applyFilters.unblocked)}>
                        <Text style={[{ color: applyFilters.unblocked ? "#fff" : colors.textDarker }]}>Unblocked</Text>
                        {applyFilters.unblocked ? <UnlockfilterWhite /> : <Unlockfilter />}
                    </TouchableOpacity>
                </View> */}
            </View>
            {/* <Forms formFields={filterform} formState={filterform} setFormState={setFilterForm} errors={errors} setErrors={setErrors} styleTwoColumn={commonStyle.ph15} /> */}
            {/* <View style={{ marginBottom: 20 }}>
                <DateRangeInput
                    value={{
                        startDate: applyFilters.startDate,
                        endDate: applyFilters.endDate,
                    }}
                    onChangeText={(value, key) => handleChangeDateRange(value, key)}
                    placeholder="Start Date - End Date"
                />
            </View> */}
            <View style={styles.buttonContainer} >
                <Button variant="darker" title="Reset" onPress={handleResetFilter}
                    textStyle={{ color: colors.textDark }}
                    style={{ ...styles.resetButtonStyle, backgroundColor: colors.white, borderColor: colors.textDark }} />
                <Button variant="darker" title="Apply" onPress={onPressApply}
                    style={styles.applyButtonStyle}

                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    loader: {
        alignItems: 'center',
        height: SCREEN_HEIGHT
    },
    loaderContainer: {
        // flex: 1,
        height: SCREEN_HEIGHT - 200,
        width: SCREEN_WIDTH,
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
        ...commonStyle.pb5,
    },
    filterContent: {
        width: "48%",
        height: getHeight(55),
        backgroundColor: "#fff",
        flexDirection: 'row',
        justifyContent: "space-between"
    },
    margin6: {
        ...commonStyle.mr6
    },
    filterRow: {
        flexDirection: 'row',
        gap: moderateScale(15),
        ...commonStyle.mb20,
        alignItems: 'center'
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        ...commonStyle.p5,
    },
    menuText: {
        ...commonStyle.ml20,
        fontSize: 14,
        color: '#333',
    },
    buttonContainer: {
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
})

export default CustomerFilters
