function showAuthMessage(text, isError = false) {
  const el = document.getElementById('auth-message');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('auth-message--error', isError);
  el.classList.remove('hidden');
}

function setLoading(btn, loading) {
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset.originalText = btn.dataset.originalText || btn.textContent;
  btn.textContent = loading ? 'Sačekajte...' : btn.dataset.originalText;
}

function redirectAfterAuth() {
  if (needsOnboarding()) {
    window.location.href = 'onboarding.html';
  } else {
    window.location.href = 'home.html';
  }
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tabs__btn').forEach(btn => {
    btn.classList.toggle('auth-tabs__btn--active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('hidden', form.dataset.panel !== tab);
  });
  document.getElementById('auth-message')?.classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', async () => {
  await initAuth();

  if (isGuestMode() || isLoggedIn()) {
    redirectAfterAuth();
    return;
  }

  const configured = isSupabaseConfigured();
  const warning = document.getElementById('config-warning');
  if (!configured) {
    warning?.classList.remove('hidden');
  }

  const googleBtn = document.getElementById('google-btn');
  const facebookBtn = document.getElementById('facebook-btn');
  if (configured) {
    googleBtn.disabled = false;
    facebookBtn.disabled = false;
  }

  document.querySelectorAll('.auth-tabs__btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (!configured) {
      showAuthMessage('Supabase nije podešen. Koristite gost režim ili podesite config.js.', true);
      return;
    }
    const btn = document.getElementById('login-btn');
    setLoading(btn, true);
    try {
      await signIn(
        document.getElementById('login-email').value.trim(),
        document.getElementById('login-password').value
      );
      showToast('Dobrodošli nazad!');
      redirectAfterAuth();
    } catch (err) {
      showAuthMessage(err.message || 'Prijava nije uspela.', true);
    } finally {
      setLoading(btn, false);
    }
  });

  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (!configured) {
      showAuthMessage('Supabase nije podešen. Koristite gost režim ili podesite config.js.', true);
      return;
    }
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-password-confirm').value;
    if (password !== confirm) {
      showAuthMessage('Lozinke se ne poklapaju.', true);
      return;
    }
    const btn = document.getElementById('register-btn');
    setLoading(btn, true);
    try {
      const result = await signUp(
        document.getElementById('register-email').value.trim(),
        password
      );
      if (result.user && !result.session) {
        showAuthMessage('Proverite email za potvrdu naloga, zatim se prijavite.');
      } else {
        showToast('Nalog kreiran! Dobrodošli u Domaćinko.');
        redirectAfterAuth();
      }
    } catch (err) {
      showAuthMessage(err.message || 'Registracija nije uspela.', true);
    } finally {
      setLoading(btn, false);
    }
  });

  googleBtn.addEventListener('click', async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      showAuthMessage(err.message || 'Google prijava nije uspela.', true);
    }
  });

  facebookBtn.addEventListener('click', async () => {
    try {
      await signInWithFacebook();
    } catch (err) {
      showAuthMessage(err.message || 'Facebook prijava nije uspela.', true);
    }
  });

  document.getElementById('guest-btn').addEventListener('click', () => {
    setGuestMode();
    showToast('Gost režim — podaci ostaju samo na ovom uređaju.');
    redirectAfterAuth();
  });
});
