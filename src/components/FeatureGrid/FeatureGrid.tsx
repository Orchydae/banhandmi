import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Heart, ThumbsDown, Clock, HeartHandshake, Crown } from 'lucide-react'
import DonationModal from '../DonationModal/DonationModal'
import DonorWallModal from '../DonorWallModal/DonorWallModal'
import './FeatureGrid.css'

interface FeatureGridProps {
    onFeatureClick: (featureName: string) => void;
}

export default function FeatureGrid({ onFeatureClick }: FeatureGridProps) {
    const [showDonation, setShowDonation] = useState(false)
    const [showDonorWall, setShowDonorWall] = useState(false)

    return (
        <>
        <section className="feature-grid" id="feature-grid">
            {/* Donate */}
            <button
                className="feature-card feature-card--donate glass"
                id="card-donate"
                onClick={() => setShowDonation(true)}
            >
                <div className="feature-card__icon">
                    <HeartHandshake size={22} />
                </div>
                <span className="feature-card__title">Buy Bánh a Treat</span>
                <span className="feature-card__subtitle">Support_the_pup</span>
            </button>

            {/* Dream Artifacts */}
            <Link
                to="/dream-artifacts"
                className="feature-card glass"
                id="card-dream-artifacts"
                onClick={() => onFeatureClick('Dream Artifacts')}
            >
                <div className="feature-card__icon">
                    <Sparkles size={22} />
                </div>
                <span className="feature-card__title">Dream Artifacts</span>
                <span className="feature-card__subtitle">Approved_toys</span>
            </Link>

            {/* Favorite Treats */}
            <Link
                to="/favorite-treats"
                className="feature-card glass"
                id="card-favorite-treats"
                onClick={() => onFeatureClick('Favorite Treats')}
            >
                <div className="feature-card__icon">
                    <Heart size={22} />
                </div>
                <span className="feature-card__title">Favorite Treats</span>
            </Link>

            {/* Disapproved Items */}
            <Link
                to="/disapproved-items"
                className="feature-card glass"
                id="card-disapproved-items"
                onClick={() => onFeatureClick('Disapproved Items')}
            >
                <div className="feature-card__icon">
                    <ThumbsDown size={22} />
                </div>
                <span className="feature-card__title">Disapproved Items</span>
            </Link>

            {/* Donor Wall */}
            <button
                className="feature-card glass"
                id="card-donor-wall"
                onClick={() => setShowDonorWall(true)}
            >
                <div className="feature-card__icon">
                    <Crown size={22} />
                </div>
                <span className="feature-card__title">Donor Wall</span>
            </button>

            {/* Upcoming soon */}
            <div className="feature-card feature-card--dark" id="card-upcoming">
                <div className="feature-card__icon">
                    <Clock size={22} />
                </div>
                <span className="feature-card__title">Upcoming soon…</span>
            </div>
        </section>

        {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
        {showDonorWall && <DonorWallModal onClose={() => setShowDonorWall(false)} />}
        </>
    )
}
