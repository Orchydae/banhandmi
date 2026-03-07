import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Heart, ThumbsDown, Loader } from 'lucide-react'
import { useItems } from '../../hooks/useItems'
import type { ItemCategory } from '../../hooks/useItems'
import ItemGrid from '../../components/ItemGrid/ItemGrid'
import ItemList from '../../components/ItemList/ItemList'
import './CategoryPage.css'

interface CategoryConfig {
    title: string
    subtitle: string
    icon: React.ReactNode
    layout: 'grid' | 'list'
}

const CATEGORY_CONFIG: Record<ItemCategory, CategoryConfig> = {
    dream_artifact: {
        title: 'Dream Artifacts',
        subtitle: 'A curated collection of premium toys and engaging accessories.',
        icon: <Sparkles size={20} />,
        layout: 'grid',
    },
    favorite_treat: {
        title: 'Favorite Treats',
        subtitle: 'High-quality treats offering optimal nutrition and exceptional taste.',
        icon: <Heart size={20} />,
        layout: 'grid',
    },
    disapproved_item: {
        title: 'Disapproved Items',
        subtitle: 'Products that do not meet our quality standards.',
        icon: <ThumbsDown size={20} />,
        layout: 'list',
    },
}

interface CategoryPageProps {
    category: ItemCategory
}

export default function CategoryPage({ category }: CategoryPageProps) {
    const navigate = useNavigate()
    const config = CATEGORY_CONFIG[category]
    const { items, loading, error } = useItems(category)

    return (
        <div className="category-page">
            {/* Header */}
            <header className="category-page__header">
                <button
                    className="category-page__back"
                    onClick={() => navigate('/')}
                    aria-label="Go back home"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="category-page__title-group">
                    <div className="category-page__heading">
                        <span className="category-page__icon">{config.icon}</span>
                        <h1 className="category-page__title">{config.title}</h1>
                    </div>
                    <p className="category-page__subtitle">{config.subtitle}</p>
                </div>
            </header>

            {/* Content */}
            <section className="category-page__content">
                {loading && (
                    <div className="category-page__status">
                        <Loader size={24} className="category-page__spinner" />
                        <span>Loading items…</span>
                    </div>
                )}

                {error && (
                    <div className="category-page__status category-page__status--error">
                        <span>Oops — {error}</span>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="category-page__status">
                        <span>No items yet — check back soon!</span>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    config.layout === 'grid'
                        ? <ItemGrid items={items} />
                        : <ItemList items={items} />
                )}
            </section>
        </div>
    )
}
