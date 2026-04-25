import { useRef, useState } from 'react'
import { X, HeartHandshake } from 'lucide-react'
import { getSupabase } from '../../lib/supabase'
import './DonationModal.css'

interface DonationModalProps {
    onClose: () => void
}

interface FormState {
    donorName: string
    message: string
    amount: string
}

export default function DonationModal({ onClose }: DonationModalProps) {
    const AMOUNTS = [2, 5, 10, 25]
    const [form, setForm] = useState<FormState>({ donorName: '', message: '', amount: '10' })
    const [customAmount, setCustomAmount] = useState('')
    const [customFocused, setCustomFocused] = useState(false)
    const customInputRef = useRef<HTMLInputElement>(null)

    const isCustomActive = customFocused || customAmount !== ''

    function selectPreset(amt: number) {
        setCustomAmount('')
        setForm(prev => ({ ...prev, amount: String(amt) }))
    }

    function handleCustomChange(e: React.ChangeEvent<HTMLInputElement>) {
        setCustomAmount(e.target.value)
        setForm(prev => ({ ...prev, amount: e.target.value }))
    }
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('loading')
        setErrorMsg('')

        const amountCents = Math.round(parseFloat(form.amount) * 100)
        if (isNaN(amountCents) || amountCents <= 0) {
            setErrorMsg('Please enter a valid amount.')
            setStatus('error')
            return
        }

        const supabase = getSupabase()
        if (!supabase) {
            setErrorMsg('Supabase is not configured.')
            setStatus('error')
            return
        }

        const { error } = await supabase.from('donations').insert({
            stripe_payment_id: `test_${Date.now()}`,
            donor_name: form.donorName.trim(),
            message: form.message.trim() || null,
            amount_cents: amountCents,
        })

        if (error) {
            setErrorMsg(error.message)
            setStatus('error')
        } else {
            setStatus('success')
        }
    }

    return (
        <div className="donation-overlay" onClick={onClose}>
            <div className="donation-modal glass" onClick={e => e.stopPropagation()}>
                <button className="donation-modal__close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>

                <div className="donation-modal__header">
                    <div className="donation-modal__icon">
                        <HeartHandshake size={22} />
                    </div>
                    <h2 className="donation-modal__title">Buy Bánh a Treat</h2>
                    <span className="donation-modal__badge">TEST MODE</span>
                </div>

                {status === 'success' ? (
                    <div className="donation-modal__success">
                        <span className="donation-modal__success-emoji">🐾</span>
                        <p>Donation recorded! Check your Supabase table.</p>
                        <button className="donation-modal__btn" onClick={onClose}>Close</button>
                    </div>
                ) : (
                    <form className="donation-modal__form" onSubmit={handleSubmit}>
                        <label className="donation-modal__label">
                            Your name
                            <input
                                className="donation-modal__input"
                                type="text"
                                name="donorName"
                                value={form.donorName}
                                onChange={handleChange}
                                placeholder="e.g. Kind Hooman"
                                required
                            />
                        </label>

                        <div className="donation-modal__label">
                            Amount (USD)
                            <div className="donation-modal__amounts">
                                {AMOUNTS.map(amt => (
                                    <button
                                        key={amt}
                                        type="button"
                                        className={`donation-modal__amount-btn${!isCustomActive && form.amount === String(amt) ? ' donation-modal__amount-btn--active' : ''}`}
                                        onClick={() => selectPreset(amt)}
                                    >
                                        ${amt}
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    className={`donation-modal__amount-btn${isCustomActive ? ' donation-modal__amount-btn--active' : ''}`}
                                    onClick={() => customInputRef.current?.focus()}
                                >
                                    Custom
                                </button>
                                <input
                                    ref={customInputRef}
                                    className="donation-modal__input donation-modal__custom-input"
                                    type="number"
                                    value={customAmount}
                                    onChange={handleCustomChange}
                                    onFocus={() => setCustomFocused(true)}
                                    onBlur={() => setCustomFocused(false)}
                                    placeholder="Enter amount…"
                                    min="0.01"
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <label className="donation-modal__label">
                            Message <span className="donation-modal__optional">(optional)</span>
                            <textarea
                                className="donation-modal__input donation-modal__textarea"
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                placeholder="Leave Bánh a message…"
                                rows={3}
                            />
                        </label>

                        {status === 'error' && (
                            <p className="donation-modal__error">{errorMsg}</p>
                        )}

                        <button
                            className="donation-modal__btn"
                            type="submit"
                            disabled={status === 'loading'}
                        >
                            {status === 'loading' ? 'Sending…' : 'Send Donation'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
