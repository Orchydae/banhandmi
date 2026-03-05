import './SocialLinks.css'

export default function SocialLinks() {
    return (
        <nav className="social-links" id="social-links" aria-label="Social media links">
            {/* TikTok */}
            <a className="social-links__item" href="#" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.28 0 .56.04.82.12V9.01a6.34 6.34 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.64a6.34 6.34 0 0 0 6.34-6.34V8.73a8.27 8.27 0 0 0 3.76.92V6.69z" />
                </svg>
            </a>

            {/* Instagram */}
            <a className="social-links__item" href="#" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
            </a>

            {/* YouTube */}
            <a className="social-links__item" href="#" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                </svg>
            </a>

            {/* Threads */}
            <a className="social-links__item" href="#" aria-label="Threads" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.47l-2.066.56c-1.082-3.869-3.658-5.833-7.66-5.838h-.01c-2.862.02-5.037.96-6.461 2.794-1.347 1.735-2.04 4.204-2.06 7.34v.015c.02 3.14.713 5.608 2.06 7.34 1.424 1.834 3.6 2.774 6.463 2.794h.01c2.38-.02 4.234-.637 5.51-1.835 1.426-1.34 2.148-3.262 2.148-5.716 0-.093-.002-.186-.005-.28a6.513 6.513 0 0 1-3.794 1.143c-3.7 0-6.316-2.676-6.316-6.456 0-3.67 2.508-6.388 5.958-6.553l.085-.002c2.382 0 4.258 1.072 5.286 3.02.487.924.75 2.003.782 3.21.694-.36 1.2-.88 1.472-1.535l1.916.805c-.51 1.212-1.455 2.142-2.756 2.725.004.172.006.344.006.517 0 3.14-.99 5.72-2.862 7.48-1.707 1.604-4.072 2.42-7.027 2.44z" />
                </svg>
            </a>
        </nav>
    )
}
