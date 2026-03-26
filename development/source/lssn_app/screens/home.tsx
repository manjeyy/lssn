import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl, Dimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getCategories, getPublishedLssns, getTopics, resolveAssetUrl } from '../lib/api';
import { useAuthStore } from '../store/store';
import { darkTheme } from '../lib/theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.72;

type Category = { id: number; name: string; slug: string; thumbnailUrl?: string | null };
type Topic = { id: number; name: string; slug: string };
type Lssn = {
  id: number; title: string; description?: string | null; thumbnailUrl?: string | null;
  slidesCount?: number; views?: number; topicIds?: number[];
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const [categories, setCategories] = useState<Category[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [lssns, setLssns] = useState<Lssn[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true); else setIsLoading(true);
    setError(null);
    try {
      const [categoryRows, lssnRows, topicRows] = await Promise.all([
        getCategories(), getPublishedLssns(), getTopics(),
      ]);
      setCategories(categoryRows);
      setLssns(lssnRows);
      setTopics(topicRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredLssns = useMemo(() => {
    let list = [...lssns];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) => l.title.toLowerCase().includes(q) || (l.description ?? '').toLowerCase().includes(q));
    }
    if (selectedTopicId !== null) {
      list = list.filter((l) => l.topicIds?.includes(selectedTopicId));
    }
    return list;
  }, [lssns, searchQuery, selectedTopicId]);

  const featuredLssns = useMemo(() => filteredLssns.slice(0, 5), [filteredLssns]);
  const moreLssns = useMemo(() => filteredLssns.slice(5), [filteredLssns]);
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => load(true)} tintColor={darkTheme.primary} colors={[darkTheme.primary]} />
        }
      >
        <View style={styles.topBlock}>
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <TouchableOpacity style={styles.profileBtn} onPress={() => navigation.navigate('Profile' as never)} activeOpacity={0.8}>
              <Text style={styles.profileInitial}>{(user?.name?.[0] ?? '?').toUpperCase()}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <View style={styles.searchIconBubble}>
              <Feather name="search" size={16} color={darkTheme.primary} />
            </View>
            <TextInput
              placeholder="Search lessons, topics, creators"
              placeholderTextColor={darkTheme.mutedForeground}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <Feather name="x" size={14} color={darkTheme.mutedForeground} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-circle" size={14} color={darkTheme.destructive} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => load()}><Text style={styles.retryText}>Retry</Text></TouchableOpacity>
          </View>
        ) : null}

        {topics.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.topicsScroll} style={styles.topicsRow}>
            <TouchableOpacity style={[styles.topicPill, selectedTopicId === null && styles.topicPillActive]} onPress={() => setSelectedTopicId(null)}>
              <Text style={[styles.topicPillText, selectedTopicId === null && styles.topicPillTextActive]}>All</Text>
            </TouchableOpacity>
            {topics.map((topic) => (
              <TouchableOpacity key={topic.id} style={[styles.topicPill, selectedTopicId === topic.id && styles.topicPillActive]} onPress={() => setSelectedTopicId(selectedTopicId === topic.id ? null : topic.id)}>
                <Text style={[styles.topicPillText, selectedTopicId === topic.id && styles.topicPillTextActive]}>{topic.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
          </View>
          {isLoading ? (
            <View style={styles.loadingPlaceholder}>
              <ActivityIndicator color={darkTheme.primary} />
              <Text style={styles.loadingText}>Loading lessons...</Text>
            </View>
          ) : featuredLssns.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="book-open" size={36} color={darkTheme.mutedForeground} />
              <Text style={styles.emptyText}>No lessons found</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
              {featuredLssns.map((item) => (
                <FeaturedCard key={item.id} lssn={item} onPress={() => navigation.navigate('Lesson' as any, { lssnId: item.id } as any)} />
              ))}
            </ScrollView>
          )}
        </View>

        {!isLoading && categories.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
              {categories.map((cat) => {
                const img = resolveAssetUrl(cat.thumbnailUrl);
                return (
                  <TouchableOpacity key={cat.id} style={styles.categoryChip} activeOpacity={0.8}>
                    {img ? (
                      <Image source={{ uri: img }} style={styles.categoryChipImg} />
                    ) : (
                      <View style={styles.categoryChipFallback}>
                        <Text style={styles.categoryChipLetter}>{cat.name[0].toUpperCase()}</Text>
                      </View>
                    )}
                    <Text style={styles.categoryChipName} numberOfLines={2}>{cat.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!isLoading && moreLssns.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>More Lessons</Text>
            </View>
            {moreLssns.map((lssn) => (
              <LssnListCard key={lssn.id} lssn={lssn} onPress={() => navigation.navigate('Lesson' as any, { lssnId: lssn.id } as any)} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FeaturedCard({ lssn, onPress }: { lssn: Lssn; onPress: () => void }) {
  const thumb = resolveAssetUrl(lssn.thumbnailUrl);
  return (
    <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.88}>
      <View style={styles.featuredThumbContainer}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.featuredThumb} resizeMode="cover" />
        ) : (
          <View style={[styles.featuredThumb, styles.featuredThumbFallback]}>
            <Feather name="book-open" size={36} color={darkTheme.primary} />
          </View>
        )}
        <View style={styles.featuredBadge}>
          <Feather name="star" size={10} color="#fbbf24" />
          <Text style={styles.featuredBadgeText}>Featured</Text>
        </View>
      </View>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle} numberOfLines={2}>{lssn.title}</Text>
        {lssn.description ? <Text style={styles.featuredDesc} numberOfLines={2}>{lssn.description}</Text> : null}
        <View style={styles.featuredMeta}>
          <View style={styles.metaItem}><Feather name="layers" size={12} color={darkTheme.mutedForeground} /><Text style={styles.metaText}>{lssn.slidesCount ?? 0} slides</Text></View>
          <View style={styles.metaItem}><Feather name="eye" size={12} color={darkTheme.mutedForeground} /><Text style={styles.metaText}>{lssn.views ?? 0} views</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function LssnListCard({ lssn, onPress }: { lssn: Lssn; onPress: () => void }) {
  const thumb = resolveAssetUrl(lssn.thumbnailUrl);
  return (
    <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.88}>
      {thumb ? (
        <Image source={{ uri: thumb }} style={styles.listThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.listThumb, styles.listThumbFallback]}>
          <Feather name="book-open" size={22} color={darkTheme.primary} />
        </View>
      )}
      <View style={styles.listInfo}>
        <Text style={styles.listTitle} numberOfLines={2}>{lssn.title}</Text>
        {lssn.description ? <Text style={styles.listDesc} numberOfLines={1}>{lssn.description}</Text> : null}
        <View style={styles.listMeta}>
          <View style={styles.metaItem}><Feather name="layers" size={11} color={darkTheme.mutedForeground} /><Text style={styles.metaText}>{lssn.slidesCount ?? 0} slides</Text></View>
          <View style={styles.metaItem}><Feather name="eye" size={11} color={darkTheme.mutedForeground} /><Text style={styles.metaText}>{lssn.views ?? 0}</Text></View>
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={darkTheme.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: darkTheme.background },
  scrollContent: { paddingBottom: 36 },
  topBlock: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 14, gap: 14 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 13, color: darkTheme.mutedForeground, fontWeight: '500' },
  userName: { fontSize: 26, fontWeight: '800', color: darkTheme.foreground, marginTop: 2 },
  profileBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: darkTheme.primary + '20', borderWidth: 2, borderColor: darkTheme.primary, alignItems: 'center', justifyContent: 'center' },
  profileInitial: { fontSize: 17, fontWeight: '800', color: darkTheme.primary },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#222236', borderWidth: 1, borderColor: '#34344a', borderRadius: 18, paddingHorizontal: 12, paddingVertical: 12 },
  searchIconBubble: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: darkTheme.primary + '20' },
  searchInput: { flex: 1, fontSize: 15, color: darkTheme.foreground, fontWeight: '500' },
  clearSearchBtn: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: darkTheme.secondary },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 12, backgroundColor: darkTheme.destructive + '15', borderWidth: 1, borderColor: darkTheme.destructive + '40', borderRadius: 10, padding: 12 },
  errorText: { color: darkTheme.destructive, fontSize: 13, flex: 1 },
  retryText: { color: darkTheme.primary, fontWeight: '700', fontSize: 13 },
  topicsRow: { marginBottom: 16 },
  topicsScroll: { paddingHorizontal: 20, gap: 8 },
  topicPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, backgroundColor: darkTheme.card, borderWidth: 1, borderColor: darkTheme.border },
  topicPillActive: { backgroundColor: darkTheme.primary, borderColor: darkTheme.primary },
  topicPillText: { fontSize: 13, color: darkTheme.mutedForeground, fontWeight: '600' },
  topicPillTextActive: { color: '#fff' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: darkTheme.foreground },
  loadingPlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: darkTheme.mutedForeground },
  emptyContainer: { alignItems: 'center', gap: 10, paddingVertical: 36 },
  emptyText: { textAlign: 'center', color: darkTheme.mutedForeground, fontSize: 14 },
  featuredScroll: { paddingLeft: 20, paddingRight: 6, gap: 14 },
  featuredCard: { width: FEATURED_CARD_WIDTH, backgroundColor: darkTheme.card, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: darkTheme.border },
  featuredThumbContainer: { position: 'relative' },
  featuredThumb: { width: '100%', height: 160, backgroundColor: darkTheme.secondary },
  featuredThumbFallback: { alignItems: 'center', justifyContent: 'center' },
  featuredBadge: { position: 'absolute', top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 },
  featuredBadgeText: { fontSize: 11, color: '#fbbf24', fontWeight: '700' },
  featuredInfo: { padding: 14 },
  featuredTitle: { fontSize: 15, fontWeight: '700', color: darkTheme.foreground, marginBottom: 4 },
  featuredDesc: { fontSize: 13, color: darkTheme.mutedForeground, marginBottom: 8, lineHeight: 18 },
  featuredMeta: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: darkTheme.mutedForeground },
  categoriesScroll: { paddingLeft: 20, paddingRight: 6, gap: 10 },
  categoryChip: { width: 88, alignItems: 'center', gap: 8, backgroundColor: darkTheme.card, borderWidth: 1, borderColor: darkTheme.border, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 14 },
  categoryChipImg: { width: 44, height: 44, borderRadius: 12, backgroundColor: darkTheme.secondary },
  categoryChipFallback: { width: 44, height: 44, borderRadius: 12, backgroundColor: darkTheme.primary + '20', alignItems: 'center', justifyContent: 'center' },
  categoryChipLetter: { fontSize: 20, fontWeight: '700', color: darkTheme.primary },
  categoryChipName: { fontSize: 11, fontWeight: '600', color: darkTheme.foreground, textAlign: 'center' },
  listCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: darkTheme.card, borderWidth: 1, borderColor: darkTheme.border, borderRadius: 16, padding: 14, marginHorizontal: 20, marginBottom: 10 },
  listThumb: { width: 72, height: 72, borderRadius: 12, backgroundColor: darkTheme.secondary },
  listThumbFallback: { alignItems: 'center', justifyContent: 'center' },
  listInfo: { flex: 1 },
  listTitle: { fontSize: 15, fontWeight: '700', color: darkTheme.foreground, marginBottom: 4 },
  listDesc: { fontSize: 13, color: darkTheme.mutedForeground, marginBottom: 6, lineHeight: 18 },
  listMeta: { flexDirection: 'row', gap: 12 },
});
