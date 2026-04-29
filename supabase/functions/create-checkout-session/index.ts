// @ts-nocheck
import Stripe from 'npm:stripe@17'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount_cents, donor_name, message, return_url } = await req.json()

        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
            apiVersion: '2026-04-22.dahlia',
        })

        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded_page',
            mode: 'payment',
            return_url,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: { name: 'Treat for Bánh 🐾' },
                        unit_amount: amount_cents,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                donor_name,
                message: message ?? '',
            },
        })

        return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        return new Response(JSON.stringify({ error: msg }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
