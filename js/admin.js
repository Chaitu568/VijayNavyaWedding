/* Admin dashboard — sign in via Supabase Auth, view RSVP analytics, moderate wishes */
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
    Promise.all([
      db.from("rsvps").select("*").order("created_at", { ascending: false }),
      db.from("wishes").select("*").order("created_at", { ascending: false }),
    ]).then(function (results) {
      var rsvps = (results[0].data) || [];
      var wishes = (results[1].data) || [];
      if (results[0].error) console.warn(results[0].error);
      if (results[1].error) console.warn(results[1].error);
      renderStats(rsvps);
      renderRsvps(rsvps);
      renderWishes(wishes);
    });
  }

  function renderStats(rsvps) {
    var attending = rsvps.filter(function (r) { return r.attending_ceremony || r.attending_reception; });
    var ceremonyGuests = sum(rsvps, "attending_ceremony");
    var receptionGuests = sum(rsvps, "attending_reception");
    var veg = 0, nonveg = 0;
    attending.forEach(function (r) { if (r.meal_pref === "non-veg") nonveg += r.headcount; else veg += r.headcount; });

    var cards = [
      [rsvps.length, "Total responses"],
      [attending.length, "Families attending"],
      [ceremonyGuests, "Ceremony guests"],
      [receptionGuests, "Reception guests"],
      [veg, "Veg meals"],
      [nonveg, "Non-veg meals"],
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
    if (!rsvps.length) { tb.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted)">No responses yet.</td></tr>'; return; }
    tb.innerHTML = rsvps.map(function (r) {
      return "<tr><td>" + fmtDate(r.created_at) + "</td><td>" + esc(r.name) + "</td><td>" + esc(r.phone) +
        "</td><td>" + yesno(r.attending_ceremony) + "</td><td>" + yesno(r.attending_reception) +
        "</td><td>" + r.headcount + "</td><td>" + esc(r.meal_pref) + "</td><td>" + esc(r.message || "—") + "</td></tr>";
    }).join("");
  }

  function renderWishes(wishes) {
    var pending = wishes.filter(function (w) { return !w.approved; });
    document.getElementById("pending-count").textContent = pending.length ? "(" + pending.length + " pending)" : "";
    var tb = document.querySelector("#wish-table tbody");
    if (!wishes.length) { tb.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted)">No wishes yet.</td></tr>'; return; }
    tb.innerHTML = wishes.map(function (w) {
      var actions = w.approved
        ? '<button class="mini-btn danger" data-del="' + w.id + '">Delete</button>'
        : '<button class="mini-btn" data-approve="' + w.id + '">Approve</button>' +
          '<button class="mini-btn danger" data-del="' + w.id + '">Delete</button>';
      return "<tr><td>" + fmtDate(w.created_at) + "</td><td>" + esc(w.name) + "</td><td>" + esc(w.message) +
        "</td><td>" + (w.approved ? "✓ live" : "pending") + "</td><td>" + actions + "</td></tr>";
    }).join("");

    tb.querySelectorAll("[data-approve]").forEach(function (btn) {
      btn.addEventListener("click", function () { moderate(btn.getAttribute("data-approve"), { approved: true }); });
    });
    tb.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (confirm("Delete this wish?")) moderate(btn.getAttribute("data-del"), null, true);
      });
    });
  }

  function moderate(id, patch, del) {
    var q = del ? db.from("wishes").delete().eq("id", id) : db.from("wishes").update(patch).eq("id", id);
    q.then(function (res) {
      if (res.error) { alert("Failed: " + res.error.message); return; }
      loadAll();
    });
  }

  /* ---------- Resume session ---------- */
  if (db) {
    db.auth.getSession().then(function (res) {
      if (res.data && res.data.session) showDash();
    });
  }
})();
