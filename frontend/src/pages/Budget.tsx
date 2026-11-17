import { useState, type FormEvent } from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import type { BudgetBreakdown } from '../types'
import budgetService from '../services/budgetService'
import PageHero from '../components/common/PageHero'
import GlassCard from '../components/common/GlassCard'
import GradientButton from '../components/common/GradientButton'
import LoadingSkeleton from '../components/common/LoadingSkeleton'
import { formatCurrency } from '../utils'
import { useTheme } from '../hooks/useTheme'

const COLORS = ['#0f766e', '#14b8a6', '#c4a574', '#5eead4', '#a8844f']

export default function Budget() {
  const { theme } = useTheme()
  const [form, setForm] = useState({
    destination: 'Bali',
    days: 7,
    travelers: 2,
    travel_style: 'balanced',
    hotel_category: 'Boutique',
  })
  const [data, setData] = useState<BudgetBreakdown | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await budgetService.predict(form)
      setData(res)
    } finally {
      setLoading(false)
    }
  }

  const chartData = data
    ? [
        { name: 'Stay', value: data.accommodation },
        { name: 'Food', value: data.food },
        { name: 'Transport', value: data.transport },
        { name: 'Activities', value: data.activities },
        { name: 'Other', value: data.miscellaneous },
      ]
    : []

  const tooltipStyle = {
    background: theme === 'dark' ? '#0c2a28' : '#fff',
    border: '1px solid var(--tv-border)',
    borderRadius: 8,
    color: theme === 'dark' ? '#e8f5f3' : '#0c2a28',
  }

  return (
    <>
      <PageHero
        title="Budget Predictor"
        subtitle="Estimate trip costs with AI-informed category breakdowns."
      />
      <div className="container pb-5">
        <div className="row g-4">
          <div className="col-lg-4">
            <GlassCard className="p-4">
              <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
                <div>
                  <label className="tv-label">Destination</label>
                  <input className="tv-input" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
                </div>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="tv-label">Days</label>
                    <input className="tv-input" type="number" min={1} value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })} />
                  </div>
                  <div className="col-6">
                    <label className="tv-label">Travelers</label>
                    <input className="tv-input" type="number" min={1} value={form.travelers} onChange={(e) => setForm({ ...form, travelers: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label className="tv-label">Travel style</label>
                  <select className="tv-select" value={form.travel_style} onChange={(e) => setForm({ ...form, travel_style: e.target.value })}>
                    <option value="budget">Budget</option>
                    <option value="balanced">Balanced</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="tv-label">Hotel category</label>
                  <select className="tv-select" value={form.hotel_category} onChange={(e) => setForm({ ...form, hotel_category: e.target.value })}>
                    <option value="hostel">Hostel</option>
                    <option value="Boutique">Boutique</option>
                    <option value="5-star">5-star</option>
                  </select>
                </div>
                <GradientButton type="submit" loading={loading}>Predict budget</GradientButton>
              </form>
            </GlassCard>
          </div>
          <div className="col-lg-8">
            {loading && <LoadingSkeleton height={360} />}
            {!loading && !data && (
              <GlassCard className="p-5 text-center text-muted-tv">
                Run a prediction to see pie and bar breakdowns.
              </GlassCard>
            )}
            {data && !loading && (
              <div className="d-flex flex-column gap-4">
                <GlassCard className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <h2 className="h4 mb-0">Estimated total</h2>
                    <span className="fs-3 fw-bold" style={{ color: 'var(--tv-primary)' }}>
                      {formatCurrency(data.total, data.currency || 'USD')}
                    </span>
                  </div>
                  <div className="row g-4">
                    <div className="col-md-5" style={{ minHeight: 240 }}>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="col-md-7" style={{ minHeight: 240 }}>
                      <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={chartData}>
                          <XAxis dataKey="name" stroke="var(--tv-text-muted)" fontSize={12} />
                          <YAxis stroke="var(--tv-text-muted)" fontSize={12} />
                          <Tooltip contentStyle={tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
                          <Bar dataKey="value" fill="#0f766e" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </GlassCard>
                {data.tips && (
                  <GlassCard className="p-4">
                    <h3 className="h5 mb-2">AI tips</h3>
                    <ul className="mb-0">
                      {data.tips.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </GlassCard>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
