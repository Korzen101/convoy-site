/*
  convoy.korzengroup.com/delete/ — asking for an account to be deleted by
  somebody who can no longer sign in (2026-10-04). Two steps against the
  account-deletion Edge Function: the username or recovery email, which sends
  a code to the account's verified recovery email; then the code, which puts
  the request in front of a person. Nothing is deleted here or by the function:
  the owner deletes the account from Admin, within 30 days.

  The function answers the first step the same way whether or not an account
  exists, so this page cannot be used to find out who is on Convoy.

  Its own file, so the page's policy can run its own scripts only.
*/
(function () {
  if (window.top !== window.self) {
    try { window.top.location.replace(window.location.href); } catch (e) {}
    return;
  }
  var API = 'https://tmhditmqlunnebzullwt.supabase.co/functions/v1/account-deletion';
  var $ = function (id) { return document.getElementById(id); };
  var request = '';

  function post(body) {
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (data) { return { status: r.status, data: data }; }); })
      .catch(function () { return { status: 0, data: { error: 'Could not reach Convoy. Check your connection and try again.' } }; });
  }

  $('ask').addEventListener('submit', function (e) {
    e.preventDefault();
    var identifier = $('who').value.trim();
    var note = $('ask-note');
    note.className = 'note';
    if (identifier.length < 2) { note.className = 'note error'; note.textContent = 'Enter your Convoy username, or the recovery email on the account.'; return; }
    var btn = $('ask-send');
    btn.disabled = true;
    note.textContent = 'Sending…';
    post({ action: 'request', identifier: identifier }).then(function (res) {
      btn.disabled = false;
      if (res.status !== 200 || !res.data.request) {
        note.className = 'note error';
        note.textContent = res.data.error || 'That did not work. Wait a minute and try again.';
        return;
      }
      request = res.data.request;
      note.textContent = '';
      $('ask').hidden = true;
      $('confirm').hidden = false;
      $('confirm-note').textContent = res.data.message + ' The code works for ' + (res.data.minutes || 15) + ' minutes.';
      $('code').value = '';
      $('code').focus();
    });
  });

  $('confirm').addEventListener('submit', function (e) {
    e.preventDefault();
    var code = $('code').value.replace(/\D/g, '');
    var err = $('confirm-error');
    if (code.length !== 6) { err.textContent = 'The code is six digits.'; return; }
    var btn = $('confirm-send');
    btn.disabled = true;
    err.textContent = '';
    post({ action: 'confirm', request: request, code: code }).then(function (res) {
      btn.disabled = false;
      if (res.status !== 200) { err.textContent = res.data.error || 'That did not work. Try again.'; return; }
      $('confirm').hidden = true;
      $('done').hidden = false;
      $('done-note').textContent = res.data.message;
    });
  });

  $('restart').addEventListener('click', function () {
    request = '';
    $('confirm').hidden = true;
    $('ask').hidden = false;
    $('confirm-error').textContent = '';
    $('who').focus();
  });
})();
