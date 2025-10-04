import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import Text from '../components/Text';
import Input from '../components/Input';
import { useNavigation } from '@react-navigation/native';
import HeaderLeft from '../components/HeaderLeft';
import CaretUp from "../assets/caret-up.svg"
import CaretDown from "../assets/caret-down.svg"
import useFaq from '../hooks/useFaq';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import { getHeight, moderateScale } from '../common/constants';
import { WebView } from 'react-native-webview';
import CRootContainer from './CRootContainer';
import CHeader from './CHeader';
import { commonStyle } from '../theme';
import NoDataFound from './NoDataFound';
import Loader from './Loader';
import Overlay from './Overlat';


// Helper to convert YouTube link to embed link
const convertYoutubeLinkToEmbed = (link: string): string => {
  let videoId = '';
  if (link.includes('youtu.be/')) {
    videoId = link.split('youtu.be/')[1].split('?')[0];
  } else if (link.includes('youtube.com/watch?v=')) {
    videoId = link.split('v=')[1].split('&')[0];
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : link;
};

const FaqScreen = () => {

  const { users } = useAuth();
  const { fetchFaq, loadingStatus, faqs } = useFaq({ users });

  const navigation = useNavigation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [filteredFaq, setFilteredFaq] = useState<any>([]);
  const [search, setSearch] = useState('');

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  useEffect(() => {
    fetchFaq(true);
  }, []);


  useEffect(() => {
    if (faqs) setFilteredFaq(faqs);
  }, [faqs]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredFaq(faqs);
    } else {
      const lowerSearch = search.toLowerCase();
      setFilteredFaq(
        faqs.filter(
          (item: any) =>
            item.question.toLowerCase().includes(lowerSearch) ||
            item.answer.toLowerCase().includes(lowerSearch)
        )
      );
    }
  }, [search, faqs]);

  return (
    <CRootContainer style={styles.container}>
      <CHeader title="FAQ" style={commonStyle.ph25} />
      {/* Search Input */}
      <Input
        placeholder="Search Here..."
        style={styles.input}
        value={search}
        onChangeText={setSearch}
      />
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={commonStyle.flexGrow1}
      >
        {loadingStatus && <View style={commonStyle.flexCenter}>
          <Loader center />
        </View>}
        {!loadingStatus && filteredFaq.length > 0 ? (
          filteredFaq.map((item: any, index: number) => (
            <View key={index} style={styles.card}>
              <TouchableOpacity style={[styles.cardHeader,
              expandedIndex === index ? styles.cardHeaderExpanded : styles.cardHeaderCollapsed
              ]} onPress={() => toggleExpand(index)}>
                <Text variant="body"
                  style={styles.question}>
                  {item.question}
                </Text>
                {expandedIndex === index
                  ? <CaretUp width={moderateScale(15)} height={moderateScale(15)} /> : <CaretDown width={moderateScale(15)} height={moderateScale(15)} />}
              </TouchableOpacity>
              {expandedIndex === index && (
                <View style={styles.cardBody}>
                  <Text variant="body">{item.answer}</Text>
                  {/* Show video if videoLink exists and is a valid YouTube link */}
                  {item.videoLink && item.videoLink.includes('youtu') ? (
                    <View style={styles.videoContainer}>
                      <WebView
                        originWhitelist={["*"]}
                        style={styles.video}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsFullscreenVideo={true}
                        source={{
                          html: `
                            <html>
                              <body style='margin:0;padding:0;'>
                                <iframe
                                  width='100%'
                                  height='100%'
                                  src='${convertYoutubeLinkToEmbed(item.videoLink)}'
                                  frameborder='0'
                                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                  allowfullscreen
                                ></iframe>
                              </body>
                            </html>
                          `
                        }}
                      />
                    </View>
                  ) : (
                    <Image style={styles.cardImage} resizeMode="cover" />
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          !loadingStatus && <NoDataFound label='No FAQs found' />
        )}
      </ScrollView>

      <Footer />

    </CRootContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F6',
    // padding: 16,
    // paddingHorizontal: moderateScale(15),
    // paddingBottom: 80,
  },
  videoContainer: {
    width: '100%',
    height: getHeight(200),
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    ...commonStyle.mt10
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(10),
  },
  input: {
    borderRadius: moderateScale(12),
    paddingHorizontal: moderateScale(16),
    ...commonStyle.mb20,
    ...commonStyle.mh10,

  },
  card: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    marginBottom: getHeight(12),
    ...commonStyle.mh25,
    padding: moderateScale(12),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  dropdownIcon: {
    width: moderateScale(20),
    height: moderateScale(20),
    tintColor: '#333',
  },
  cardBody: {
    ...commonStyle.mt10,
    gap: moderateScale(10),
  },
  cardImage: {
    width: '100%',
    height: getHeight(140),
    borderRadius: moderateScale(10),
  },
  cardHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    ...commonStyle.pb10
  },
  cardHeaderCollapsed: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',

  },
});

export default FaqScreen;
