import type { Item } from '../../hooks/useItems'
import ItemCard from '../ItemCard/ItemCard'
import './ItemList.css'

interface ItemListProps {
    items: Item[]
}

export default function ItemList({ items }: ItemListProps) {
    return (
        <div className="item-list">
            {items.map((item) => (
                <ItemCard key={item.id} item={item} />
            ))}
        </div>
    )
}
