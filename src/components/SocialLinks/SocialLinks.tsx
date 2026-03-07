import { Instagram, Youtube, Mail } from 'lucide-react'
import './SocialLinks.css'

export default function SocialLinks() {
    return (
        <nav className="social-links glass" id="social-links" aria-label="Social media links">
            {/* TikTok — no lucide icon available, using inline SVG */}
            <a className="social-links__item" href="https://www.tiktok.com/@banh.and.mi" aria-label="TikTok" target="_blank" rel="noopener noreferrer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.28 0 .56.04.82.12V9.01a6.34 6.34 0 0 0-.82-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.64a6.34 6.34 0 0 0 6.34-6.34V8.73a8.27 8.27 0 0 0 3.76.92V6.69z" />
                </svg>
            </a>

            {/* Instagram */}
            <a className="social-links__item" href="https://www.instagram.com/banh.and.mi" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <Instagram size={24} />
            </a>

            {/* YouTube */}
            <a className="social-links__item" href="https://www.youtube.com/@banhandmi" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
                <Youtube size={24} />
            </a>

            {/* Email */}
            <a className="social-links__item" href="mailto:banhandmi@outlook.com" aria-label="Email" target="_blank" rel="noopener noreferrer">
                <Mail size={24} />
            </a>
        </nav>
    )
}
