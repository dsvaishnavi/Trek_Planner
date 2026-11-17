import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer
      className="mt-auto pt-5 pb-4"
      style={{
        background: 'linear-gradient(180deg, transparent, color-mix(in srgb, var(--tv-ocean-900) 8%, var(--tv-bg)))',
        borderTop: '1px solid var(--tv-border)',
      }}
    >
      <div className="container">
        <div className="row g-4">
          <div className="col-md-5">
            <div className="brand-logo mb-2">🌍 TrekVerse AI</div>
            <p className="text-muted-tv mb-0" style={{ maxWidth: 320 }}>
              Intelligent travel planning — itineraries, budgets, weather, and maps in one calm place.
            </p>
          </div>
          <div className="col-6 col-md-2">
            <div className="fw-semibold mb-2" style={{ fontSize: '0.85rem' }}>Explore</div>
            <div className="d-flex flex-column gap-1">
              <Link to="/planner" className="text-muted-tv text-decoration-none small">AI Planner</Link>
              <Link to="/chat" className="text-muted-tv text-decoration-none small">Chat</Link>
              <Link to="/recommendations" className="text-muted-tv text-decoration-none small">Recommendations</Link>
              <Link to="/maps" className="text-muted-tv text-decoration-none small">Maps</Link>
            </div>
          </div>
          <div className="col-6 col-md-2">
            <div className="fw-semibold mb-2" style={{ fontSize: '0.85rem' }}>Tools</div>
            <div className="d-flex flex-column gap-1">
              <Link to="/budget" className="text-muted-tv text-decoration-none small">Budget</Link>
              <Link to="/weather" className="text-muted-tv text-decoration-none small">Weather</Link>
              <Link to="/hotels" className="text-muted-tv text-decoration-none small">Hotels</Link>
              <Link to="/leaderboard" className="text-muted-tv text-decoration-none small">Leaderboard</Link>
            </div>
          </div>
          <div className="col-md-3">
            <div className="fw-semibold mb-2" style={{ fontSize: '0.85rem' }}>Account</div>
            <div className="d-flex flex-column gap-1">
              <Link to="/journey" className="text-muted-tv text-decoration-none small">Journey</Link>
              <Link to="/profile" className="text-muted-tv text-decoration-none small">Profile</Link>
              <Link to="/login" className="text-muted-tv text-decoration-none small">Login</Link>
            </div>
          </div>
        </div>
        <div className="d-flex flex-wrap justify-content-between gap-2 mt-4 pt-3 border-top small text-muted-tv" style={{ borderColor: 'var(--tv-border)' }}>
          <span>© {new Date().getFullYear()} TrekVerse AI</span>
          <span>Plan boldly. Travel wisely.</span>
        </div>
      </div>
    </footer>
  )
}
