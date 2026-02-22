import type { StaticScreenProps } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getLssn, reactToSlide } from '../lib/api';
import { darkTheme } from '../lib/theme';

type CanvasElement = {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'star' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  src?: string;
  fill?: string;
  color?: string;
  fontSize?: number;
};

type Props = StaticScreenProps<{
  lssnId: number;
}>;


export default function Details({ route }: Props) {
  const { height } = Dimensions.get('window');
  const [lssn, setLssn] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userReactions, setUserReactions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getLssn(route.params?.lssnId ?? 0);
        setLssn(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load lesson';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [route.params?.lssnId]);

  const slides = useMemo(() => {
    if (!lssn?.content?.cardsData) return [];
    const items = lssn.content.items ?? [];
    return items.map((itemId: number) => ({
      itemId,
      elements: lssn.content.cardsData[itemId] ?? [],
    }));
  }, [lssn]);

  const handleReaction = async (slideIndex: number, reaction: 'like' | 'dislike') => {
    try {
      await reactToSlide(route.params?.lssnId ?? 0, slideIndex, reaction);
      // Toggle reaction state (toggle on/off)
      const key = slideIndex * 2 + (reaction === 'like' ? 0 : 1);
      setUserReactions((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={darkTheme.primary} />
        <Text style={styles.loadingText}>Loading lesson...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={slides}
        keyExtractor={(item) => item.itemId.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={height}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({ length: height, offset: height * index, index })}
        renderItem={({ item, index }) => (
          <View style={[styles.slide, { height }]}>
            <View style={styles.slideHeader}>
              <Text style={styles.slideMeta}>{lssn?.title}</Text>
              <Text style={styles.slideIndex}>Slide {index + 1}</Text>
            </View>

            <View style={styles.slideContent}>
              <Text style={styles.slideTitle}>{lssn?.title}</Text>
              {item.elements.length > 0 ? (
                <View style={styles.elementsContainer}>
                  {item.elements.map((el) => (
                    <SlideElement key={el.id} element={el} />
                  ))}
                </View>
              ) : (
                <Text style={styles.emptySlide}>No content on this slide</Text>
              )}
            </View>

            <View style={styles.slideFooter}>
              <TouchableOpacity
                style={styles.reactionButton}
                onPress={() => handleReaction(index, 'like')}
              >
                <Feather
                  name="thumbs-up"
                  size={18}
                  color={userReactions.has(index * 2) ? darkTheme.primary : darkTheme.mutedForeground}
                />
                <Text style={[styles.reactionText, userReactions.has(index * 2) && { color: darkTheme.primary }]}>
                  Like
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.reactionButton}
                onPress={() => handleReaction(index, 'dislike')}
              >
                <Feather
                  name="thumbs-down"
                  size={18}
                  color={userReactions.has(index * 2 + 1) ? darkTheme.destructive : darkTheme.mutedForeground}
                />
                <Text style={[styles.reactionText, userReactions.has(index * 2 + 1) && { color: darkTheme.destructive }]}>
                  Dislike
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function SlideElement({ element }: { element: CanvasElement }) {
  const bgColor =
    element.type === 'text'
      ? undefined
      : element.fill
        ? element.fill
        : '#E2E8F0';

  const borderRadius =
    element.type === 'circle'
      ? (Math.min(element.width, element.height) / 2) as any
      : element.type === 'star'
        ? 4
        : 8;

  return (
    <View
      style={[
        {
          position: 'absolute',
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          backgroundColor: bgColor,
          borderRadius,
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        },
      ]}
    >
      {element.type === 'text' ? (
        <Text
          style={{
            color: element.color ?? darkTheme.foreground,
            fontSize: element.fontSize ?? 14,
            textAlign: 'center',
            paddingHorizontal: 8,
          }}
        >
          {element.content || ''}
        </Text>
      ) : element.type === 'image' && element.src ? (
        <Image source={{ uri: 'http://192.168.100.28:5000' + element.src.slice(21) }} style={{ width: '100%', height: '100%' }} />
      ) : null}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: darkTheme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: darkTheme.mutedForeground,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: darkTheme.background,
    padding: 24,
    justifyContent: 'center',
  },
  errorText: {
    color: darkTheme.destructive,
    fontSize: 15,
    textAlign: 'center',
  },
  slide: {
    padding: 24,
    justifyContent: 'space-between',
  },
  slideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  slideMeta: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.primary,
  },
  slideIndex: {
    fontSize: 12,
    color: darkTheme.mutedForeground,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
  },
  slideTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: darkTheme.foreground,
    marginBottom: 12,
  },
  elementsContainer: {
    flex: 1,
    minHeight: 200,
    position: 'relative',
  },
  emptySlide: {
    fontSize: 14,
    color: darkTheme.mutedForeground,
    fontStyle: 'italic',
  },
  slideFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: darkTheme.border,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: darkTheme.border,
    backgroundColor: darkTheme.card,
  },
  reactionText: {
    fontSize: 12,
    fontWeight: '600',
    color: darkTheme.mutedForeground,
  },
});
