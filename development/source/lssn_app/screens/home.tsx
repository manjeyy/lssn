import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getCategories, getPublishedLssns, resolveAssetUrl } from '../lib/api';
import { darkTheme } from '../lib/theme';

type Category = {
  id: number;
  name: string;
  slug: string;
  thumbnailUrl?: string | null;
};

type Lssn = {
  id: number;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  slidesCount?: number;
  views?: number;
  createdAt?: string;
  categoryIds?: number[];
};

export default function Home() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [lssns, setLssns] = useState<Lssn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [categoryRows, lssnRows] = await Promise.all([
          getCategories(),
          getPublishedLssns(),
        ]);
        setCategories(categoryRows);
        setLssns(lssnRows);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load explore data';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const popularLssns = useMemo(() => {
    const sorted = [...lssns].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    const filtered = searchQuery.trim()
      ? sorted.filter((item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : sorted;
    return filtered.slice(0, 6);
  }, [lssns, searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Discover new learning slides.</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Feather name="user" size={18} color={darkTheme.foreground} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={darkTheme.mutedForeground} style={styles.searchIcon} />
          <TextInput
            placeholder="Search categories or lessons"
            placeholderTextColor={darkTheme.mutedForeground}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoryGrid}>
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={darkTheme.primary} />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : (
              categories.map((cat) => {
                const imageUrl = resolveAssetUrl(cat.thumbnailUrl ?? undefined);
                return (
                  <TouchableOpacity key={cat.id} style={styles.categoryCard}>
                    <View style={styles.categoryIcon}>
                      {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.categoryImage} />
                      ) : (
                        <Text style={styles.categoryFallback}>
                          {cat.name.slice(0, 1).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular LSSNs</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.lessonList}>
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={darkTheme.primary} />
                <Text style={styles.loadingText}>Loading lessons...</Text>
              </View>
            ) : (
              popularLssns.map((lesson) => {
                const thumbUrl = resolveAssetUrl(lesson.thumbnailUrl ?? undefined);
                return (
                  <TouchableOpacity
                    key={lesson.id}
                    style={styles.lessonCard}
                    onPress={() =>
                      navigation.navigate('Lesson' as never, { lssnId: lesson.id } as never)
                    }
                  >
                    <View style={styles.lessonMeta}>
                      <Text style={styles.lessonCategory}>Popular</Text>
                      <Text style={styles.lessonDuration}>{lesson.views ?? 0} views</Text>
                    </View>
                    <View style={styles.lessonBody}>
                      <View style={styles.lessonTextBlock}>
                        <Text style={styles.lessonTitle}>{lesson.title}</Text>
                        <Text style={styles.lessonSlides}>
                          {lesson.slidesCount ?? 0} slides
                        </Text>
                      </View>
                      {thumbUrl ? (
                        <Image source={{ uri: thumbUrl }} style={styles.lessonThumb} />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.background,
  },
  scrollView: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: darkTheme.foreground,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: darkTheme.mutedForeground,
  },
  profileButton: {
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 12,
    padding: 10,
    backgroundColor: darkTheme.card,
  },
  section: {
    marginBottom: 24,
  },
  errorText: {
    marginBottom: 16,
    color: darkTheme.destructive,
    fontSize: 13,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: darkTheme.card,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: darkTheme.foreground,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: darkTheme.foreground,
  },
  sectionAction: {
    fontSize: 13,
    color: darkTheme.primary,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 16,
    padding: 14,
    backgroundColor: darkTheme.card,
    marginBottom: 12,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: darkTheme.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  categoryImage: {
    width: 36,
    height: 36,
    borderRadius: 12,
  },
  categoryFallback: {
    fontSize: 16,
    fontWeight: '600',
    color: darkTheme.foreground,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: darkTheme.foreground,
  },
  lessonList: {
    marginTop: 2,
  },
  lessonCard: {
    borderWidth: 1,
    borderColor: darkTheme.border,
    borderRadius: 16,
    padding: 16,
    backgroundColor: darkTheme.card,
    marginBottom: 14,
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lessonCategory: {
    fontSize: 12,
    color: darkTheme.primary,
    fontWeight: '600',
  },
  lessonDuration: {
    fontSize: 12,
    color: darkTheme.mutedForeground,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: darkTheme.foreground,
    marginBottom: 6,
  },
  lessonBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  lessonTextBlock: {
    flex: 1,
  },
  lessonThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: darkTheme.secondary,
  },
  lessonSlides: {
    fontSize: 12,
    color: darkTheme.mutedForeground,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: darkTheme.mutedForeground,
  },
});
