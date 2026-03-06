import { useRef, useEffect, useCallback, useState } from 'react'
import { Link, Cookie } from 'lucide-react'
import { useTreatsCounter } from '../../hooks/useTreatsCounter'
import './ProfileHeader.css'

interface ProfileHeaderProps {
    onFeed?: () => void;
}

export default function ProfileHeader({ onFeed }: ProfileHeaderProps) {
    const { treats, increment } = useTreatsCounter()
    const [isPlaying, setIsPlaying] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const dragIconRef = useRef<HTMLDivElement>(null)
    const avatarRingRef = useRef<HTMLDivElement>(null)
    const floatingCloneRef = useRef<HTMLElement | null>(null)

    const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (!dragIconRef.current) return

        const el = dragIconRef.current
        el.setPointerCapture(e.pointerId)

        const rect = el.getBoundingClientRect()
        const clone = el.cloneNode(true) as HTMLElement
        clone.style.cssText = `
            position: fixed;
            width: ${rect.width}px;
            height: ${rect.height}px;
            top: ${e.clientY - rect.height / 2}px;
            left: ${e.clientX - rect.width / 2}px;
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
        if (!floatingCloneRef.current) return
        const clone = floatingCloneRef.current
        const w = parseFloat(clone.style.width)
        const h = parseFloat(clone.style.height)
        clone.style.left = `${e.clientX - w / 2}px`
        clone.style.top = `${e.clientY - h / 2}px`
    }, [])

    const handlePointerUp = useCallback((e: PointerEvent) => {
        // Check if released over the avatar ring
        if (avatarRingRef.current && videoRef.current) {
            const rect = avatarRingRef.current.getBoundingClientRect()
            const over =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom
            if (over) {
                increment()
                onFeed?.()
                setIsPlaying(true)
                if (videoRef.current) {
                    videoRef.current.currentTime = 0
                    videoRef.current.play().catch(() => { })
                }
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0
                        audioRef.current.play().catch(() => { })
                    }
                }, 1000)
            }
        }
        // Clean up
        if (floatingCloneRef.current) {
            document.body.removeChild(floatingCloneRef.current)
            floatingCloneRef.current = null
        }
        document.body.style.cursor = ''
        setIsDragging(false)
    }, [])

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('pointermove', handlePointerMove)
            document.addEventListener('pointerup', handlePointerUp)
        }
        return () => {
            document.removeEventListener('pointermove', handlePointerMove)
            document.removeEventListener('pointerup', handlePointerUp)
        }
    }, [isDragging, handlePointerMove, handlePointerUp])

    const handleVideoEnded = () => {
        setIsPlaying(false)
    }

    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // Fallback: do nothing
        }
    }

    const formattedTreats = treats.toString().padStart(9, '0').replace(/(\d{3})(?=\d)/g, '$1 ')

    return (
        <header className="profile-header" id="profile-header">
            <div className="profile-header__top-bar">
                <span className="profile-header__handle">@banhandmi</span>
                <button className="profile-header__share-btn" aria-label="Copy link" onClick={handleShare}>
                    <Link size={20} />
                    {copied && <span className="profile-header__copied-tooltip">Link Copied!</span>}
                </button>
            </div>

            <div ref={avatarRingRef} className="profile-header__avatar-ring">
                <img
                    className={`profile-header__avatar profile-header__avatar--photo ${isPlaying ? 'profile-header__avatar--hidden' : ''}`}
                    src={isDragging ? '/banhondrag.png' : '/webphoto.jpg'}
                    alt="Bánh the Shiba Inu"
                />
                <video
                    ref={videoRef}
                    className={`profile-header__avatar profile-header__avatar--video ${isPlaying ? 'profile-header__avatar--visible' : ''}`}
                    src="/banh-eating.mp4"
                    muted
                    playsInline
                    onEnded={handleVideoEnded}
                />
                <audio ref={audioRef} src="/minecraft-eating.mp3" preload="auto" />
            </div>

            <h1 className="profile-header__name">Bánh</h1>
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
