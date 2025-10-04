import React, { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View, ActivityIndicator } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Card } from './Card';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import useContent from '../hooks/useContent';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { commonStyle } from '../theme';
import { getHeight, moderateScale } from '../common/constants';

const { width } = Dimensions.get('window');
const sliderHeight = getHeight(220);

export const ImageSlider = () => {

  const { colors, theme } = useTheme();
  const styles = createStyles(colors);
  const { users } = useAuth();
  const { fetchContent, loadingStatus, contents } = useContent({ users });

  useEffect(() => {
    fetchContent(true);
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});

  return (
    <Card style={styles.card}>
      <View style={styles.carouselWrap}>
        <Carousel
          width={width}
          height={sliderHeight}
          data={contents}
          style={{ alignSelf: 'center' }}
          loop
          autoPlay
          mode="parallax"
          autoPlayInterval={3500}
          onSnapToItem={setCurrentIndex}
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          renderItem={({ item, index }: { item: any, index: number }) => (
            <View style={styles.imageWrapper}>
              {imageLoading[index] && (
                <SkeletonPlaceholder borderRadius={moderateScale(18)}>
                  <SkeletonPlaceholder.Item width={width} height={sliderHeight} borderRadius={moderateScale(18)} />
                </SkeletonPlaceholder>
              )}
              <Image
                source={item}
                style={[styles.image, imageLoading[index] ? { opacity: 0 } : undefined]}
                onLoadStart={() => setImageLoading((prev) => ({ ...prev, [index]: true }))}
                onLoadEnd={() => setImageLoading((prev) => ({ ...prev, [index]: false }))}
                resizeMode="cover"
              />
            </View>
          )}
        />
      </View>
    </Card>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  card: {
    ...commonStyle.mv15,
    padding: 0,
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
    zIndex: 10000,
  },
  carouselWrap: {
    ...commonStyle.center,
    backgroundColor: 'transparent',
  },
  imageWrapper: {
    borderRadius: moderateScale(18),
    overflow: 'hidden',
  },
  image: {
    width: width,
    height: sliderHeight,
    borderRadius: moderateScale(18)
  },
  skeleton: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width,
    height: sliderHeight,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
});
