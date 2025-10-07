import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, FlatList, Image, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Video from 'react-native-video';
import { useTheme } from '../theme/ThemeProvider';
import { getHeight, getWidth, moderateScale } from '../common/constants';
import Footer from '../components/Footer';
import CHeader from '../components/CHeader';
import { commonStyle } from '../theme';
import Slider from '@react-native-community/slider';

type MessageScreenRouteParam = {
    MessageScreen: {
        message: string;
    };
};

interface INotificationMessage {
    _id: string;
    title: string;
    description: string;
    video: string;
    images: Array<string>;
}

const { width } = Dimensions.get('window');

const MessageScreen = () => {

    console.log("MessageScreen");
    const videoRef = React.useRef<any>(null);

    const route = useRoute<RouteProp<MessageScreenRouteParam, 'MessageScreen'>>();
    const message: any = route.params?.message || null;

    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = React.useRef<FlatList<any>>(null);
    const [data, setData] = useState<INotificationMessage>({
        _id: '',
        description: '',
        title: '',
        video: '',
        images: [],
    });
    const [images, setImages] = useState<string[]>([]);

    const [fullscreen, setFullscreen] = useState(false);
    const [paused, setPaused] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isSliding, setIsSliding] = useState(false);

    const togglePlayPause = () => setPaused(!paused);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    useEffect(() => {
        console.log('useEffect', message);
        if (message) {
            console.log('ME52RETAILERTESTING', 'ME52RETAILERTESTING message', message.message);
            const messageData = JSON.parse(message.message);
            if (messageData?.images?.length) {
                if (typeof messageData?.images === 'string')
                    setImages(JSON.parse(messageData?.images));
                else
                    setImages(messageData?.images);
            } else {
                setImages([]);
            }
            setData(messageData);
        }
    }, [message]);

    // Auto-slide effect for images
    useEffect(() => {
        if (images && images?.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => {
                    const nextIndex = prev + 1;
                    return nextIndex < images?.length ? nextIndex : 0;
                });
            }, 3000); // Change image every 3 seconds
            return () => clearInterval(interval);
        }
    }, [images]);

    useEffect(() => {
        if (flatListRef.current && images?.length > 1) {
            flatListRef.current.scrollToIndex({ index: currentIndex, animated: true });
        }
    }, [currentIndex, images?.length]);

    useEffect(() => {
        if (currentTime === duration && videoRef.current) {
            videoRef.current.seek(0);
            setCurrentTime(0);
            setPaused(false);
        }
    }, [fullscreen]);

    return (
        <ScrollView contentContainerStyle={[
            styles.container,
            fullscreen && { padding: 0 }
        ]}>
            <CHeader title="ME52 Notification" />
            <View style={[
                styles.messageBox,
                fullscreen && {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1000,
                    width: '100%',
                    padding: 0,
                }]}>
                <Text style={[styles.title, { color: colors.boarderDarker }]}>{data?.title}</Text>
                <Text style={[styles.description, { color: colors.boarderDarker }]}>{data?.description}</Text>
                {/* Image Slider */}
                {images?.length > 0 && (
                    <FlatList
                        ref={flatListRef}
                        data={images}
                        horizontal
                        pagingEnabled
                        keyExtractor={(item, index) => index.toString()}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: item }} style={styles.sliderImage} />
                            </View>
                        )}
                        style={styles.slider}
                        onMomentumScrollEnd={e => {
                            const newIndex = Math.round(e.nativeEvent.contentOffset.x / (width - moderateScale(100)));
                            setCurrentIndex(newIndex);
                        }}
                    />
                )}

                {/* Video Section */}
                {data.video ? (
                    <View style={[
                        styles.videoWrapper,
                        fullscreen && {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1000,
                            width: '100%',
                            height: '100%',
                            backgroundColor: "#000",
                            aspectRatio: 9 / 16,
                            borderRadius: 0,
                            padding: 0
                        }]}>

                        {/* Fullscreen Toggle */}
                        <TouchableOpacity
                            onPress={() => setFullscreen(!fullscreen)}
                            style={[styles.fullscreenButton, fullscreen ? {
                                borderWidth: 1,
                                borderColor: '#fff',
                            } : {}]}>
                            {fullscreen ?
                                <Text style={styles.controlTextBack}>↩</Text> :
                                <Text style={styles.controlText}>⛶</Text>}
                        </TouchableOpacity>

                        <Video
                            source={{ uri: data.video }}
                            style={[styles.video, fullscreen && { width: '100%', height: '100%' }]}
                            ref={videoRef}
                            paused={paused}
                            muted={false}
                            repeat={true}
                            controls={false}
                            onError={(e) => console.log("Video error:", e)}
                            onLoad={(meta) => {
                                setDuration(meta.duration);
                                setPaused(false);
                            }}
                            onProgress={(progress) => {
                                if (!isSliding) {
                                    console.log(progress.currentTime);
                                    setCurrentTime(progress.currentTime);
                                }
                            }}
                        />

                        {/* Custom Controls */}
                        <View style={styles.controls}>
                            {/* Play/Pause */}
                            <TouchableOpacity onPress={togglePlayPause} style={styles.controlButton}>
                                <Text style={styles.controlIcon}>{paused ? "▶️" : "⏸️"}</Text>
                            </TouchableOpacity>

                            {/* Slider */}
                            <Slider
                                style={{ flex: 1, marginHorizontal: moderateScale(8) }}
                                minimumValue={0}
                                maximumValue={duration}
                                value={currentTime}
                                minimumTrackTintColor={colors.orange}
                                maximumTrackTintColor="#aaa"
                                thumbTintColor={colors.orange}
                                onValueChange={(value: any) => {
                                    setIsSliding(true)
                                }}
                                onSlidingComplete={(value) => {
                                    setIsSliding(false);
                                    videoRef.current?.seek(value);
                                    setCurrentTime(value);
                                }}
                            />

                            {/* Time */}
                            <Text style={styles.timeText}>
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </Text>
                        </View>
                    </View>
                ) : null}
            </View>
            <Footer />
        </ScrollView>
    );
};

