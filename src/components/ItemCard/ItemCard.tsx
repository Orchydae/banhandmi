import { useState, useRef, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Item } from '../../hooks/useItems'
import { useLanguage } from '../../i18n/LanguageContext'
import './ItemCard.css'

interface ItemCardProps {
    item: Item
}

export default function ItemCard({ item }: ItemCardProps) {
    const { lang, t } = useLanguage()
    const [expanded, setExpanded] = useState(false)
    const [isClamped, setIsClamped] = useState(false)
    const descRef = useRef<HTMLParagraphElement>(null)

    const displayName = (lang === 'fr' && item.name_fr) ? item.name_fr : item.name
    const displayDesc = (lang === 'fr' && item.description_fr) ? item.description_fr : item.description

    useEffect(() => {
        const el = descRef.current
        if (el) {
            setIsClamped(el.scrollHeight > el.clientHeight)
        }
    }, [displayDesc])

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setExpanded((prev) => !prev)
    }

    const content = (
        <>
            {item.image_url && (
                <div className="item-card__image-wrap">
                    <img
                        src={item.image_url}
                        alt={displayName}
                        className="item-card__image"
                        loading="lazy"
                    />
                </div>
            )}
            <div className="item-card__body">
                <span className="item-card__name">{displayName}</span>
                {displayDesc && (
                    <div className="item-card__desc-wrap">
                        <p
                            ref={descRef}
                            className={`item-card__desc ${expanded ? 'item-card__desc--expanded' : ''}`}
                        >
                            {displayDesc}
                        </p>
                        {isClamped && (
                            <button
                                className="item-card__more"
                                onClick={handleToggle}
                                aria-label={expanded ? t('item.showLess') : t('item.viewMore')}
                            >
                                {expanded ? t('item.showLess') : t('item.viewMore')}
                            </button>
                        )}
                    </div>
                )}
                {item.price_hint != null && (
                    <span className="item-card__price">
                        ${item.price_hint.toFixed(2)}
                    </span>
                )}
            </div>
            {item.affiliate_url && (
                <div className="item-card__link-icon" aria-hidden="true">
                    <ExternalLink size={14} />
                </div>
            )}
        </>
    )

    if (item.affiliate_url) {
        return (
            <a
                href={item.affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="item-card glass"
                aria-label={`View ${displayName} on store`}
            >
                {content}
            </a>
        )
    }

    return <div className="item-card glass">{content}</div>
}
