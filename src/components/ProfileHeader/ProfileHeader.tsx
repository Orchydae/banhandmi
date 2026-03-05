import './ProfileHeader.css'

export default function ProfileHeader() {
    return (
        <header className="profile-header" id="profile-header">
            <div className="profile-header__top-bar">
                <span className="profile-header__handle">@banhandmi</span>
                <button className="profile-header__share-btn" aria-label="Share profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                </button>
            </div>
            <div className="profile-header__avatar-ring">
                <img
                    className="profile-header__avatar"
                    src="/avatar.png"
                    alt="Bánh the Shiba Inu"
                />
            </div>
            <h1 className="profile-header__name">Bánh</h1>
            <p className="profile-header__bio">Professional dreamer.</p>
        </header>
    )
}
