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

function setOAuthLoading(loading) {
  setLoading(document.getElementById('google-btn'), loading);
  setLoading(document.getElementById('facebook-btn'), loading);
  const guestBtn = document.getElementById('guest-btn');
  if (guestBtn) guestBtn.disabled = loading;
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
  const isForgot = tab === 'forgot';
  document.querySelector('.auth-tabs')?.classList.toggle('hidden', isForgot);
  document.querySelector('.auth-divider')?.classList.toggle('hidden', isForgot);
  document.querySelector('.auth-social')?.classList.toggle('hidden', isForgot);
  document.getElementById('auth-message')?.classList.add('hidden');
}

function showForgotPassword() {
  const loginEmail = document.getElementById('login-email')?.value.trim();
  if (loginEmail) {
    document.getElementById('forgot-email').value = loginEmail;
  }
  switchTab('forgot');
}

function updateSupabaseConfigUI() {
  const configured = typeof isSupabaseConfigured === 'function' && isSupabaseConfigured();
  const warning = document.getElementById('config-warning');
  warning?.classList.toggle('hidden', configured);
  return configured;
}

document.addEventListener('DOMContentLoaded', async () => {
  const isOAuthReturn = typeof isOAuthCallbackUrl === 'function' && isOAuthCallbackUrl();
  if (isOAuthReturn) {
    setOAuthLoading(true);
    showAuthMessage('Završavamo prijavu...');
  }

  const oauthResult = typeof handleOAuthCallback === 'function'
    ? await handleOAuthCallback()
    : { handled: false };

  if (oauthResult.handled) {
    if (oauthResult.success) {
      showToast('Uspešno ste se prijavili!');
      redirectAfterAuth();
      return;
    }
    setOAuthLoading(false);
    showAuthMessage(oauthResult.error, true);
  }

  await initAuth();

  if (isLoggedIn()) {
    redirectAfterAuth();
    return;
  }

  const configured = updateSupabaseConfigUI();

  const googleBtn = document.getElementById('google-btn');
  const facebookBtn = document.getElementById('facebook-btn');
  if (configured) {
    googleBtn.disabled = false;
    facebookBtn.disabled = false;
  }

  document.querySelectorAll('.auth-tabs__btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  document.getElementById('forgot-toggle')?.addEventListener('click', showForgotPassword);
  document.getElementById('forgot-back')?.addEventListener('click', () => switchTab('login'));

  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (!configured) {
      showAuthMessage('Prijava trenutno nije dostupna. Koristite gost režim.', true);
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
      showAuthMessage(mapAuthError(err), true);
    } finally {
      setLoading(btn, false);
    }
  });

  document.getElementById('register-form').addEventListener('submit', async e => {
    e.preventDefault();
    if (!configured) {
      showAuthMessage('Prijava trenutno nije dostupna. Koristite gost režim.', true);
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
        password,
        {
          firstName: document.getElementById('register-first-name')?.value.trim() || '',
          lastName: document.getElementById('register-last-name')?.value.trim() || ''
        }
      );
      if (result.user && !result.session) {
        showAuthMessage('Proverite email za potvrdu naloga, zatim se prijavite.');
      } else {
        showToast('Nalog kreiran! Dobrodošli u Domaćinko.');
        redirectAfterAuth();
      }
    } catch (err) {
      showAuthMessage(mapAuthError(err), true);
    } finally {
      setLoading(btn, false);
    }
  });

  document.getElementById('forgot-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    if (!configured) {
      showAuthMessage('Prijava trenutno nije dostupna.', true);
      return;
    }
    const email = document.getElementById('forgot-email').value.trim();
    if (!email) {
      showAuthMessage('Unesite email adresu.', true);
      return;
    }
    const btn = document.getElementById('forgot-btn');
    setLoading(btn, true);
    try {
      await resetPassword(email);
      showAuthMessage('Poslali smo vam email sa linkom za reset lozinke. Proverite inbox i spam folder.');
    } catch (err) {
      const msg = err.message?.includes('rate')
        ? 'Previše zahteva. Sačekajte par minuta i pokušajte ponovo.'
        : mapAuthError(err);
      showAuthMessage(msg, true);
    } finally {
      setLoading(btn, false);
    }
  });

  googleBtn.addEventListener('click', async () => {
    setOAuthLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      showAuthMessage(mapAuthError(err), true);
      setOAuthLoading(false);
    }
  });

  facebookBtn.addEventListener('click', async () => {
    setOAuthLoading(true);
    try {
      await signInWithFacebook();
    } catch (err) {
      showAuthMessage(mapAuthError(err), true);
      setOAuthLoading(false);
    }
  });

  document.getElementById('guest-btn').addEventListener('click', () => {
    setGuestMode();
    showToast('Gost režim — podaci ostaju samo na ovom uređaju.');
    redirectAfterAuth();
  });
});
