import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Badge, LeaderboardEntry } from '../types'
import gamificationService from '../services/gamificationService'
import { useAuth } from '../hooks/useAuth'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { getInitials } from '../utils'

export default function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [board, b] = await Promise.all([
          gamificationService.getLeaderboard(),
          gamificationService.getBadges(),
        ])
        if (!cancelled) {
          setEntries(board)
          setBadges(b)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <PageHero
        title="Leaderboard"
        subtitle="Climb the ranks by completing trips and unlocking badges."
      />
      <div className="container pb-5">
        {loading ? (
          <LoadingSkeleton height={400} />
        ) : (
          <div className="row g-4">
            <div className="col-lg-8">
              <GlassCard className="p-0 overflow-hidden">
                <div className="table-responsive">
                  <table className="table mb-0 align-middle" style={{ color: 'var(--tv-text)' }}>
                    <thead>
                      <tr style={{ borderColor: 'var(--tv-border)' }}>
                        <th className="ps-4">Rank</th>
                        <th>Explorer</th>
                        <th>Trips</th>
                        <th>Badges</th>
                        <th className="pe-4">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e, i) => {
                        const isYou = user && (String(e.user_id) === String(user.id) || e.username === user.username)
                        return (
                          <motion.tr
                            key={e.user_id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            style={{
                              background: isYou ? 'color-mix(in srgb, var(--tv-primary) 12%, transparent)' : undefined,
                              borderColor: 'var(--tv-border)',
                            }}
                          >
                            <td className="ps-4 fw-bold">
                              {e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : `#${e.rank}`}
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {e.avatar ? (
                                  <img src={e.avatar} alt="" width={36} height={36} className="rounded-circle object-fit-cover" />
                                ) : (
                                  <span
                                    className="rounded-circle d-inline-flex align-items-center justify-content-center text-white"
                                    style={{ width: 36, height: 36, background: 'var(--tv-gradient)', fontSize: '0.7rem' }}
                                  >
                                    {getInitials(e.username)}
                                  </span>
                                )}
                                <span className="fw-semibold">
                                  {e.username}
                                  {isYou && <span className="small text-primary-tv ms-1">(you)</span>}
                                </span>
                              </div>
                            </td>
                            <td>{e.trips_completed}</td>
                            <td>{e.badge_count}</td>
                            <td className="pe-4 fw-bold" style={{ color: 'var(--tv-primary)' }}>{e.points.toLocaleString()}</td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </div>
            <div className="col-lg-4">
              <GlassCard className="p-4">
                <h2 className="h5 mb-3">Available badges</h2>
                <div className="d-flex flex-column gap-2">
                  {badges.map((b) => (
                    <div key={b.id} className="d-flex gap-2 align-items-start">
                      <span style={{ fontSize: '1.5rem' }}>{b.icon}</span>
                      <div>
                        <div className="fw-semibold small">{b.name}</div>
                        <div className="text-muted-tv" style={{ fontSize: '0.78rem' }}>{b.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