export default MessageScreen;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: moderateScale(20),
        backgroundColor: '#f1f1f1',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: getHeight(10)
    },
    slider: {
        ...commonStyle.mb15,
        borderRadius: moderateScale(20),
    },
    sliderImage: {
        width: '100%',
        height: getHeight(440),
        resizeMode: 'contain',
    },
    messageBox: {
        width: "100%",
        backgroundColor: '#fff',
        borderRadius: moderateScale(12),
        ...commonStyle.p30,
    },
    description: {
        fontSize: 18,
        ...commonStyle.mb15
    },
    imageContainer: {
        width: width - moderateScale(100),
        height: getHeight(440),
    },
    videoWrapper: {
        width: "100%",
        aspectRatio: 16 / 9,
        backgroundColor: '#000',
        borderRadius: moderateScale(12),
        overflow: 'hidden',
        ...commonStyle.mb15,
    },
    video: {
        width: "100%",
        height: "100%",
    },
    fullscreenButton: {
        position: "absolute",
        top: getHeight(20),
        right: getWidth(10),
        backgroundColor: "rgba(0, 0, 0, .5)",
        paddingHorizontal: moderateScale(6),
        paddingVertical: moderateScale(2),
        borderRadius: moderateScale(6),
        zIndex: 1001,
    },
    controls: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: moderateScale(8),
        paddingVertical: moderateScale(6),
        zIndex: 1001,
    },
    controlButton: {
        paddingHorizontal: moderateScale(6),
    },
    controlIcon: {
        color: "#fff",
        fontSize: moderateScale(20),
    },
    controlTextBack: {
        color: "#fff",
        fontSize: moderateScale(28),
    },
    controlText: {
        color: "#fff",
        fontSize: moderateScale(22),
    },
    timeText: {
        color: "#fff",
        fontSize: moderateScale(12),
    },
});
