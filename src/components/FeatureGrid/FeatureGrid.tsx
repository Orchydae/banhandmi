import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Heart, ThumbsDown, Clock, HeartHandshake, Crown } from 'lucide-react'
import DonationModal from '../DonationModal/DonationModal'
import DonorWallModal from '../DonorWallModal/DonorWallModal'
import { useLanguage } from '../../i18n/LanguageContext'
import './FeatureGrid.css'

interface FeatureGridProps {
    onFeatureClick: (featureName: string) => void;
}

export default function FeatureGrid({ onFeatureClick }: FeatureGridProps) {
    const { t } = useLanguage()
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
                <span className="feature-card__title">{t('feature.donate.title')}</span>
                <span className="feature-card__subtitle">{t('feature.donate.subtitle')}</span>
            </button>

            {/* Dream Artifacts */}
            <Link
                to="/dream-artifacts"
                className="feature-card glass"
                id="card-dream-artifacts"
                onClick={() => onFeatureClick(t('feature.dreamArtifacts.title'))}
            >
                <div className="feature-card__icon">
                    <Sparkles size={22} />
                </div>
                <span className="feature-card__title">{t('feature.dreamArtifacts.title')}</span>
                <span className="feature-card__subtitle">{t('feature.dreamArtifacts.subtitle')}</span>
            </Link>

            {/* Favorite Treats */}
            <Link
                to="/favorite-treats"
                className="feature-card glass"
                id="card-favorite-treats"
                onClick={() => onFeatureClick(t('feature.favoriteTreats.title'))}
            >
                <div className="feature-card__icon">
                    <Heart size={22} />
                </div>
                <span className="feature-card__title">{t('feature.favoriteTreats.title')}</span>
            </Link>

            {/* Disapproved Items */}
            <Link
                to="/disapproved-items"
                className="feature-card glass"
                id="card-disapproved-items"
                onClick={() => onFeatureClick(t('feature.disapprovedItems.title'))}
            >
                <div className="feature-card__icon">
                    <ThumbsDown size={22} />
                </div>
                <span className="feature-card__title">{t('feature.disapprovedItems.title')}</span>
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
                <span className="feature-card__title">{t('feature.donorWall.title')}</span>
            </button>

            {/* Upcoming soon */}
            <div className="feature-card feature-card--dark" id="card-upcoming">
                <div className="feature-card__icon">
                    <Clock size={22} />
                </div>
                <span className="feature-card__title">{t('feature.upcoming.title')}</span>
            </div>
        </section>

        {showDonation && <DonationModal onClose={() => setShowDonation(false)} />}
        {showDonorWall && <DonorWallModal onClose={() => setShowDonorWall(false)} />}
        </>
    )
}
