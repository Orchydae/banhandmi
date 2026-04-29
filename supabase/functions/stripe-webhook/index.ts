// @ts-nocheck
import Stripe from 'npm:stripe@17'
import { createClient } from 'npm:@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
    const signature = req.headers.get('stripe-signature')
    const body = await req.text()

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2026-04-22.dahlia',
    })

    let event: Stripe.Event

    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            signature!,
            Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
        )
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid signature'
        return new Response(JSON.stringify({ error: msg }), { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
        )

        await supabase.from('donations').insert({
            stripe_payment_id: session.payment_intent as string,
            donor_name: session.metadata?.donor_name ?? 'Anonymous',
            message: session.metadata?.message || null,
            amount_cents: session.amount_total,
        })
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json' },
    })
})
