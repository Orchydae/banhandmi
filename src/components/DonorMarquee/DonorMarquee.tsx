import { useEffect, useState } from 'react'
import { getSupabase } from '../../lib/supabase'
import './DonorMarquee.css'

interface Donation {
    id: string
    donor_name: string
    message: string | null
    amount_cents: number
}

export default function DonorMarquee() {
    const [donations, setDonations] = useState<Donation[]>([])

    useEffect(() => {
        const supabase = getSupabase()
        if (!supabase) return
        supabase
            .from('donations')
            .select('id, donor_name, message, amount_cents')
            .order('created_at', { ascending: false })
            .limit(30)
            .then(({ data }) => { if (data) setDonations(data) })
    }, [])

    if (donations.length === 0) return null

    // Repeat enough times so one copy fills well beyond any viewport width
    const MIN_COPIES = Math.ceil(12 / donations.length)
    const singleSet = Array.from({ length: MIN_COPIES }, () => donations).flat()
    const items = [...singleSet, ...singleSet]
    const duration = Math.max(20, singleSet.length * 4)

    return (
        <div className="donor-marquee">
            <div
                className="donor-marquee__track"
                style={{ animationDuration: `${duration}s` }}
            >
                {items.map((d, i) => (
                    <span key={`${d.id}-${i}`} className="donor-marquee__item">
                        <span className="donor-marquee__paw">🐾</span>
                        <span className="donor-marquee__name">{d.donor_name}</span>
                        <span className="donor-marquee__amount">${(d.amount_cents / 100).toFixed(0)}</span>
                        {d.message && (
                            <span className="donor-marquee__msg">"{d.message}"</span>
                        )}
                        <span className="donor-marquee__dot" aria-hidden>·</span>
                    </span>
                ))}
            </div>
        </div>
    )
}
