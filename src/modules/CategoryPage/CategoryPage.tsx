import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sparkles, Heart, ThumbsDown, Loader } from 'lucide-react'
import { useItems } from '../../hooks/useItems'
import type { ItemCategory } from '../../hooks/useItems'
import ItemGrid from '../../components/ItemGrid/ItemGrid'
import ItemList from '../../components/ItemList/ItemList'
import { useLanguage } from '../../i18n/LanguageContext'
import './CategoryPage.css'

interface CategoryPageProps {
    category: ItemCategory
}

export default function CategoryPage({ category }: CategoryPageProps) {
    const navigate = useNavigate()
    const { t } = useLanguage()
    const { items, loading, error } = useItems(category)

    const config = {
        dream_artifact: {
            title: t('category.dreamArtifact.title'),
            subtitle: t('category.dreamArtifact.subtitle'),
            icon: <Sparkles size={20} />,
            layout: 'grid' as const,
        },
        favorite_treat: {
            title: t('category.favoriteTreat.title'),
            subtitle: t('category.favoriteTreat.subtitle'),
            icon: <Heart size={20} />,
            layout: 'grid' as const,
        },
        disapproved_item: {
            title: t('category.disapprovedItem.title'),
            subtitle: t('category.disapprovedItem.subtitle'),
            icon: <ThumbsDown size={20} />,
            layout: 'list' as const,
        },
    }[category]

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
                        <span>{t('category.loading')}</span>
                    </div>
                )}

                {error && (
                    <div className="category-page__status category-page__status--error">
                        <span>{t('category.error')} {error}</span>
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="category-page__status">
                        <span>{t('category.empty')}</span>
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
