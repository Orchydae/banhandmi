import './StatsCounter.css'

export default function StatsCounter() {
    return (
        <section className="stats-counter" id="stats-counter">
            <div className="stats-counter__drag">
                <span className="stats-counter__drag-label">DRAG TO FEED!</span>
                <div className="stats-counter__drag-icon glass">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                </div>
            </div>
            <div className="stats-counter__panel">
                <span className="stats-counter__label">Number of treats given</span>
                <span className="stats-counter__value">000 234 231</span>
            </div>
        </section>
    )
}
