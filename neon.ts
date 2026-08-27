import { defineConfig } from '@neon/config/v1'

/**
 * Declares which Neon services each branch of this project runs.
 *
 * `neon deploy` reconciles a branch against this file, so every service the
 * branch should keep has to be listed here — including ones the app does not
 * use yet.
 */
export default defineConfig({
    preview: {
        functions: {
            // Slug is permanent and appears in the invocation URL.
            // Must match ^[a-z0-9]{1,20}$.
            banhapi: {
                name: 'banh and mi API',
                source: 'functions/index.ts',
                env: {
                    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ?? '',
                    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ?? '',
                    // Comma-separated browser origins allowed to call this API.
                    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? '',
                    // Where Stripe returns the donor after checkout.
                    APP_BASE_URL: process.env.APP_BASE_URL ?? '',
                },
            },
        },
        // Provisioned on the branch already. The app serves its media from
        // Vercel's static output, so nothing reads this yet — it is declared
        // so `neon deploy` doesn't tear it down.
        buckets: {
            bucket: { access: 'private' },
        },
    },
})
