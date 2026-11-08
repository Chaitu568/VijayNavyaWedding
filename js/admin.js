/* Admin dashboard — sign in via Supabase Auth, view RSVP analytics */
(function () {
  "use strict";

  var db = null;
  if (SUPABASE_URL.indexOf("YOUR_PROJECT_REF") === -1 && window.supabase) {
    db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function fmtDate(iso) {
    return new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
  function yesno(b) { return b ? "✓" : "—"; }

  /* ---------- Auth ---------- */
  document.getElementById("login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!db) return alert("Supabase is not configured yet — edit js/config.js first.");
    var btn = document.getElementById("login-btn");
    btn.disabled = true; btn.textContent = "Signing in…";
    db.auth.signInWithPassword({
      email: document.getElementById("a-email").value.trim(),
      password: document.getElementById("a-pass").value,
    }).then(function (res) {
      btn.disabled = false; btn.textContent = "Sign in";
      if (res.error) { alert("Sign-in failed: " + res.error.message); return; }
      showDash();
    });
  });

  document.getElementById("logout-btn").addEventListener("click", function () {
    db.auth.signOut().then(function () { location.reload(); });
  });

  function showDash() {
    document.getElementById("login-box").style.display = "none";
    document.getElementById("dash").style.display = "block";
    loadAll();
  }

  /* ---------- Data ---------- */
  function loadAll() {
    db.from("rsvps").select("*").order("created_at", { ascending: false }).then(function (res) {
      var rsvps = res.data || [];
      if (res.error) console.warn(res.error);
      renderStats(rsvps);
      renderRsvps(rsvps);
    });
  }

  function renderStats(rsvps) {
    var attending = rsvps.filter(function (r) {
      return r.attending_pelli || r.attending_mehendi || r.attending_haldi || r.attending_ceremony;
    });
    var cards = [
      [rsvps.length, "Total responses"],
      [attending.length, "Families attending"],
      [sum(rsvps, "attending_pelli"), "Pelli guests"],
      [sum(rsvps, "attending_mehendi"), "Mehendi guests"],
      [sum(rsvps, "attending_haldi"), "Haldi guests"],
      [sum(rsvps, "attending_ceremony"), "Wedding guests"],
    ];
    document.getElementById("stats").innerHTML = cards.map(function (c) {
      return '<div class="stat"><b>' + c[0] + "</b><span>" + c[1] + "</span></div>";
    }).join("");
  }

  function sum(rows, flag) {
    return rows.reduce(function (a, r) { return a + (r[flag] ? r.headcount : 0); }, 0);
  }

  function renderRsvps(rsvps) {
    var tb = document.querySelector("#rsvp-table tbody");
    if (!rsvps.length) { tb.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--muted)">No responses yet.</td></tr>'; return; }
    tb.innerHTML = rsvps.map(function (r) {
      return "<tr><td>" + fmtDate(r.created_at) + "</td><td>" + esc(r.name) + "</td><td>" + esc(r.phone) +
        "</td><td>" + yesno(r.attending_pelli) + "</td><td>" + yesno(r.attending_mehendi) +
        "</td><td>" + yesno(r.attending_haldi) + "</td><td>" + yesno(r.attending_ceremony) +
        "</td><td>" + r.headcount + "</td><td>" + esc(r.message || "—") + "</td></tr>";
    }).join("");
  }

  /* ---------- Resume session ---------- */
  if (db) {
    db.auth.getSession().then(function (res) {
      if (res.data && res.data.session) showDash();
    });
  }
})();
