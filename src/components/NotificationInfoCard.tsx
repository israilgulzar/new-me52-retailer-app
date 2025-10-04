import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Image
} from 'react-native';
import { Card } from './Card';
import Text from './Text';
import { useTheme } from '../theme/ThemeProvider';
import Dot from './Dot';
import Button from './Button';
import UsageBar from './UsageBar';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { getHeight, moderateScale } from '../common/constants';
import { commonStyle } from '../theme';

import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from "../context/AuthContext"
import { useFocusEffect } from '@react-navigation/native';

interface NotificationInfoCardProps {
	onManageNotification: () => void;
	onAddNotification: (params?: any) => void;
}

export const NotificationInfoCard = ({
	onManageNotification,
	onAddNotification,
}: NotificationInfoCardProps) => {

	const { colors, theme } = useTheme();
	const bottomRef = useRef<BottomSheetModal>(null)
	const snapPoints = useMemo(() => [600], [])

	const { users } = useAuth();
	const {
		imageNotificationCount,
		fetchImageNotificationsCount,
		videoNotificationCount,
		fetchVideoNotificationsCount
	} = useDashboard({ users });

	useFocusEffect(
		useCallback(() => {
			const mounted = true;
			fetchImageNotificationsCount(mounted);
			fetchVideoNotificationsCount(mounted);
		}, [])
	)

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

	return (
		<View style={styles.wrapper}>
			<Card style={styles.card}>
				{/* Top Row */}
				<View >
					<View style={styles.topRow}>
						<View style={styles.labelRow}>
							{/* <NotificationDashboard/> */}
							<Image source={require("../assets/notification_icon_card.png")} style={{ marginRight: moderateScale(6), width: moderateScale(40), height: moderateScale(40) }} />
							<Text variant="body" style={styles.label}>Notification</Text>
						</View>
					</View>
					{/* Middle Grid */}
					<View style={styles.statsRow}>
						<View style={[styles.dotContainer, { justifyContent: 'space-between', width: "100%", marginBottom: 10 }]}>
							{/* Active */}
							<View>
								<View style={[styles.dotContainer]}>
									<Dot color={colors.mediumOrange} />
									<Text variant='caption' style={commonStyle.ml10}>{imageNotificationCount}</Text>
								</View>
								<Text style={[styles.fontSize10]}>Image Notifications</Text>
							</View>
							{/* Inactive */}
							<View>
								<View style={[styles.dotContainer]}>
									<Dot color={colors.lightOrange} />
									<Text variant='caption' style={commonStyle.ml10}>{videoNotificationCount}</Text>
								</View>
								<Text style={[styles.fontSize10]}>Video Notification</Text>
							</View>
						</View>
						<UsageBar
							params1={imageNotificationCount ? imageNotificationCount : 0}
							params2={videoNotificationCount ? videoNotificationCount : 0}
						/>
					</View>
					<View style={styles.bottomRow}>
						<Button variant='darker' onPress={() => bottomRef.current?.present()} title='Schedule' style={{ width: '40%', }} smaller={true} />
						<Button variant='outline_darker' onPress={onManageNotification} title='Manage Schedule' style={{ width: '55%', }} smaller={true} />
					</View>
				</View>
			</Card>
			<BottomSheetModal
				ref={bottomRef}
				index={0}
				snapPoints={snapPoints}
				enablePanDownToClose={true}
				backdropComponent={renderBackdrop}
			>
				<BottomSheetScrollView style={{ height: getHeight(1200) }}>
					<View style={commonStyle.mt25}>
						<TouchableOpacity onPress={() => onAddNotification({ type: 'image' })}>
							<View style={{ height: getHeight(65), alignItems: 'center', justifyContent: "center", borderWidth: moderateScale(1), borderColor: "#E1E1E1" }}>
								<Text style={{ color: colors.text, fontSize: 16 }}>Image Notification</Text>
							</View>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => onAddNotification({ type: 'video' })}>
							<View style={{ height: getHeight(65), alignItems: 'center', justifyContent: "center", borderWidth: moderateScale(1), borderColor: "#E1E1E1" }}>
								<Text style={{ color: colors.text, fontSize: 16 }}>Video Notification</Text>
							</View>
						</TouchableOpacity>
					</View>
				</BottomSheetScrollView>
			</BottomSheetModal>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		...commonStyle.mv5,
		// paddingHorizontal: 16,
	},
	card: {
		width: '100%',
		maxWidth: moderateScale(420),
		...commonStyle.p15,
		borderRadius: moderateScale(20),
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	topRow: {
		...commonStyle.rowSpaceBetween,
		...commonStyle.mb15,
	},
	labelRow: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	label: {
		fontWeight: 'bold',
		fontSize: 16,
		letterSpacing: 0.5,
	},
	totalLabel: {
		fontWeight: 'bold',
		fontSize: 16,
		letterSpacing: 0.5,
	},
	statsRow: {
		// flexDirection: 'row',
		justifyContent: 'space-between',
		...commonStyle.mb15,
		gap: moderateScale(8),
	},
	statBlock: {
		flex: 1,
		alignItems: 'center',
		marginHorizontal: 4,
		paddingTop: 10,
		paddingBottom: 2,
		borderRadius: 12,
		borderWidth: 1.5,
		minWidth: 90,
		backgroundColor: '#FFF8E1',
	},
	statLabel: {
		marginTop: 2,
		marginBottom: 2,
		fontWeight: '600',
		fontSize: 14,
		textAlign: 'center',
	},
	statValue: {
		fontSize: 22,
		fontWeight: 'bold',
		marginTop: 2,
	},
	separator: {
		height: 1,
		marginTop: 5,
		marginBottom: 8,
		width: '100%',
		opacity: 0.5,
	},
	bottomRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'stretch',
		...commonStyle.mt2,
		...commonStyle.mb2,
		width: '100%',
	},
	bottomActionWrap: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	bottomBtn: {
		paddingTop: 4,
		paddingHorizontal: 8,
		borderRadius: 8,
	},
	bottomAction: {
		fontWeight: '700',
		textAlign: 'center',
		minWidth: 70,
	},
	link: {
		fontWeight: '700',
		fontSize: 16,
		textAlign: 'center',
		alignSelf: 'center',
		minWidth: 70,
	},
	verticalDivider: {
		width: 1,
		height: 28,
		marginHorizontal: 8,
		alignSelf: 'center',
		justifyContent: 'center',
		backgroundColor: '#FFA000',
		opacity: 0.6,
	},
	dotContainer: {
		flexDirection: 'row'
	},
	fontSize10: {
		fontSize: 10
	}
});
