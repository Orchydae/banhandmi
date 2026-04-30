import { Link } from 'react-router-dom'
import { useLanguage } from '../../i18n/LanguageContext'
import './DonationSuccess.css'

export default function DonationSuccess() {
    const { t } = useLanguage()

    return (
        <div className="donation-success">
            <div className="donation-success__card glass">
                <span className="donation-success__paw">🐾</span>
                <h1 className="donation-success__title">{t('success.title')}</h1>
                <p className="donation-success__text">
                    {t('success.text')}
                </p>
                <Link to="/" className="donation-success__back">
                    {t('success.back')}
                </Link>
            </div>
        </div>
    )
}
