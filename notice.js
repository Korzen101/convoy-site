/*
  The maintenance notice, on the website too (2026-10-06, the eighth of the
  eight Admin suggestions). While Admin → App control has it up, every page
  here shows the same words the app shows across its top; when it comes down,
  so does this.

  Asked of the account-deletion function, which reads that one row of
  app_config and nothing else, so no key lives in the site. Sent as plain text
  so the browser does not first ask permission (one request, not two), and
  kept two minutes per tab so reading the site is not a request per page.
  When the function does not answer, nothing shows.
*/
(function () {
  if (window.top !== window.self) return;
  var API = 'https://tmhditmqlunnebzullwt.supabase.co/functions/v1/account-deletion';
  var KEY = 'convoy-notice';
  var KEEP = 2 * 60 * 1000;

  function line(cls, text) {
    var p = document.createElement('p');
    p.className = cls;
    p.textContent = text;
    return p;
  }

  function show(m) {
    if (!m || !m.title) return;
    var main = document.getElementById('main');
    if (!main || document.getElementById('notice')) return;
    var box = document.createElement('aside');
    box.id = 'notice';
    box.className = 'notice';
    box.setAttribute('role', 'status');
    box.appendChild(line('notice-kicker', 'Convoy status'));
    box.appendChild(line('notice-title', m.title));
    if (m.message) box.appendChild(line('notice-body', m.message));
    main.insertBefore(box, main.firstChild);
  }

  var kept = null;
  try { kept = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (e) {}
  if (kept && typeof kept.at === 'number' && Date.now() - kept.at < KEEP) {
    show(kept.maintenance);
    return;
  }
  fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ action: 'notice' }) })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) {
      if (!d) return;
      try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), maintenance: d.maintenance || null })); } catch (e) {}
      show(d.maintenance);
    })
    .catch(function () {});
})();
