import type { StaticScreenProps } from '@react-navigation/native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [lssn, setLssn] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState(windowHeight);
  const [userReactions, setUserReactions] = useState<Set<number>>(new Set());
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setContainerHeight(windowHeight);
  }, [windowHeight]);

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

  const CANVAS_RENDER_WIDTH = windowWidth;
  const CANVAS_RENDER_HEIGHT = containerHeight;
  const canvasScaleX = CANVAS_RENDER_WIDTH / CANVAS_WIDTH;
  const canvasScaleY = CANVAS_RENDER_HEIGHT / CANVAS_HEIGHT;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Feather name="x" size={20} color={darkTheme.foreground} />
        </TouchableOpacity>
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
            horizontal={false}
            showsVerticalScrollIndicator={false}
            snapToAlignment="start"
            snapToInterval={containerHeight}
            decelerationRate="fast"
            getItemLayout={(_, index) => ({ length: containerHeight, offset: containerHeight * index, index })}
            renderItem={({ item, index }) => (
              <View style={{ height: containerHeight, width: windowWidth, justifyContent: 'center' }}>
                <View style={styles.canvasWrapper}>
                  <View style={[styles.canvasContainer, { width: CANVAS_RENDER_WIDTH, height: CANVAS_RENDER_HEIGHT }]}>
                    {item.elements.length > 0 ? (
                      item.elements.map((el: CanvasElement) => <SlideElement key={el.id} element={el} scaleX={canvasScaleX} scaleY={canvasScaleY} />)
                    ) : (
                      <View style={styles.emptySlide}>
                        <Feather name="file-text" size={32} color={darkTheme.mutedForeground} />
                        <Text style={styles.emptySlideText}>No content</Text>
                      </View>
                    )}

                    <View style={styles.reactionRail}>
                      <TouchableOpacity style={[styles.reactionFab, userReactions.has(index * 2) && styles.reactionFabLiked]} onPress={() => handleReaction(index, 'like')} activeOpacity={0.88}>
                        <Feather name="thumbs-up" size={20} color={userReactions.has(index * 2) ? darkTheme.primary : darkTheme.foreground} />
                      </TouchableOpacity>
                      <Text style={styles.reactionRailLabel}>Like</Text>

                      <TouchableOpacity style={[styles.reactionFab, userReactions.has(index * 2 + 1) && styles.reactionFabDisliked]} onPress={() => handleReaction(index, 'dislike')} activeOpacity={0.88}>
                        <Feather name="thumbs-down" size={20} color={userReactions.has(index * 2 + 1) ? darkTheme.destructive : darkTheme.foreground} />
                      </TouchableOpacity>
                      <Text style={styles.reactionRailLabel}>Dislike</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function SlideElement({ element, scaleX, scaleY }: { element: CanvasElement; scaleX: number; scaleY: number }) {
  const sizeScale = Math.min(scaleX, scaleY);
  const borderRadius = element.type === 'circle' ? (Math.min(element.width, element.height) / 2) * sizeScale : element.type === 'star' ? 4 : 8;
  const bgColor = element.type === 'text' ? undefined : (element.fill ?? '#E2E8F0');
  return (
    <View style={{ position: 'absolute', left: element.x * scaleX, top: element.y * scaleY, width: element.width * scaleX, height: element.height * scaleY, backgroundColor: bgColor, borderRadius, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
      {element.type === 'text' ? (
        <Text style={{ color: element.color ?? '#1a1a24', fontSize: (element.fontSize ?? 14) * sizeScale, textAlign: 'center', paddingHorizontal: 6 }}>{element.content ?? ''}</Text>
      ) : element.type === 'image' && element.src ? (
        <Image source={{ uri: resolveAssetUrl(element.src) ?? '' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.background },
  center: { flex: 1, backgroundColor: darkTheme.background, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 24 },
  topActions: { position: 'absolute', top: 6, left: 12, zIndex: 20 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  loadingText: { color: darkTheme.mutedForeground, fontSize: 14 },
  errorText: { color: darkTheme.destructive, fontSize: 15, textAlign: 'center' },
  emptyText: { color: darkTheme.mutedForeground, fontSize: 15 },
  flatListContainer: { flex: 1 },
  canvasWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  canvasContainer: { backgroundColor: '#ffffff', overflow: 'hidden', position: 'relative' },
  emptySlide: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  emptySlideText: { fontSize: 14, color: darkTheme.mutedForeground, fontStyle: 'italic' },
  reactionRail: { position: 'absolute', right: 14, bottom: 24, alignItems: 'center', gap: 8 },
  reactionFab: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', backgroundColor: 'rgba(0,0,0,0.45)' },
  reactionFabLiked: { borderColor: darkTheme.primary, backgroundColor: 'rgba(0, 166, 244, 0.22)' },
  reactionFabDisliked: { borderColor: darkTheme.destructive, backgroundColor: 'rgba(239, 68, 68, 0.22)' },
  reactionRailLabel: { fontSize: 12, fontWeight: '700', color: '#f8fafc', marginBottom: 2 },
});
