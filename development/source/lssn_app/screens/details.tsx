import type { StaticScreenProps } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getLssn, reactToSlide, resolveAssetUrl } from '../lib/api';
import { darkTheme } from '../lib/theme';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;

type CanvasElement = {
  id: string; type: 'text' | 'rectangle' | 'circle' | 'star' | 'image';
  x: number; y: number; width: number; height: number;
  content?: string; src?: string; fill?: string; color?: string; fontSize?: number;
};

type Props = StaticScreenProps<{ lssnId: number }>;

export default function Details({ route }: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const [lssn, setLssn] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(Dimensions.get('window').height - 200);
  const [userReactions, setUserReactions] = useState<Set<number>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true); setError(null);
      try {
        const data = await getLssn(route.params?.lssnId ?? 0);
        setLssn(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load lesson');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [route.params?.lssnId]);

  const slides = useMemo(() => {
    if (!lssn?.content?.cardsData) return [];
    const items = lssn.content.items ?? [];
    return items.map((itemId: number) => ({ itemId, elements: lssn.content.cardsData[itemId] ?? [] }));
  }, [lssn]);

  const handleReaction = async (slideIndex: number, reaction: 'like' | 'dislike') => {
    const key = slideIndex * 2 + (reaction === 'like' ? 0 : 1);
    try {
      await reactToSlide(route.params?.lssnId ?? 0, slideIndex, reaction);
      setUserReactions((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
      });
    } catch (err) { console.error('Reaction failed:', err); }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={darkTheme.primary} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Feather name="alert-circle" size={44} color={darkTheme.destructive} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const CANVAS_RENDER_WIDTH = windowWidth - 32;
  const CANVAS_RENDER_HEIGHT = CANVAS_RENDER_WIDTH * (CANVAS_HEIGHT / CANVAS_WIDTH);
  const canvasScale = CANVAS_RENDER_WIDTH / CANVAS_WIDTH;

  return (
    <View style={styles.container}>
      {slides.length > 0 && (
        <View style={styles.progressBar}>
          {slides.map((_: any, i: any) => (
            <View key={i} style={[styles.progressSegment, { flex: 1 }, i <= currentIndex ? { backgroundColor: darkTheme.primary } : { backgroundColor: darkTheme.border }, i > 0 && { marginLeft: 3 }]} />
          ))}
        </View>
      )}

      <View style={styles.slideInfoRow}>
        <Text style={styles.lessonTitle} numberOfLines={1}>{lssn?.title}</Text>
        <View style={styles.slideCountBadge}>
          <Text style={styles.slideCountText}>{slides.length > 0 ? currentIndex + 1 + ' / ' + slides.length : ''}</Text>
        </View>
      </View>

      {slides.length === 0 ? (
        <View style={styles.center}>
          <Feather name="file-text" size={44} color={darkTheme.mutedForeground} />
          <Text style={styles.emptyText}>No slides in this lesson</Text>
        </View>
      ) : (
        <View style={styles.flatListContainer} onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}>
          <FlatList
            ref={flatListRef}
            data={slides}
            keyExtractor={(item) => item.itemId.toString()}
            pagingEnabled
            showsVerticalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={containerHeight}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({ length: containerHeight, offset: containerHeight * index, index })}
            onViewableItemsChanged={({ viewableItems }) => {
              if (viewableItems[0]) setCurrentIndex(viewableItems[0].index ?? 0);
            }}
            viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
            renderItem={({ item, index }) => (
              <View style={{ height: containerHeight, justifyContent: 'space-between' }}>
                <View style={styles.canvasWrapper}>
                  <View style={[styles.canvasContainer, { width: CANVAS_RENDER_WIDTH, height: CANVAS_RENDER_HEIGHT }]}>
                    {item.elements.length > 0 ? (
                      item.elements.map((el: CanvasElement) => <SlideElement key={el.id} element={el} scale={canvasScale} />)
                    ) : (
                      <View style={styles.emptySlide}>
                        <Feather name="file-text" size={32} color={darkTheme.mutedForeground} />
                        <Text style={styles.emptySlideText}>No content</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.footer}>
                  <TouchableOpacity style={[styles.reactionBtn, userReactions.has(index * 2) && styles.reactionBtnLiked]} onPress={() => handleReaction(index, 'like')} activeOpacity={0.8}>
                    <Feather name="thumbs-up" size={16} color={userReactions.has(index * 2) ? darkTheme.primary : darkTheme.mutedForeground} />
                    <Text style={[styles.reactionLabel, userReactions.has(index * 2) && { color: darkTheme.primary }]}>Like</Text>
                  </TouchableOpacity>

                  <View style={styles.navButtons}>
                    <TouchableOpacity style={[styles.navBtn, index === 0 && styles.navBtnDisabled]} disabled={index === 0} onPress={() => flatListRef.current?.scrollToIndex({ index: index - 1, animated: true })}>
                      <Feather name="chevron-up" size={20} color={index === 0 ? darkTheme.border : darkTheme.foreground} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.navBtn, index === slides.length - 1 && styles.navBtnDisabled]} disabled={index === slides.length - 1} onPress={() => flatListRef.current?.scrollToIndex({ index: index + 1, animated: true })}>
                      <Feather name="chevron-down" size={20} color={index === slides.length - 1 ? darkTheme.border : darkTheme.foreground} />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={[styles.reactionBtn, userReactions.has(index * 2 + 1) && styles.reactionBtnDisliked]} onPress={() => handleReaction(index, 'dislike')} activeOpacity={0.8}>
                    <Feather name="thumbs-down" size={16} color={userReactions.has(index * 2 + 1) ? darkTheme.destructive : darkTheme.mutedForeground} />
                    <Text style={[styles.reactionLabel, userReactions.has(index * 2 + 1) && { color: darkTheme.destructive }]}>Dislike</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

function SlideElement({ element, scale }: { element: CanvasElement; scale: number }) {
  const borderRadius = element.type === 'circle' ? (Math.min(element.width, element.height) / 2) * scale : element.type === 'star' ? 4 : 8;
  const bgColor = element.type === 'text' ? undefined : (element.fill ?? '#E2E8F0');
  return (
    <View style={{ position: 'absolute', left: element.x * scale, top: element.y * scale, width: element.width * scale, height: element.height * scale, backgroundColor: bgColor, borderRadius, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      {element.type === 'text' ? (
        <Text style={{ color: element.color ?? '#1a1a24', fontSize: (element.fontSize ?? 14) * scale, textAlign: 'center', paddingHorizontal: 6 }}>{element.content ?? ''}</Text>
      ) : element.type === 'image' && element.src ? (
        <Image source={{ uri: resolveAssetUrl(element.src) ?? '' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.background },
  center: { flex: 1, backgroundColor: darkTheme.background, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  loadingText: { color: darkTheme.mutedForeground, fontSize: 14 },
  errorText: { color: darkTheme.destructive, fontSize: 15, textAlign: 'center' },
  emptyText: { color: darkTheme.mutedForeground, fontSize: 15 },
  progressBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10 },
  progressSegment: { height: 3, borderRadius: 2 },
  slideInfoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10 },
  lessonTitle: { fontSize: 14, fontWeight: '600', color: darkTheme.foreground, flex: 1 },
  slideCountBadge: { backgroundColor: darkTheme.card, borderWidth: 1, borderColor: darkTheme.border, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3, marginLeft: 10 },
  slideCountText: { fontSize: 12, fontWeight: '600', color: darkTheme.mutedForeground },
  flatListContainer: { flex: 1 },
  canvasWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingTop: 8 },
  canvasContainer: { backgroundColor: '#ffffff', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: darkTheme.border, position: 'relative' },
  emptySlide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptySlideText: { fontSize: 14, color: darkTheme.mutedForeground, fontStyle: 'italic' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: darkTheme.border, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: darkTheme.background },
  reactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: darkTheme.border, backgroundColor: darkTheme.card },
  reactionBtnLiked: { borderColor: darkTheme.primary, backgroundColor: darkTheme.primary + '15' },
  reactionBtnDisliked: { borderColor: darkTheme.destructive, backgroundColor: darkTheme.destructive + '15' },
  reactionLabel: { fontSize: 13, fontWeight: '600', color: darkTheme.mutedForeground },
  navButtons: { flexDirection: 'row', gap: 8 },
  navBtn: { width: 40, height: 40, borderRadius: 10, backgroundColor: darkTheme.card, borderWidth: 1, borderColor: darkTheme.border, alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.35 },
});
