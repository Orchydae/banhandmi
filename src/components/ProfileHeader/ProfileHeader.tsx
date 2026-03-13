import { useRef, useEffect, useCallback, useState } from 'react'
import { Share2, Cookie, Facebook, Copy, Check, X as XIcon, MessageCircle, Send } from 'lucide-react'
import { useTreatsCounter } from '../../hooks/useTreatsCounter'
import OgotchiPrototype, { OgotchiPrototypeRef } from '../OgotchiPrototype/OgotchiPrototype'
import './ProfileHeader.css'

interface ProfileHeaderProps {
    onFeed?: () => void;
}

export default function ProfileHeader({ onFeed }: ProfileHeaderProps) {
    const { treats, increment } = useTreatsCounter()
    const [isDragging, setIsDragging] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)
    const shareMenuRef = useRef<HTMLDivElement>(null)
    const dragIconRef = useRef<HTMLDivElement>(null)
    const ogotchiRef = useRef<OgotchiPrototypeRef>(null)
    const floatingCloneRef = useRef<HTMLElement | null>(null)

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (!dragIconRef.current) return

        const el = dragIconRef.current
        el.setPointerCapture(e.pointerId)

        const rect = el.getBoundingClientRect()
        const clone = el.cloneNode(true) as HTMLElement
        const cloneW = rect.width * 2
        const cloneH = rect.height * 2
        clone.style.cssText = `
            position: fixed;
            width: ${cloneW}px;
            height: ${cloneH}px;
            top: ${e.clientY - cloneH / 2}px;
            left: ${e.clientX - cloneW / 2}px;
            opacity: 1;
            pointer-events: none;
            z-index: 9999;
            transition: none;
            animation: none;
        `
        document.body.appendChild(clone)
        floatingCloneRef.current = clone
        document.body.style.cursor = 'none'
        setIsDragging(true)
    }, [])

    const handlePointerMove = useCallback((e: PointerEvent) => {
        e.preventDefault()
        if (!floatingCloneRef.current) return
        const clone = floatingCloneRef.current
        const w = parseFloat(clone.style.width)
        const h = parseFloat(clone.style.height)
        clone.style.left = `${e.clientX - w / 2}px`
        clone.style.top = `${e.clientY - h / 2}px`
    }, [])

    const handlePointerUp = useCallback((e: PointerEvent) => {
        // Check if released over the avatar ring
        if (ogotchiRef.current) {
            const rect = ogotchiRef.current.getBoundingClientRect()
            const over =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            if (over) {
                increment()
                ogotchiRef.current.triggerFeed(e.clientX, e.clientY)
                onFeed?.()
            }
        }
        // Clean up
        if (floatingCloneRef.current) {
            document.body.removeChild(floatingCloneRef.current)
            floatingCloneRef.current = null
        }
        document.body.style.cursor = ''
        setIsDragging(false)
    }, [increment, onFeed])

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('pointermove', handlePointerMove, { passive: false })
            document.addEventListener('pointerup', handlePointerUp)
        }
        return () => {
            document.removeEventListener('pointermove', handlePointerMove)
            document.removeEventListener('pointerup', handlePointerUp)
        }
    }, [isDragging, handlePointerMove, handlePointerUp])

    const [copied, setCopied] = useState(false)

    const toggleShareMenu = () => setShareOpen(prev => !prev)

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // Fallback: do nothing
        }
    }

    const pageUrl = encodeURIComponent(window.location.href)
    const pageTitle = encodeURIComponent('Check out Bánh the Shiba Inu!')

    const shareLinks = [
        { label: 'Facebook', icon: <Facebook size={18} />, url: `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}` },
        { label: 'X', icon: <XIcon size={18} />, url: `https://x.com/intent/tweet?url=${pageUrl}&text=${pageTitle}` },
        { label: 'Reddit', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="14" r="8" /><circle cx="9" cy="13" r="1" fill="currentColor" /><circle cx="15" cy="13" r="1" fill="currentColor" /><path d="M9.5 17c1.1.8 2.5 1 3.5.5" /><path d="M20 6c0-1.1-.9-2-2-2s-2 .9-2 2" /><line x1="17" y1="6" x2="20" y2="2" /></svg>, url: `https://www.reddit.com/submit?url=${pageUrl}&title=${pageTitle}` },
        { label: 'WhatsApp', icon: <MessageCircle size={18} />, url: `https://wa.me/?text=${pageTitle}%20${pageUrl}` },
        { label: 'Telegram', icon: <Send size={18} />, url: `https://t.me/share/url?url=${pageUrl}&text=${pageTitle}` },
        { label: 'TikTok', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" /></svg>, url: `https://www.tiktok.com/` },
    ]

    // Close share menu on outside click
    useEffect(() => {
        if (!shareOpen) return
        const handleClickOutside = (e: MouseEvent) => {
            if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
                setShareOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [shareOpen])

    const formattedTreats = treats.toString().padStart(9, '0').replace(/(\d{3})(?=\d)/g, '$1 ')

    return (
        <header className="profile-header" id="profile-header">
            <div className="profile-header__top-bar">
                <span className="profile-header__handle">@banhandmi</span>
                <div className="profile-header__share-wrapper" ref={shareMenuRef}>
                    <button className="profile-header__share-btn" aria-label="Share" onClick={toggleShareMenu}>
                        <Share2 size={20} />
                    </button>
                    {shareOpen && (
                        <div className="profile-header__share-menu glass">
                            <span className="profile-header__share-menu-title">Share via</span>
                            <div className="profile-header__share-grid">
                                {shareLinks.map(link => (
                                    <a
                                        key={link.label}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="profile-header__share-item"
                                        onClick={() => setShareOpen(false)}
                                    >
                                        <span className="profile-header__share-icon">{link.icon}</span>
                                        <span className="profile-header__share-label">{link.label}</span>
                                    </a>
                                ))}
                                <button
                                    className="profile-header__share-item profile-header__share-item--copy"
                                    onClick={handleCopyLink}
                                >
                                    <span className="profile-header__share-icon">
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </span>
                                    <span className="profile-header__share-label">
                                        {copied ? 'Copied!' : 'Copy Link'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <OgotchiPrototype ref={ogotchiRef} isDragging={isDragging} />

            <p className="profile-header__bio">A Shiba Inu that reinvents reality and dreams.</p>

            <div className="stats-container">
                <div className="stats-counter__panel">
                    <span className="stats-counter__label">Number_of_treats_given</span>
                    <span className="stats-counter__value">{formattedTreats}</span>
                </div>
                <div className="stats-counter__drag">
                    <span className="stats-counter__drag-label">DRAG TO FEED!</span>
                    <div
                        ref={dragIconRef}
                        className={`stats-counter__drag-icon glass${isDragging ? ' stats-counter__drag-icon--dragging' : ''}`}
                        onPointerDown={handlePointerDown}
                        aria-label="Drag to feed treat"
                    >
                        <Cookie size={22} />
                    </div>
                </div>
            </div>
        </header>
    )
}
