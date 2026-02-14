export const RELATIONSHIP_DATE = Object.freeze({
  day: 1,
  month: 11,
  year: 2025,
  hour: 19,
  minute: 17,
  second: 10
});

export const APP_CONFIG = Object.freeze({
  maxAttemptsBeforeCooldown: 4,
  cooldownMs: 30_000,
  lockStateStorageKey: "valentine2026.lockState",
  unlockSessionStorageKey: "valentine2026.unlocked",
  rememberUnlockInSession: true,
  musicConsentStorageKey: "valentine2026.musicConsent",
  musicVolumeStorageKey: "valentine2026.musicVolume"
});

export const MUSIC_CONFIG = Object.freeze({
  sources: Object.freeze([
    Object.freeze({ src: "./assets/audio/music.m4a", type: "audio/mp4" }),
    Object.freeze({ src: "./assets/audio/music.mp3", type: "audio/mpeg" }),
    Object.freeze({ src: "./assets/audio/music.ogg", type: "audio/ogg" }),
    Object.freeze({ src: "./assets/audio/music.flac", type: "audio/flac" })
  ]),
  src: "./assets/audio/music.flac",
  defaultVolume: 0.65,
  autoplayAfterConsent: true
});

export const PASSWORD_HINTS = Object.freeze([
  "Hint: Think of that evening in early November."
]);

export const LETTER_LINES = Object.freeze([
  "Adélka, when you look at me, my thoughts disappear,",
  "you calm the worst in me and make my mind crystal clear.",
  "",
  "Your eyes see through the masks I wear, through every face I hide,",
  "you know who I am, and you don’t step aside.",
  "",
  "That snake ring with red drops fits you well - dark, dangerous, and beautiful,",
  "it feels like a promise made into metal: me and you, it will be blissful.",
  "",
  "You are mine in the way that never needs display,",
  "and this is my vow - whatever comes, I stay."
]);

export const TIMELINE_ITEMS = Object.freeze([
  {
    date: "29 Jul 2024",
    title: "First meeting",
    text: "The first time I laid my eyes on you and I immediately knew I want to spend my life with you."
  },
  {
    date: "31 Oct 2024",
    title: "Poems",
    text: "The day when I read the most poems written by you and also the day I wrote the most poems for you."
  },
  {
    date: "16 Aug 2025",
    title: "Important day",
    text: "This is the day I fell in love with you and knew there is no other way."
  },
  {
    date: "04 Oct 2025",
    title: "Our first date",
    text: "The day when I went to Brno and had the most mesmorising day until that point in my life."
  },
  {
    date: "01 Nov 2025",
    title: "Our beginning",
    text: "The night we became us. I still remember every second of it."
  },
  {
    date: "30 Dec 2025",
    title: "New year's eve",
    text: "First new year with you where you got to know my whole family."
  },
  {
    date: "21 Dec 2025",
    title: "Tea house",
    text: "Talking with you in čajovna became one of my favorite moments."
  },
  {
    date: "24 Jan 2026",
    title: "First concert together",
    text: "We waited at the wrong entrance and still had the best time together."
  },
  {
    date: "14 Feb 2026",
    title: "Valentine memory",
    text: "A reminder that every chapter with you is my favorite chapter. Let's not stop reading."
  }
]);

