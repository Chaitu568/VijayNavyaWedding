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

    // Journey — event blocks joined by a little footprint trail
    var blocks = WEDDING.events.map(function (e) {
      return '<div class="journey-item reveal"><div class="journey-card">' +
        '<div class="event-icon">' + iconFor(e.id) + "</div>" +
        "<h3>" + esc(e.title) + "</h3>" +
        '<div class="event-meta"><b>' + esc(e.date) + "</b> · " + esc(e.time) + "</div>" +
        '<div class="event-meta">' + esc(e.venue) + "<br/>" + esc(e.address) + "</div>" +
        (e.note ? '<div class="event-note">' + esc(e.note) + "</div>" : "") +
        '<a class="map-btn" target="_blank" rel="noopener" href="' + esc(e.mapUrl) + '">📍 View Map</a>' +
        "</div></div>";
    });
    setHTML("journey-list", blocks.join(TRAIL_HTML));

    // RSVP — one compact Yes/No row per celebration
    setHTML("rsvp-events", WEDDING.events.map(function (e) {
      return '<div class="att-row"><div class="att-info"><b>' + esc(e.title) + "</b><span>" + esc(e.when) + "</span></div>" +
        '<div class="seg">' +
        '<label><input type="radio" name="att_' + e.id + '" value="yes" checked /><span>Yes</span></label>' +
        '<label><input type="radio" name="att_' + e.id + '" value="no" /><span>No</span></label>' +
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

  /* ---------- Event icons (original line-art, stroke style) ---------- */
  function iconFor(id) {
    var P = {
      mehendi: '<circle cx="24" cy="13" r="4.6"/><circle cx="34.5" cy="18.5" r="4.6"/><circle cx="34.5" cy="29.5" r="4.6"/><circle cx="24" cy="35" r="4.6"/><circle cx="13.5" cy="29.5" r="4.6"/><circle cx="13.5" cy="18.5" r="4.6"/><circle cx="24" cy="24" r="3.4" fill="currentColor" stroke="none"/>',
      haldi: '<circle cx="24" cy="24" r="7.5"/><path d="M24 8v5M24 35v5M8 24h5M35 24h5M12.7 12.7l3.5 3.5M31.8 31.8l3.5 3.5M35.3 12.7l-3.5 3.5M16.2 31.8l-3.5 3.5"/>',
      ceremony: '<path d="M24 6v4"/><path d="M24 10a9.5 9.5 0 0 1 9.5 9.5c0 5.2 2 7.3 3.2 8.5H11.3c1.2-1.2 3.2-3.3 3.2-8.5A9.5 9.5 0 0 1 24 10z"/><circle cx="24" cy="33.5" r="2.6"/><path d="M18 42h12"/>',
      reception: '<path d="M24 5l4.2 14.8L43 24l-14.8 4.2L24 43l-4.2-14.8L5 24l14.8-4.2z"/>',
      wedding: '<path d="M24 6v4"/><path d="M24 10a9.5 9.5 0 0 1 9.5 9.5c0 5.2 2 7.3 3.2 8.5H11.3c1.2-1.2 3.2-3.3 3.2-8.5A9.5 9.5 0 0 1 24 10z"/><circle cx="24" cy="33.5" r="2.6"/><path d="M18 42h12"/>',
      pelli: '<path d="M24 38c-10-6-12.5-15.5-5-23.5C24 17.5 28 17.5 29 14.5 41.5 22 35 32 24 38z"/><path d="M10 40c4 2.5 9 3.5 14 3.5S34 42.5 38 40"/>'
    };
    var inner = P[id] || '<path d="M24 36c-9-5.5-11-14-4.5-21C24 18 28 18 28.5 15 39 22 33 30.5 24 36z"/>';
    return '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + "</svg>";
  }

  /* ---------- Footprint trail (original shapes) ---------- */
  function foot(cls) {
    return '<svg class="' + cls + '" viewBox="0 0 24 36" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="23" rx="6.4" ry="9.2"/><circle cx="5.2" cy="8.6" r="2"/><circle cx="9.6" cy="6" r="2.4"/><circle cx="14.2" cy="6" r="2.2"/><circle cx="18.4" cy="8.6" r="1.7"/></svg>';
  }
  var TRAIL_HTML = '<div class="trail" aria-hidden="true">' + foot("step s1") + foot("step s2") + foot("step s3") + "</div>";

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
        audio.play().catch(function () { /* music unavailable — stay silent */ });
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
    // Icon state follows the audio element's real state, not click bookkeeping
    function syncIcon() { btn.classList.toggle("muted", audio.paused); }
    audio.addEventListener("play", syncIcon);
    audio.addEventListener("pause", syncIcon);
    audio.addEventListener("error", function () { btn.classList.add("muted"); });
    btn.addEventListener("click", function () {
      if (audio.paused) audio.play().catch(function () {});
      else audio.pause();
      setTimeout(syncIcon, 100);
      setTimeout(syncIcon, 450);
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

  function rsvpStatus(msg) {
    var s = document.getElementById("rsvp-status");
    if (!s) return;
    s.textContent = msg;
    s.classList.add("show");
  }

  function bindRsvp() {
    var form = document.getElementById("rsvp-form");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var name = val("r-name").trim(), phone = val("r-phone").trim();
      if (!name) return nudge("r-name", "Please tell us your name.");
      if (!/^[+\d][\d\s\-()]{6,18}$/.test(phone)) return nudge("r-phone", "Please enter a valid phone number.");
      if (!db) return rsvpStatus("Online RSVP isn't switched on yet — please check back soon, or reach us at the email below.");

      var btn = document.getElementById("rsvp-submit");
      btn.disabled = true; btn.textContent = "Sending…";

      db.from("rsvps").insert({
        name: name,
        phone: phone,
        attending_pelli: radio("att_pelli") === "yes",
        attending_mehendi: radio("att_mehendi") === "yes",
        attending_haldi: radio("att_haldi") === "yes",
        attending_ceremony: radio("att_wedding") === "yes",
        headcount: Math.min(20, Math.max(1, parseInt(val("r-headcount"), 10) || 1)),
        message: val("r-notes").trim() || null,
      }).then(function (res) {
        btn.disabled = false; btn.textContent = "Send RSVP";
        if (res.error) { rsvpStatus("Something went wrong saving your RSVP — please try again."); return; }
        form.querySelectorAll(".field, #rsvp-submit, .form-note").forEach(function (el) { el.style.display = "none"; });
        document.getElementById("rsvp-ok").classList.add("show");
      }).catch(function () {
        btn.disabled = false; btn.textContent = "Send RSVP";
        rsvpStatus("Something went wrong saving your RSVP — please try again.");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    bindCover();
    bindRsvp();
  });
})();
