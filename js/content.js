/* ============================================================
   EDIT THIS FILE to personalise the invite.
   Replace every TODO placeholder with the real wedding details.
   No other file needs to change for content updates.
   ============================================================ */

const WEDDING = {
  groom: {
    name: "Vijay",
    fullName: "Vijay Maddineni",
    parents: "Son of Mr. & Mrs. Maddineni", // TODO: parents' names
  },
  bride: {
    name: "Navya",
    fullName: "Navya Bharathi Bikki",
    parents: "Daughter of Mr. & Mrs. Bikki", // TODO: parents' first names (not on Vijay's site)
  },

  blessing: "॥ Shri Ganeshaya Namah ॥",

  // Ceremony start in ISO format WITH timezone offset — drives the countdown.
  dateISO: "2026-12-23T10:21:00-06:00", // Wedding muhurtham, Dallas time (CST)
  dateLine: "Wednesday, 23rd December 2026",
  venueLine: "McKinney, Texas", // main venue line, shown on the cover

  tagline: "Two families, many blessings, one timeless celebration.",

  story: [
    "What began as a simple hello turned into endless conversations, shared dreams, and a friendship that quietly became love.",
    "Now, with the blessings of their parents and the love of everyone around them, Vijay and Navya are beginning their forever — and they want you there to witness it.",
  ],

  // The wedding journey — one card per function, in order.
  // Details match Vijay's own event list (McKinney, Texas).
  events: [
    {
      id: "pelli",
      title: "Pelli Koduku & Pelli Kuthuru",
      date: "Sunday, 20th December 2026",
      time: "3:00 PM & 5:00 PM",
      when: "Sun, Dec 20 · 3:00 PM & 5:00 PM",
      venue: "McKinney, TX",
      address: "",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=McKinney%2C%20TX",
      note: "Pelli Koduku (3 PM) and Pelli Kuthuru (5 PM).",
    },
    {
      id: "mehendi",
      title: "Mehendi",
      date: "Monday, 21st December 2026",
      time: "4:00 PM onwards",
      when: "Mon, Dec 21 · 4:00 PM",
      venue: "5931 County Rd 471",
      address: "McKinney, TX 75071",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=5931%20County%20Rd%20471%2C%20McKinney%2C%20TX%2075071",
      note: "Mehendi celebration.",
    },
    {
      id: "haldi",
      title: "Haldi",
      date: "Tuesday, 22nd December 2026",
      time: "10:00 AM onwards",
      when: "Tue, Dec 22 · 10:00 AM",
      venue: "5931 County Rd 471",
      address: "McKinney, TX 75071",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=5931%20County%20Rd%20471%2C%20McKinney%2C%20TX%2075071",
      note: "Haldi celebration.",
    },
    {
      id: "wedding",
      title: "Wedding",
      date: "Wednesday, 23rd December 2026",
      time: "Muhurtham 10:21 AM",
      when: "Wed, Dec 23 · Muhurtham 10:21 AM",
      venue: "4253 County Rd 412",
      address: "McKinney, TX 75071",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=4253%20County%20Rd%20412%2C%20McKinney%2C%20TX%2075071",
      note: "Wedding ceremony. Muhurtham at 10:21 AM, followed by lunch.",
    },
  ],

  contact: {
    label: "Questions? Email us",
    phone: "vijay.maddineni17@gmail.com",
  },

  footerBlessing: "With love and blessings, from both families",

  // ---------- Media ----------
  // Portrait photos for "The Couple" cards.
  // Add image paths/URLs, e.g. "photos/groom.jpg". Empty = monogram placeholders.
  couplePhotos: { groom: "", bride: "" },

  // Background music for the floating sound button.
  // Ships with the site as assets/music.mp3 — to change the song,
  // just replace that file (keep the same name). Empty hides the button.
  // Music starts when the guest taps "Open Invitation".
  musicUrl: "assets/music.mp3",

  // YouTube video (invite film / teaser). Full watch URL when ready.
  // Empty hides the video section until then.
  youtubeUrl: "",
};
