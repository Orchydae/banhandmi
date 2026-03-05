import './FeatureGrid.css'

export default function FeatureGrid() {
    return (
        <section className="feature-grid" id="feature-grid">
            {/* Dream Artifacts */}
            <div className="feature-card glass" id="card-dream-artifacts">
                <div className="feature-card__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                </div>
                <span className="feature-card__title">Dream Artifacts</span>
                <span className="feature-card__subtitle">Approved toys</span>
            </div>

            {/* Favorite Treats */}
            <div className="feature-card glass" id="card-favorite-treats">
                <div className="feature-card__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </div>
                <span className="feature-card__title">Favorite Treats</span>
            </div>

            {/* Disapproved Items */}
            <div className="feature-card glass" id="card-disapproved-items">
                <div className="feature-card__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
                    </svg>
                </div>
                <span className="feature-card__title">Disapproved Items</span>
            </div>

            {/* Upcoming soon */}
            <div className="feature-card feature-card--golden" id="card-upcoming">
                <div className="feature-card__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <span className="feature-card__title">Upcoming soon…</span>
            </div>
        </section>
    )
}
