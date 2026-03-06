import { useState, useRef, useEffect } from 'react'
import { ExternalLink } from 'lucide-react'
import type { Item } from '../../hooks/useItems'
import './ItemCard.css'

interface ItemCardProps {
    item: Item
}

export default function ItemCard({ item }: ItemCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [isClamped, setIsClamped] = useState(false)
    const descRef = useRef<HTMLParagraphElement>(null)

    useEffect(() => {
        const el = descRef.current
        if (el) {
            setIsClamped(el.scrollHeight > el.clientHeight)
        }
    }, [item.description])

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
                        alt={item.name}
                        className="item-card__image"
                        loading="lazy"
                    />
                </div>
            )}
            <div className="item-card__body">
                <span className="item-card__name">{item.name}</span>
                {item.description && (
                    <div className="item-card__desc-wrap">
                        <p
                            ref={descRef}
                            className={`item-card__desc ${expanded ? 'item-card__desc--expanded' : ''}`}
                        >
                            {item.description}
                        </p>
                        {isClamped && (
                            <button
                                className="item-card__more"
                                onClick={handleToggle}
                                aria-label={expanded ? 'Show less' : 'Show more'}
                            >
                                {expanded ? 'show less' : '...view more'}
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
                aria-label={`View ${item.name} on store`}
            >
                {content}
            </a>
        )
    }

    return <div className="item-card glass">{content}</div>
}
