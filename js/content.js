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
    fullName: "Navya",
    parents: "Daughter of Mr. & Mrs. …", // TODO: bride's family name + parents
  },

  blessing: "॥ Shri Ganeshaya Namah ॥",

  // Ceremony start in ISO format WITH timezone offset — drives the countdown.
  dateISO: "2026-12-20T10:00:00+05:30", // TODO: real date & time
  dateLine: "Sunday, 20th December 2026", // TODO
  venueLine: "Venue Name, City", // TODO: main venue, shown on the cover

  tagline: "Two families, many blessings, one timeless celebration.",

  story: [
    "What began as a simple hello turned into endless conversations, shared dreams, and a friendship that quietly became love.",
    "Now, with the blessings of their parents and the love of everyone around them, Vijay and Navya are beginning their forever — and they want you there to witness it.",
  ],

  // The wedding journey — one card per function, in order.
  // mapUrl: paste the Google Maps share link for each venue.
  events: [
    {
      id: "mehendi",
      title: "Mehendi",
      date: "Date — TODO",
      time: "5:00 PM onwards",
      venue: "Venue Name",
      address: "Venue address, City",
      mapUrl: "https://maps.google.com/?q=Hyderabad",
      note: "An evening of colour, music and henna.",
    },
    {
      id: "haldi",
      title: "Haldi & Sangeet",
      date: "Date — TODO",
      time: "10:00 AM onwards",
      venue: "Venue Name",
      address: "Venue address, City",
      mapUrl: "https://maps.google.com/?q=Hyderabad",
      note: "Turmeric, laughter, and a night of dance.",
    },
    {
      id: "ceremony",
      title: "Wedding Ceremony",
      date: "Date — TODO",
      time: "Muhurtham — TODO",
      venue: "Venue Name",
      address: "Venue address, City",
      mapUrl: "https://maps.google.com/?q=Hyderabad",
      note: "The sacred ceremony, followed by lunch.",
    },
    {
      id: "reception",
      title: "Reception",
      date: "Date — TODO",
      time: "6:30 PM onwards",
      venue: "Venue Name",
      address: "Venue address, City",
      mapUrl: "https://maps.google.com/?q=Hyderabad",
      note: "Dinner and celebrations with family and friends.",
    },
  ],

  contact: {
    label: "Questions? Call the family",
    phone: "+91 00000 00000", // TODO
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
