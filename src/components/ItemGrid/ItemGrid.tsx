import type { Item } from '../../hooks/useItems'
import ItemCard from '../ItemCard/ItemCard'
import './ItemGrid.css'

interface ItemGridProps {
    items: Item[]
}

export default function ItemGrid({ items }: ItemGridProps) {
    return (
        <div className="item-grid">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    )
}
