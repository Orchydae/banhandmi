import { useRef, useState } from 'react'
import { X, HeartHandshake } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js'
import { getSupabase } from '../../lib/supabase'
import { useLanguage } from '../../i18n/LanguageContext'
import './DonationModal.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '')

interface DonationModalProps {
    onClose: () => void
}

interface FormState {
    donorName: string
    message: string
    amount: string
}

export default function DonationModal({ onClose }: DonationModalProps) {
    const { t } = useLanguage()
    const AMOUNTS = [2, 5, 10, 25]
    const [step, setStep] = useState<'form' | 'payment'>('form')
    const [form, setForm] = useState<FormState>({ donorName: '', message: '', amount: '10' })
    const [customAmount, setCustomAmount] = useState('')
    const [customFocused, setCustomFocused] = useState(false)
    const [clientSecret, setClientSecret] = useState<string | null>(null)
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
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

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setStatus('loading')
        setErrorMsg('')

        const amountCents = Math.round(parseFloat(form.amount) * 100)
        if (isNaN(amountCents) || amountCents < 50) {
            setErrorMsg(t('donation.minError'))
            setStatus('error')
            return
        }

        const supabase = getSupabase()
        if (!supabase) {
            setErrorMsg(t('donation.configError'))
            setStatus('error')
            return
        }

        try {
            const { data, error } = await supabase.functions.invoke('create-checkout-session', {
                body: {
                    amount_cents: amountCents,
                    donor_name: form.donorName.trim(),
                    message: form.message.trim() || null,
                    return_url: `${window.location.origin}/donation-success`,
                },
            })

            if (error) throw new Error(error.message)
            setClientSecret(data.clientSecret)
            setStep('payment')
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : t('donation.unknownError'))
            setStatus('error')
        } finally {
            setStatus('idle')
        }
    }

    return (
        <div className="donation-overlay" onClick={step === 'form' ? onClose : undefined}>
            <div
                className={`donation-modal glass${step === 'payment' ? ' donation-modal--payment' : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <button className="donation-modal__close" onClick={onClose} aria-label="Close">
                    <X size={18} />
                </button>

                {step === 'form' && (
                    <>
                        <div className="donation-modal__header">
                            <div className="donation-modal__icon">
                                <HeartHandshake size={22} />
                            </div>
                            <h2 className="donation-modal__title">{t('donation.title')}</h2>
                        </div>

                        <form className="donation-modal__form" onSubmit={handleSubmit}>
                            <label className="donation-modal__label">
                                {t('donation.yourName')}
                                <input
                                    className="donation-modal__input"
                                    type="text"
                                    name="donorName"
                                    value={form.donorName}
                                    onChange={handleChange}
                                    placeholder={t('donation.namePlaceholder')}
                                    required
                                />
                            </label>

                            <div className="donation-modal__label">
                                {t('donation.amount')}
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
                                        {t('donation.custom')}
                                    </button>
                                    <input
                                        ref={customInputRef}
                                        className="donation-modal__input donation-modal__custom-input"
                                        type="number"
                                        value={customAmount}
                                        onChange={handleCustomChange}
                                        onFocus={() => setCustomFocused(true)}
                                        onBlur={() => setCustomFocused(false)}
                                        placeholder={t('donation.customPlaceholder')}
                                        min="0.50"
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            <label className="donation-modal__label">
                                {t('donation.message')} <span className="donation-modal__optional">{t('donation.optional')}</span>
                                <textarea
                                    className="donation-modal__input donation-modal__textarea"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    placeholder={t('donation.messagePlaceholder')}
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
                                {status === 'loading'
                                    ? t('donation.preparing')
                                    : `${t('donation.continue')} $${parseFloat(form.amount || '0').toFixed(2)}`
                                }
                            </button>
                        </form>
                    </>
                )}

                {step === 'payment' && clientSecret && (
                    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                )}
            </div>
        </div>
    )
}
