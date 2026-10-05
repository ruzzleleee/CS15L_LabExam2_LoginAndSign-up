(function () {
  'use strict';

  var loginScreen = document.getElementById('login-screen');
  var signupScreen = document.getElementById('signup-screen');
  var loginForm = document.getElementById('login-form');
  var signupForm = document.getElementById('signup-form');
  var loginConfirm = document.getElementById('login-confirm');
  var signupConfirm = document.getElementById('signup-confirm-box');
  var password = document.getElementById('signup-password');
  var confirmPassword = document.getElementById('signup-confirm');

  /* ----- Switch between Login and Sign up ("Sign up" / "Login" links) ----- */
  document.querySelectorAll('[data-go]').forEach(function (link) {
    link.addEventListener('click', function () {
      var showSignup = link.getAttribute('data-go') === 'signup-screen';
      signupScreen.hidden = !showSignup;
      loginScreen.hidden = showSignup;
    });
  });

  /* ----- Eye icon: show / hide the password ----- */
  document.querySelectorAll('.eye').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.getAttribute('data-target'));
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });

  /* ----- Sign-up: the two watchwords must match ----- */
  function checkMatch() {
    confirmPassword.setCustomValidity(
      confirmPassword.value && confirmPassword.value !== password.value
        ? 'The watchwords do not match.'
        : ''
    );
  }
  password.addEventListener('input', checkMatch);
  confirmPassword.addEventListener('input', checkMatch);

  /* ----- Send the form to PHP; on success show the matching confirmation box.
     Errors reuse the browser's built-in validation bubble, so no design change. ----- */
  var csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  function submitToPhp(form, url, confirmBox) {
    fetch(url, {
      method: 'POST',
      headers: { 'X-CSRF-Token': csrfToken },
      body: new FormData(form),
      credentials: 'same-origin'
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.ok) {
          confirmBox.hidden = false;
          confirmBox.querySelector('.close').focus();
          return;
        }
        var target = (data.field && document.getElementById(data.field)) ||
                     form.querySelector('input');
        target.setCustomValidity(data.message || 'Something went amiss.');
        target.reportValidity();
        target.addEventListener('input', function clear() {
          target.setCustomValidity('');
          if (target === confirmPassword) checkMatch();
          target.removeEventListener('input', clear);
        });
      })
      .catch(function () {
        var first = form.querySelector('input');
        first.setCustomValidity('Could not reach the server.');
        first.reportValidity();
        first.addEventListener('input', function clear() {
          first.setCustomValidity('');
          first.removeEventListener('input', clear);
        });
      });
  }

  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!loginForm.reportValidity()) return;
    submitToPhp(loginForm, 'api/login.php', loginConfirm);
  });

  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();
    checkMatch();
    if (!signupForm.reportValidity()) return;
    submitToPhp(signupForm, 'api/signup.php', signupConfirm);
  });

  /* ----- Close icon dismisses the confirmation and clears the form ----- */
  [[loginConfirm, loginForm], [signupConfirm, signupForm]].forEach(function (pair) {
    pair[0].querySelector('.close').addEventListener('click', function () {
      pair[0].hidden = true;
      pair[1].reset();
      pair[1].querySelectorAll('.eye').forEach(function (btn) {
        var input = document.getElementById(btn.getAttribute('data-target'));
        input.type = 'password';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Show password');
      });
    });
  });
})();
