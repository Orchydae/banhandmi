import { Link } from 'react-router-dom'
import './DonationSuccess.css'

export default function DonationSuccess() {
    return (
        <div className="donation-success">
            <div className="donation-success__card glass">
                <span className="donation-success__paw">🐾</span>
                <h1 className="donation-success__title">Thank you!</h1>
                <p className="donation-success__text">
                    Bánh is wagging his tail just for you. Your treat is on his way!
                </p>
                <Link to="/" className="donation-success__back">
                    ← Back to Bánh
                </Link>
            </div>
        </div>
    )
}
