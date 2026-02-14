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
  rememberUnlockInSession: true
});

export const GALLERY_ITEMS = Object.freeze([
  {
  src: "./assets/photos/photo-01.jpg",
  alt: "Photo with both of us and my family.",
  caption: "My family around us, but my eyes were still looking at you."
  },
  {
  src: "./assets/photos/photo-02.jpg",
  alt: "Night street selfie with us kissing and parked cars in the background.",
  caption: "Cold streets, but you warmed me up with your presence (and kiss 👉👈)."
  },
  {
  src: "./assets/photos/photo-03.jpg",
  alt: "Close-up selfie of both of us.",
  caption: "Being able to be myself with you is the best feeling in the world."
  },
  {
  src: "./assets/photos/photo-04.jpg",
  alt: "Photo of both of us in front of ZHROMAŽDIŠTE.",
  caption: "ZHROMAŽDIŠTE!! (Gathering place for all my favorite things, meaning you.)"
  },
  {
  src: "./assets/photos/photo-05.jpg",
  alt: "Night selfie of both of us waiting for concert at the wrong entrance.",
  caption: "Even though we've waited at the wrong entrance, I wouldn't trade a moment of it for anything."
  },
  {
  src: "./assets/photos/photo-06.jpg",
  alt: "Selfie of us already at the concert venue.",
  caption: "I'm so glad I could have attended the concert with YOU."
  },
  {
  src: "./assets/photos/photo-07.jpg",
  alt: "Close-up selfie of both of us.",
  caption: "I love your hair, I could play with it all day."
  },
  {
  src: "./assets/photos/photo-08.jpg",
  alt: "Extreme close-up selfie focused on your glasses.",
  caption: "Even our weirdest angles are my favorite memories."
  },
  {
  src: "./assets/photos/photo-09.jpg",
  alt: "Mirror photo of both of us after the concert in our concert outfits.",
  caption: "Us tired and happy after the concert, I miss holding you like that."
  },
  {
  src: "./assets/photos/photo-10.jpg",
  alt: "Warm-toned close selfie of both of us in čajovna.",
  caption: "Going to čajovna with you and just talking is one of my most favorite activities."
  },
  {
  src: "./assets/photos/photo-11.jpg",
  alt: "Dimly lit close selfie of both of us in čajovna.",
  caption: "Your smile is so precious to me I'd be kissing you like that all the time if it made you smile all the time ❤️"
  },
  {
  src: "./assets/photos/photo-12.jpg",
  alt: "Bouquet of roses placed on a city sidewalk at night.",
  caption: "Even all the flowers in the world are nowhere near as pretty as you."
  },
  {
  src: "./assets/photos/photo-13.jpg",
  alt: "Francis.",
  caption: "Francis."
  },
  {
  src: "./assets/photos/photo-14.jpg",
  alt: "Close-up of an our eyes.",
  caption: "I could be staring into yours all the time but I'm scared I'd stare them out."
  },
  {
  src: "./assets/photos/photo-15.jpg",
  alt: "UwU bunny with kitten.",
  caption: "I'm the bunny and you're the kitten."
  }
]);

const pad2 = (n) => String(n).padStart(2, "0");

export function formatDateDisplay(dateObj) {
  return `${pad2(dateObj.day)}.${pad2(dateObj.month)}.${dateObj.year}`;
}
