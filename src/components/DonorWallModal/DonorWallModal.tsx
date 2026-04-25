import { useEffect, useState } from 'react'
import { X, Crown } from 'lucide-react'
import { getSupabase } from '../../lib/supabase'
import './DonorWallModal.css'

interface Donation {
    id: string
    donor_name: string
    message: string | null
    amount_cents: number
    created_at: string
}

interface DonorWallModalProps {
    onClose: () => void
}

export default function DonorWallModal({ onClose }: DonorWallModalProps) {
    const [donations, setDonations] = useState<Donation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supabase = getSupabase()
        if (!supabase) { setLoading(false); return }
        supabase
            .from('donations')
            .select('id, donor_name, message, amount_cents, created_at')
            .order('amount_cents', { ascending: false })
            .then(({ data }) => {
                if (data) setDonations(data)
                setLoading(false)
            })
    }, [])

    return (
        <div className="donor-wall-overlay" onClick={onClose}>
            <div className="donor-wall-modal glass" onClick={e => e.stopPropagation()}>
                <button className="donor-wall-modal__close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>

                <div className="donor-wall-modal__header">
                    <div className="donor-wall-modal__icon">
                        <Crown size={22} />
                    </div>
                    <h2 className="donor-wall-modal__title">Donor Wall</h2>
                    <p className="donor-wall-modal__subtitle">Hoomans who spoil Bánh</p>
                </div>

                <div className="donor-wall-modal__list">
                    {loading && (
                        <p className="donor-wall-modal__empty">Loading…</p>
                    )}
                    {!loading && donations.length === 0 && (
                        <p className="donor-wall-modal__empty">No donations yet. Be the first! 🐾</p>
                    )}
                    {donations.map((d, i) => (
                        <div key={d.id} className="donor-wall-modal__item">
                            <span className="donor-wall-modal__rank">
                                {i === 0 ? <Crown size={14} className="donor-wall-modal__crown" /> : `#${i + 1}`}
                            </span>
                            <div className="donor-wall-modal__info">
                                <span className="donor-wall-modal__name">{d.donor_name}</span>
                                {d.message && (
                                    <span className="donor-wall-modal__msg">"{d.message}"</span>
                                )}
                            </div>
                            <span className="donor-wall-modal__amount">
                                ${(d.amount_cents / 100).toFixed(0)}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
