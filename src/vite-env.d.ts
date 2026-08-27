/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Invocation URL of the `banhapi` Neon Function, e.g. https://br-xxx-banhapi.compute.<cell>.us-east-2.aws.neon.tech */
    readonly VITE_API_BASE_URL: string
    readonly VITE_STRIPE_PUBLISHABLE_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
