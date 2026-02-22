'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { deleteLssn, getMyLssns, getMyStats } from '@/lib/api'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { LssnGrid } from '@/components/dashboard/LssnGrid'

interface LSSN {
  id: number
  title: string
  description: string
  slides: number
  createdAt: string
  thumbnail?: string
  status: 'draft' | 'published'
  views: number
  likes: number
  rating: number
}

export default function DashboardPage() {
  const [lssns, setLssns] = useState<LSSN[]>([])
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalLssns: 0,
    avgRating: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  type SectionKey = 'home' | 'stats' | 'lssns' | 'drafts' | 'settings'
  const [activeSection, setActiveSection] = useState<SectionKey>('home')

  const [searchQuery, setSearchQuery] = useState('')

  const draftLssns = useMemo(() => lssns.filter((lssn) => lssn.status === 'draft'), [lssns])

  const filteredLssns = useMemo(() => {
    const base = activeSection === 'drafts' ? draftLssns : lssns
    if (!searchQuery.trim()) return base
    return base.filter((lssn) =>
      lssn.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lssn.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [activeSection, draftLssns, lssns, searchQuery])

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null)
        const [statsResponse, lssnsResponse] = await Promise.all([
          getMyStats(),
          getMyLssns(),
        ])

        const normalized = lssnsResponse.map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description ?? '',
          slides: item.slidesCount ?? 0,
          createdAt: item.createdAt,
          thumbnail: item.thumbnailUrl ?? undefined,
          status: item.status,
          views: item.views ?? 0,
          likes: item.likesCount ?? 0,
          rating: Number(item.rating ?? 0),
        }))

        setStats({
          totalViews: statsResponse.totalViews,
          totalLikes: statsResponse.totalLikes,
          totalLssns: statsResponse.totalLssns,
          avgRating: statsResponse.avgRating,
        })
        setLssns(normalized)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleDelete = async (id: number) => {
    await deleteLssn(id)
    setLssns((prev) => prev.filter((item) => item.id !== id))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen app-bg">
      <div className="flex min-h-screen">
        <DashboardSidebar
          activeSection={activeSection}
          lssnsCount={lssns.length}
          draftsCount={draftLssns.length}
          onSectionChange={setActiveSection}
        />

        <main className="flex-1">
          <DashboardHeader activeSection={activeSection} />

          <div className="px-8 py-8">
            {error ? (
              <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            {activeSection !== 'settings' && activeSection !== 'stats' ? (
              <div className="mb-6">
                <Input
                  placeholder="Search LSSNs by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md app-input focus-visible:ring-0 focus-visible:border-cyan-400"
                />
              </div>
            ) : null}

            {(activeSection === 'home' || activeSection === 'stats') && (
              <StatsGrid
                totalViews={stats.totalViews}
                totalLikes={stats.totalLikes}
                totalLssns={stats.totalLssns}
                avgRating={stats.avgRating}
              />
            )}

            {activeSection === 'settings' && (
              <Card className="app-surface border app-border shadow-none">
                <CardHeader>
                  <CardTitle className="text-strong">Workspace Settings</CardTitle>
                  <CardDescription className="text-muted">
                    Manage your creator profile and notification preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted">
                  Settings controls will appear here. Let me know what preferences you want to add.
                </CardContent>
              </Card>
            )}

            {activeSection !== 'settings' && activeSection !== 'stats' && (
              <LssnGrid
                isLoading={isLoading}
                lssns={filteredLssns}
                searchQuery={searchQuery}
                formatDate={formatDate}
                onDelete={handleDelete}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
