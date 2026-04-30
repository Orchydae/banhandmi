export type Lang = 'en' | 'fr'

export const translations = {
    en: {
        // ProfileHeader
        'profile.bio': 'A Shiba Inu that reinvents reality and dreams.',
        'share.via': 'Share via',
        'share.copyLink': 'Copy Link',
        'share.copied': 'Copied!',
        'share.pageTitle': 'Check out Bánh the Shiba Inu!',
        'feed.drag': 'DRAG TO FEED!',
        'feed.counter': 'Number_of_treats_given',
        // Language toggle
        'lang.toggle': 'FR',

        // FeatureGrid
        'feature.donate.title': 'Buy Bánh a Treat',
        'feature.donate.subtitle': 'Support_the_pup',
        'feature.dreamArtifacts.title': 'Dream Artifacts',
        'feature.dreamArtifacts.subtitle': 'Approved_toys',
        'feature.favoriteTreats.title': 'Favorite Treats',
        'feature.disapprovedItems.title': 'Disapproved Items',
        'feature.donorWall.title': 'Donor Wall',
        'feature.upcoming.title': 'Upcoming soon\u2026',

        // CategoryPage
        'category.dreamArtifact.title': 'Dream Artifacts',
        'category.dreamArtifact.subtitle': 'A curated collection of premium toys and engaging accessories.',
        'category.favoriteTreat.title': 'Favorite Treats',
        'category.favoriteTreat.subtitle': 'High-quality treats offering optimal nutrition and exceptional taste.',
        'category.disapprovedItem.title': 'Disapproved Items',
        'category.disapprovedItem.subtitle': 'Products that do not meet our quality standards.',
        'category.loading': 'Loading items\u2026',
        'category.empty': 'No items yet \u2014 check back soon!',
        'category.error': 'Oops \u2014',

        // DonorWallModal
        'donorWall.title': 'Donor Wall',
        'donorWall.subtitle': 'Hoomans who spoil B\u00e1nh',
        'donorWall.loading': 'Loading\u2026',
        'donorWall.empty': 'No donations yet. Be the first! \ud83d\udc3e',

        // DonationModal
        'donation.title': 'Buy B\u00e1nh a Treat',
        'donation.yourName': 'Your name',
        'donation.namePlaceholder': 'e.g. Kind Hooman',
        'donation.amount': 'Amount (USD)',
        'donation.custom': 'Custom',
        'donation.customPlaceholder': 'Enter amount\u2026',
        'donation.message': 'Message',
        'donation.optional': '(optional)',
        'donation.messagePlaceholder': 'Leave B\u00e1nh a message\u2026',
        'donation.preparing': 'Preparing\u2026',
        'donation.continue': 'Continue \u2192',
        'donation.minError': 'Minimum donation is $0.50.',
        'donation.configError': 'Service not configured.',
        'donation.unknownError': 'Something went wrong.',

        // DonationSuccess
        'success.title': 'Thank you!',
        'success.text': 'B\u00e1nh is wagging his tail just for you. Your treat is on his way!',
        'success.back': '\u2190 Back to B\u00e1nh',

        // TerminalPanel
        'terminal.title': 'DREAM_SYSTEM_LOG',
        'terminal.init1': 'Initializing bio-link protocol...',
        'terminal.init2': 'Scanning for dream frequencies...',
        'terminal.init3': 'Status: Stable',
        'terminal.accessed': 'Accessed module:',

        // ItemCard
        'item.viewMore': '...view more',
        'item.showLess': 'show less',

        // Treat messages (App.tsx)
        'treat.msg1': 'Thanks for the treato!',
        'treat.msg2': "Woah! You're so kind ~ Waf!",
        'treat.msg3': 'Are you trying to get me fat?',
    },
    fr: {
        // ProfileHeader
        'profile.bio': 'Un Shiba Inu qui r\u00e9invente la r\u00e9alit\u00e9 et r\u00eave.',
        'share.via': 'Partager via',
        'share.copyLink': 'Copier le lien',
        'share.copied': 'Copi\u00e9\u00a0!',
        'share.pageTitle': 'D\u00e9couvrez B\u00e1nh le Shiba Inu\u00a0!',
        'feed.drag': 'GLISSE POUR NOURRIR\u00a0!',
        'feed.counter': 'Nombre_de_g\u00e2teries_donn\u00e9es',
        // Language toggle
        'lang.toggle': 'EN',

        // FeatureGrid
        'feature.donate.title': 'Offrir une g\u00e2terie \u00e0 B\u00e1nh',
        'feature.donate.subtitle': 'Soutenir_le_chiot',
        'feature.dreamArtifacts.title': 'Artefacts de r\u00eave',
        'feature.dreamArtifacts.subtitle': 'Jouets_approuv\u00e9s',
        'feature.favoriteTreats.title': 'G\u00e2teries pr\u00e9f\u00e9r\u00e9es',
        'feature.disapprovedItems.title': 'Articles d\u00e9sapprouv\u00e9s',
        'feature.donorWall.title': 'Mur des donateurs',
        'feature.upcoming.title': 'Bient\u00f4t disponible\u2026',

        // CategoryPage
        'category.dreamArtifact.title': 'Artefacts de r\u00eave',
        'category.dreamArtifact.subtitle': "Une collection de jouets premium et d\u2019accessoires engageants.",
        'category.favoriteTreat.title': 'G\u00e2teries pr\u00e9f\u00e9r\u00e9es',
        'category.favoriteTreat.subtitle': 'Des g\u00e2teries de haute qualit\u00e9 offrant une nutrition optimale et un go\u00fbt exceptionnel.',
        'category.disapprovedItem.title': 'Articles d\u00e9sapprouv\u00e9s',
        'category.disapprovedItem.subtitle': 'Produits qui ne r\u00e9pondent pas \u00e0 nos normes de qualit\u00e9.',
        'category.loading': 'Chargement\u2026',
        'category.empty': 'Aucun article pour l\u2019instant \u2014 revenez bient\u00f4t\u00a0!',
        'category.error': 'Oups \u2014',

        // DonorWallModal
        'donorWall.title': 'Mur des donateurs',
        'donorWall.subtitle': 'Les hoomains qui g\u00e2tent B\u00e1nh',
        'donorWall.loading': 'Chargement\u2026',
        'donorWall.empty': 'Pas encore de dons. Soyez le premier\u00a0! \ud83d\udc3e',

        // DonationModal
        'donation.title': 'Offrir une g\u00e2terie \u00e0 B\u00e1nh',
        'donation.yourName': 'Votre nom',
        'donation.namePlaceholder': 'ex.\u00a0: Hooman g\u00e9n\u00e9reux',
        'donation.amount': 'Montant (USD)',
        'donation.custom': 'Autre',
        'donation.customPlaceholder': 'Entrez un montant\u2026',
        'donation.message': 'Message',
        'donation.optional': '(facultatif)',
        'donation.messagePlaceholder': 'Laissez un message \u00e0 B\u00e1nh\u2026',
        'donation.preparing': 'Pr\u00e9paration\u2026',
        'donation.continue': 'Continuer \u2192',
        'donation.minError': 'Le don minimum est de 0,50\u00a0$.',
        'donation.configError': 'Service non configur\u00e9.',
        'donation.unknownError': 'Une erreur est survenue.',

        // DonationSuccess
        'success.title': 'Merci\u00a0!',
        'success.text': 'B\u00e1nh remue la queue rien que pour vous. Votre g\u00e2terie est en chemin\u00a0!',
        'success.back': '\u2190 Retour vers B\u00e1nh',

        // TerminalPanel
        'terminal.title': 'DREAM_SYSTEM_LOG',
        'terminal.init1': 'Initialisation du protocole bio-link...',
        'terminal.init2': 'Recherche des fr\u00e9quences de r\u00eave...',
        'terminal.init3': 'Statut\u00a0: Stable',
        'terminal.accessed': 'Module acc\u00e9d\u00e9\u00a0:',

        // ItemCard
        'item.viewMore': '...voir plus',
        'item.showLess': 'voir moins',

        // Treat messages (App.tsx)
        'treat.msg1': 'Merci pour la g\u00e2terie\u00a0!',
        'treat.msg2': 'Wow\u00a0! Tu es si gentil\u00a0~ Waf\u00a0!',
        'treat.msg3': 'Tu essaies de me faire grossir\u00a0?',
    },
} as const

export type TranslationKey = keyof typeof translations.en
