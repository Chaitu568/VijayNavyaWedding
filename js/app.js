/* Wedding invite — rendering + Supabase wiring (public site, v2) */
(function () {
  "use strict";

  var db = null;
  var dbReady = SUPABASE_URL.indexOf("YOUR_PROJECT_REF") === -1;
  if (dbReady && window.supabase) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } else {
    console.warn("Supabase not configured yet — edit js/config.js");
  }

  var audio = null;

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function setText(id, text) { var el = document.getElementById(id); if (el) el.textContent = text; }
  function setHTML(id, html) { var el = document.getElementById(id); if (el) el.innerHTML = html; }

  /* ---------- Render ---------- */
  function render() {
    var g = WEDDING.groom, b = WEDDING.bride;

    document.title = g.name + " & " + b.name + " — Wedding Invitation";

    // Cover
    setText("cover-blessing", WEDDING.blessing);
    setText("cover-groom", g.name);
    setText("cover-bride", b.name);
    setText("cover-date", WEDDING.dateLine);
    setText("cover-venue", WEDDING.venueLine);
    var guest = new URLSearchParams(location.search).get("to");
    setText("cover-guest", guest ? guest : "Guest");

    // Nav + hero
    setHTML("nav-brand", esc(g.name.charAt(0)) + ' <span class="amp">&amp;</span> ' + esc(b.name.charAt(0)));
    setText("hero-groom", g.name);
    setText("hero-bride", b.name);
    setText("hero-date", WEDDING.dateLine);
    setText("hero-tagline", WEDDING.tagline);

    // Couple
    setText("couple-tagline", WEDDING.tagline);
    setText("groom-full", g.fullName);
    setText("groom-parents", g.parents);
    setText("bride-full", b.fullName);
    setText("bride-parents", b.parents);
    setPhoto("groom-photo", WEDDING.couplePhotos.groom, g.name);
    setPhoto("bride-photo", WEDDING.couplePhotos.bride, b.name);

    setHTML("story-body", WEDDING.story.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join(""));

    // Journey
    setHTML("journey-list", WEDDING.events.map(function (e) {
      return '<div class="journey-item reveal"><div class="journey-card">' +
        "<h3>" + esc(e.title) + "</h3>" +
        '<div class="event-meta"><b>' + esc(e.date) + "</b> · " + esc(e.time) + "</div>" +
        '<div class="event-meta">' + esc(e.venue) + "<br/>" + esc(e.address) + "</div>" +
        (e.note ? '<div class="event-note">' + esc(e.note) + "</div>" : "") +
        '<a class="map-btn" target="_blank" rel="noopener" href="' + esc(e.mapUrl) + '">📍 View Map</a>' +
        "</div></div>";
    }).join(""));

    // Footer
    setText("foot-groom", g.name);
    setText("foot-bride", b.name);
    setText("foot-blessing", WEDDING.footerBlessing);
    setText("foot-contact", WEDDING.contact.label + ": " + WEDDING.contact.phone);

    renderVideo();
    initSound();
    observeReveals();
    startCountdown();
  }

  function setPhoto(id, src, name) {
    var el = document.getElementById(id);
    if (!el) return;
    if (src) el.innerHTML = '<img src="' + esc(src) + '" alt="' + esc(name) + '" />';
    else el.innerHTML = "<span>" + esc(name.charAt(0)) + "</span>";
  }

  /* ---------- Cover open ---------- */
  function bindCover() {
    document.getElementById("open-invite").addEventListener("click", function () {
      document.getElementById("cover").classList.add("opened");
      document.body.classList.remove("locked");
      // Music starts on this tap (browsers block autoplay before interaction)
      if (audio && audio.paused) {
        audio.play().then(function () {
          document.getElementById("sound-toggle").textContent = "🔊";
        }).catch(function () { /* music file missing — stay silent */ });
      }
      window.scrollTo(0, 0);
    });
  }

  /* ---------- Countdown ---------- */
  function startCountdown() {
    var target = new Date(WEDDING.dateISO).getTime();
    var d = document.getElementById("cd-days"), h = document.getElementById("cd-hours"),
        m = document.getElementById("cd-mins"), s = document.getElementById("cd-secs");
    function tick() {
      var diff = Math.max(0, target - Date.now());
      d.textContent = Math.floor(diff / 864e5);
      h.textContent = String(Math.floor(diff / 36e5) % 24).padStart(2, "0");
      m.textContent = String(Math.floor(diff / 6e4) % 60).padStart(2, "0");
      s.textContent = String(Math.floor(diff / 1e3) % 60).padStart(2, "0");
    }
    tick(); setInterval(tick, 1000);
  }

  /* ---------- Reveal on scroll ---------- */
  function observeReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { obs.observe(el); });
  }

  /* ---------- YouTube ---------- */
  function renderVideo() {
    var url = (WEDDING.youtubeUrl || "").trim();
    if (!url) return;
    var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if (!m) return;
    document.getElementById("video").style.display = "";
    setHTML("video-wrap",
      '<iframe src="https://www.youtube.com/embed/' + m[1] + '" title="Wedding video" frameborder="0" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>');
  }

  /* ---------- Music ---------- */
  function initSound() {
    var url = (WEDDING.musicUrl || "").trim();
    if (!url) return;
    audio = new Audio(url);
    audio.loop = true;
    audio.preload = "none";
    var btn = document.getElementById("sound-toggle");
    btn.style.display = "";
    btn.addEventListener("click", function () {
      if (audio.paused) {
        audio.play().then(function () { btn.textContent = "🔊"; }).catch(function () {});
      } else {
        audio.pause();
        btn.textContent = "🔇";
      }
    });
  }

  /* ---------- RSVP ---------- */
  function val(id) { return document.getElementById(id).value; }
  function radio(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }
  function nudge(id, msg) {
    var el = document.getElementById(id);
    el.focus(); el.style.borderColor = "#a33"; alert(msg);
    el.addEventListener("input", function h() { el.style.borderColor = ""; el.removeEventListener("input", h); });
  }

  function bindRsvp() {
    var form = document.getElementById("rsvp-form");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = val("r-name").trim(), phone = val("r-phone").trim();
      if (!name) return nudge("r-name", "Please tell us your name.");
      if (!/^[+\d][\d\s\-()]{6,18}$/.test(phone)) return nudge("r-phone", "Please enter a valid phone number.");
      if (!db) return alert("RSVP is not connected yet — please try again later.");

      var btn = document.getElementById("rsvp-submit");
      btn.disabled = true; btn.textContent = "Sending…";

      db.from("rsvps").insert({
        name: name,
        phone: phone,
        attending_ceremony: radio("ceremony") === "yes",
        attending_reception: radio("reception") === "yes",
        headcount: Math.min(20, Math.max(1, parseInt(val("r-headcount"), 10) || 1)),
        meal_pref: radio("meal"),
        dietary_notes: null,
        message: val("r-notes").trim() || null,
      }).then(function (res) {
        btn.disabled = false; btn.textContent = "Send RSVP";
        if (res.error) { alert("Something went wrong saving your RSVP. Please try again."); return; }
        form.querySelectorAll(".field, #rsvp-submit, .form-note").forEach(function (el) { el.style.display = "none"; });
        document.getElementById("rsvp-ok").classList.add("show");
      });
    });
  }

  /* ---------- Wishes ---------- */
  function bindWishes() {
    loadWishes();
    document.getElementById("wish-form").addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = val("w-name").trim(), msg = val("w-msg").trim();
      if (!name) return nudge("w-name", "Please tell us your name.");
      if (!msg) return nudge("w-msg", "Please write your wish.");
      if (!db) return alert("Wishes are not connected yet — please try again later.");

      var btn = document.getElementById("wish-submit");
      btn.disabled = true; btn.textContent = "Sharing…";

      db.from("wishes").insert({ name: name, message: msg }).then(function (res) {
        btn.disabled = false; btn.textContent = "Share Wish";
        if (res.error) { alert("Something went wrong. Please try again."); return; }
        ev.target.querySelectorAll(".field, #wish-submit, .form-note").forEach(function (el) { el.style.display = "none"; });
        document.getElementById("wish-ok").classList.add("show");
      });
    });
  }

  function loadWishes() {
    var list = document.getElementById("wishes-list");
    if (!db) { list.innerHTML = '<div class="wishes-empty">Wishes will appear here soon.</div>'; return; }
    db.from("wishes").select("name,message,created_at")
      .eq("approved", true).order("created_at", { ascending: false }).limit(100)
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) {
          list.innerHTML = '<div class="wishes-empty">Be the first to leave a blessing ♡</div>';
          return;
        }
        list.innerHTML = res.data.map(function (w) {
          return '<div class="wish"><p>“' + esc(w.message) + '”</p><div class="who">— ' + esc(w.name) + "</div></div>";
        }).join("");
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    bindCover();
    bindRsvp();
    bindWishes();
  });
})();