export const GALLERY_ITEMS = Object.freeze([
  {
    src: "./assets/photos/photo-01.jpg",
    alt: "Photo with both of us and my family.",
    caption: "My family around us, but my eyes were still looking at you.",
    date: "2025-12-31",
    location: "New year's eve",
    tags: ["family", "portrait", "night"]
  },
  {
    src: "./assets/photos/photo-02.jpg",
    alt: "Night street selfie with us kissing and parked cars in the background.",
    caption: "Cold streets, but you warmed me up with your presence (and kiss 👉👈).",
    date: "2026-01-24",
    location: "City center",
    tags: ["kiss", "selfie", "outdoor"]
  },
  {
    src: "./assets/photos/photo-03.jpg",
    alt: "Close-up selfie of both of us.",
    caption: "Being able to be myself with you is the best feeling in the world.",
    date: "2026-01-24",
    location: "Before concert",
    tags: ["selfie", "close-up", "outdoor", "funny"]
  },
  {
    src: "./assets/photos/photo-04.jpg",
    alt: "Photo of both of us in front of ZHROMAŽDIŠTE.",
    caption: "ZHROMAŽDIŠTE!! (Gathering place for all my favorite things, meaning you.)",
    date: "2026-01-24",
    location: "ZHROMAŽDIŠTE",
    tags: ["outdoor", "funny", "art"]
  },
  {
    src: "./assets/photos/photo-05.jpg",
    alt: "Night selfie of both of us waiting for concert at the wrong entrance.",
    caption: "Even though we've waited at the wrong entrance, I wouldn't trade a moment of it for anything.",
    date: "2026-01-25",
    location: "Outside concert venue",
    tags: ["concert", "night", "outdoor"]
  },
  {
    src: "./assets/photos/photo-06.jpg",
    alt: "Selfie of us already at the concert venue.",
    caption: "I'm so glad I could have attended the concert with YOU.",
    date: "2026-01-25",
    location: "Concert venue",
    tags: ["concert", "selfie"]
  },
  {
    src: "./assets/photos/photo-07.jpg",
    alt: "Close-up selfie of both of us.",
    caption: "I love your hair, I could play with it all day.",
    date: "2025-11-28",
    location: "On coffee date",
    tags: ["selfie", "close-up"]
  },
  {
    src: "./assets/photos/photo-08.jpg",
    alt: "Extreme close-up selfie focused on your glasses.",
    caption: "Even our weirdest angles are my favorite memories.",
    date: "2026-01-17",
    location: "At your house",
    tags: ["selfie", "funny", "close-up"]
  },
  {
    src: "./assets/photos/photo-09.jpg",
    alt: "Mirror photo of both of us after the concert in our concert outfits.",
    caption: "Us tired and happy after the concert, I miss holding you like that.",
    date: "2026-01-25",
    location: "After concert",
    tags: ["concert", "mirror", "night"]
  },
  {
    src: "./assets/photos/photo-10.jpg",
    alt: "Warm-toned close selfie of both of us in čajovna.",
    caption: "Going to čajovna with you and just talking is one of my most favorite activities.",
    date: "2025-12-21",
    location: "Čajovna",
    tags: ["tea", "selfie", "cozy"]
  },
  {
    src: "./assets/photos/photo-11.jpg",
    alt: "Dimly lit close selfie of both of us in čajovna.",
    caption: "Your smile is so precious to me I'd be kissing you like that all the time if it made you smile all the time ❤️",
    date: "2025-12-21",
    location: "Čajovna",
    tags: ["tea", "selfie", "kiss"]
  },
  {
    src: "./assets/photos/photo-12.jpg",
    alt: "Bouquet of roses placed on a city sidewalk at night.",
    caption: "Even all the flowers in the world are nowhere near as pretty as you.",
    date: "2025-12-21",
    location: "City street",
    tags: ["flowers", "night", "outdoor"]
  },
  {
    src: "./assets/photos/photo-13.jpg",
    alt: "Francis.",
    caption: "Francis.",
    date: "2024-09-03",
    location: "Francis",
    tags: ["pet", "art"]
  },
  {
    src: "./assets/photos/photo-14.jpg",
    alt: "Close-up of an our eyes.",
    caption: "I could be staring into yours all the time but I'm scared I'd stare them out.",
    date: "2024-09-20",
    location: "At home",
    tags: ["close-up", "portrait"]
  },
  {
    src: "./assets/photos/photo-15.jpg",
    alt: "UwU bunny with kitten.",
    caption: "I'm the bunny and you're the kitten.",
    date: "2025-05-03",
    location: "Sticker",
    tags: ["art", "pet"]
  }
]);

const pad2 = (n) => String(n).padStart(2, "0");

export function formatDateDisplay(dateObj) {
  return `${pad2(dateObj.day)}.${pad2(dateObj.month)}.${dateObj.year}`;
}
