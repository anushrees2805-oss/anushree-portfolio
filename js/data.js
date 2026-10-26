/* ==========================================================================
   PORTFOLIO CONTENT — edit text here.
   Images live in /assets/<folder>/NN.webp and are shown in their numbered
   order (01, 02, 03 …), which follows the numbering of the original files.
   ========================================================================== */

window.SITE = {
  name: "Anushree Sahu",
  email: "anushree.s2805@gmail.com",
  instagram: { handle: "_.anushrees_", url: "https://www.instagram.com/_.anushrees_/" },

  categories: [
    { id: "branding",     no: "01", title: "Branding & Packaging",                   short: "Branding & Packaging" },
    { id: "lens",         no: "02", title: "Visual Storytelling Through My Lens",    short: "Visual Storytelling" },
    { id: "illustration", no: "03", title: "Illustrations & Posters",                short: "Illustrations & Posters" }
  ],

  /* ---------- 01 · BRANDING & PACKAGING (order matters: SUNBUNS → KOGEN → PULSE → NEXIBLES) ---------- */
  projects: [
    {
      slug: "sunbuns",
      no: "01",
      title: "SUNBUNS",
      folder: "sunbuns",
      kind: "Hypothetical brand",
      discipline: "Branding & Packaging",
      line: "A sun-kissed bakery & café in Lyon",
      tagline: "Sweet. Soft. SunBuns.",
      accent: "#B45C2A",
      cover: 1, thumb: 23,
      intro: [
        "SunBuns is a warm, inviting bakery and café set in Lyon, France — a brand that blends the rustic soul of French boulangeries with a playful, sun-kissed identity, known for buttery croissants, golden tarts, fruit-filled danishes, sourdough loaves and signature cinnamon sun buns baked fresh every day.",
        "The two spirals in the logo are cinnamon rolls, drawn on a grid for symmetry and a little playful reflection. The earthy, warm brown is the colour of pastries straight out of the oven, and the rounded, soft type keeps the whole thing friendly."
      ],
      facts: [
        ["Industry", "Bakery & Café"],
        ["Setting", "Lyon, France"],
        ["Type", "Hypothetical brand project"],
        ["Scope", "Logo, colour palette, menu, packaging, signage, merchandise, social"]
      ],
      layout: "duo"
    },
    {
      slug: "kogen",
      no: "02",
      title: "KŌGEN",
      folder: "kogen",
      kind: "Hypothetical brand",
      discipline: "Branding & Packaging",
      line: "A Himalayan chilli oil from Sikkim",
      tagline: "香源 — calm, precise, umami-forward.",
      accent: "#7A0F1C",
      cover: 1, thumb: 5,
      intro: [
        "KŌGEN (香源) is a Himalayan chilli oil from Sikkim, India, made for mindful food lovers and modern home cooks who seek depth over excess.",
        "Unlike mass-market chilli oils driven by heat and noise, KŌGEN is positioned around calm, precise, umami-forward flavours crafted with GI-certified Himalayan ingredients and intentional restraint — so the identity borrows that restraint: a deep crimson, charred stone and Himalayan white, line illustrations of chilli farmers, and a quiet Japanese-inspired voice."
      ],
      facts: [
        ["Product", "Himalayan chilli oil"],
        ["Origin", "Sikkim, India"],
        ["Type", "Hypothetical brand project"],
        ["Scope", "Brand direction, colour palette, packaging & collaterals"]
      ],
      layout: "duo"
    },
    {
      slug: "pulse",
      no: "03",
      title: "PULSE",
      folder: "pulse",
      kind: "Hypothetical brand",
      discipline: "Branding",
      line: "A yoga & mindful-movement studio",
      tagline: "Find your flow. Feel your pulse.",
      accent: "#EE5A24",
      cover: 1, thumb: 11,
      intro: [
        "Pulse is a next-generation yoga and mindful-movement studio — with a knack for running — designed for urban millennials and Gen Z. More than just a yoga space, it's where breath, music and mindfulness flow together.",
        "Members don't just do poses here; they come to find balance, align their energy and connect with a community that values both inner strength and holistic well-being. The identity moves the same way: a single fluid mark, a burnt-orange heat and a lot of motion blur."
      ],
      facts: [
        ["Industry", "Yoga & fitness studio"],
        ["Audience", "Urban millennials & Gen Z"],
        ["Type", "Hypothetical brand project"],
        ["Scope", "Logo, palette, stationery, signage, merchandise, social, campaign"]
      ],
      layout: "duo"
    },
    {
      slug: "nexibles",
      no: "04",
      title: "NEXIBLES",
      folder: "nexibles",
      kind: "Internship",
      discipline: "Packaging Design Internship",
      line: "A digital packaging solutions brand",
      tagline: "Packaging a moment, one story at a time.",
      accent: "#304FFE",
      internship: true,
      cover: 4, thumb: 1, logo: "assets/nexibles/logo.webp",
      intro: [
        "Nexibles is a digital packaging solutions brand. During my packaging design internship there, I worked across food, lifestyle, fragrance, wellness and personal care, taking each pack from a flat dieline to final artwork and realistic mockups.",
        "Each box meant developing the dieline, typography, colour palette and panel composition around the product's identity — then checking how it actually reads on a shelf, in a hand and out of the box."
      ],
      facts: [
        ["Company", "Nexibles"],
        ["Role", "Packaging design intern"],
        ["Scope", "Dielines, structural layouts, packaging artwork, mockups"]
      ],
      /* research behind the internship work — from the process document */
      research: {
        intro: "Every box started with research. Primary research into how packaging is actually made, then secondary research, moodboards and sketches for each brand before a single panel was laid out.",
        primary: [
          ["Papers & substrates", "Coated, uncoated and kraft boards — how GSM, stiffness, texture and folding change the way a design looks and feels."],
          ["Printing methods", "Offset for cartons, digital for short runs and prototypes, flexo for labels and films, gravure for high-volume flexibles."],
          ["Flexible packaging", "At Nexibles: digital printing without plates, then lamination, slitting, pouch forming and heat sealing — and why artwork must respect folds, seams and seal areas."],
          ["Finishes", "Emboss, deboss, spot UV and metallic foil — used to build depth, contrast and a premium feel."]
        ],
        primaryImgs: [4, 5],
        projects: [
          { name: "Choco Chaabi", kind: "Chocolate", idea: "“Mirror Wala Moment” — scooter rides with Papa, seen in the rear-view mirror; a chocolate that unlocks sweet memories.", did: "Indian chocolate packs, nostalgic scooter imagery and Indian botanical motifs simplified into a modern pattern.", imgs: [6, 9, 10] },
          { name: "Embera", kind: "Incense sticks", idea: "Warm, earthy and calm — the quiet ritual of sandalwood.", did: "Minimal incense packaging, sandalwood wood-grain textures and a study of the carton's dieline and panel flow.", imgs: [17, 19, 20] },
          { name: "Terra", kind: "Soap", idea: "A botanical luxury soap balancing earth and water.", did: "Premium skincare packs and ingredients — blue lotus, sea minerals, aloe vera — plus elegant high-contrast type.", imgs: [26, 29, 30], finals: [33, 34] },
          { name: "Makhanmirch", kind: "Burger box", idea: "A bold burger box with playful Indian visual culture — and a game to play while you eat.", did: "Loud, youthful burger packaging, interactive packs built around games, and Hindi type treatments.", imgs: [37, 40, 41] },
          { name: "Faeve", kind: "Chocolate", idea: "A school-picnic burst of joy for a Mango Kulfi milk chocolate.", did: "Character-led chocolate packaging and picnic visuals — checks, baskets, buses and playful kids.", imgs: [48, 51, 52] },
          { name: "Navs", kind: "Soap", idea: "A text-led, industrial-style soap where the letters introduce Neem, Aloe and Vera.", did: "Experimental poster and packaging typography, and the textures of neem and aloe vera.", imgs: [59, 62, 63] }
        ]
      },
      layout: "groups",
      /* Groups follow the order of the files in the Nexibles folder (mockup 1 before mockup 2). */
      groups: [
        { title: "Makhanmirch", sub: "Burger box — dieline to mockup", images: [1, 2] },
        { title: "Gooric", sub: "Lifestyle product — top-bottom cap box", images: [3] },
        { title: "Choco Chaabi", sub: "“Mirror Wala Moment” dark caramel chocolate", images: [4, 5] },
        { title: "Faeve", sub: "Chocolate packaging", images: [7, 6] },
        { title: "Embera", sub: "Incense stick packaging", images: [8, 9] },
        { title: "Monocartons", sub: "Noir Élan · Veloria · Lumiflora · Aureva Wellness — from dieline to final design", images: [10, 11] },
        { title: "Neem Aloe Vera Soap", sub: "Soap packaging", images: [12, 13] }
      ]
    }
  ],

  /* ---------- 02 · ILLUSTRATIONS & POSTERS ---------- */
  illustrations: {
    folder: "illustrations",
    items: [
      { n: 4, title: "Poster", note: "Product poster" },
      { n: 1, title: "Illustration", note: "Portrait studies" },
      { n: 2, title: "Illustrations", note: "Characters — Procreate" },
      { n: 3, title: "Poster", note: "Curiosity — typographic poster" }
    ]
  },

  /* ---------- 03 · VISUAL STORYTELLING THROUGH MY LENS ---------- */
  films: [
    { slug: "kaun", title: "Kaun", kind: "Short film", dur: "3:18", file: "kaun" },
    { slug: "havaijahaaz", title: "Havaijahaaz", kind: "Short film", dur: "1:58", file: "havaijahaaz" },
    { slug: "naadan", title: "Naadan", kind: "Film edit", dur: "0:19", file: "naadan" }
  ],

  stories: [
    {
      slug: "unlearning-pretty", title: "Unlearning Pretty", folder: "outdoor",
      kind: "Outdoor fashion shoot", cover: 9, camera: "Sony Alpha 6700",
      skip: [12, 14, 17, 23], /* near-duplicate frames */
      intro: "An outdoor fashion story shot on location in dry grass, rock and late light — white layers, a heavy belt, boots, and a face that doesn't need to try. Shot on a Sony Alpha 6700."
    },
    {
      slug: "styling-and-shoot", title: "Styling & Shoot", folder: "styling",
      kind: "Styling + street shoot", cover: 10, camera: "Sony Alpha 6700",
      intro: "A look I styled around my own signature style — where preppy meets streetwear. Gingham checks, washed denim, a crisp white tank, layered silver and red sneakers, shot on location across the city: between parked cars, under the trees and inside a steel lift. Shot on a Sony Alpha 6700."
    },
    {
      slug: "gulls", title: "Gulls", folder: "gateway",
      kind: "Places through my lens · The feathered tourists", cover: 1, camera: "Sony Alpha 6700",
      intro: "The gulls at the Gateway — “the feathered tourists”. A series about wings, water, crowds and the city standing behind them."
    },
    {
      slug: "aakaar", title: "आकार — Kumbharvada", folder: "kumbharvada",
      kind: "Places through my lens · Kumbharvada", cover: 4, camera: "Sony Alpha 6700",
      intro: "आकार (aakaar) means shape. A walk through the potters' colony of Kumbharvada — clay, hands, rows of diyas and blue doors in low light."
    }
  ]
};
