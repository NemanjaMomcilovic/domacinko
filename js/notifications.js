/**
 * Domaćinko - Client-side notifications (PWA)
 */

const NOTIFICATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

function canUseNotifications() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

async function requestNotificationPermission() {
  if (!canUseNotifications()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

function shouldNotify(type) {
  const state = getNotificationState();
  const last = state[type];
  if (!last) return true;
  return Date.now() - last > NOTIFICATION_COOLDOWN_MS;
}

function markNotified(type) {
  const state = getNotificationState();
  state[type] = Date.now();
  saveNotificationState(state);
}

async function showAppNotification(title, body, tag) {
  const settings = getSettings();
  if (!settings.notificationsEnabled) return;
  if (Notification.permission !== 'granted') return;

  const options = {
    body,
    icon: `${getAssetBase()}/assets/icons/icon-192.svg`,
    badge: `${getAssetBase()}/assets/icons/icon-192.svg`,
    tag: tag || 'domacinko',
    data: { url: `${getAssetBase()}/pages/home.html` }
  };

  try {
    const reg = await navigator.serviceWorker.ready;
    if (reg.showNotification) {
      await reg.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  } catch {
    try {
      new Notification(title, options);
    } catch { /* ignore */ }
  }
}

async function checkAndSendNotifications() {
  const settings = getSettings();
  if (!settings.notificationsEnabled || Notification.permission !== 'granted') return;

  const reminders = getRecurringReminders();
  if (reminders.length > 0 && shouldNotify('recurring')) {
    const names = reminders.slice(0, 3).map(r => r.name).join(', ');
    await showAppNotification(
      'Podsetnik za račune 💚',
      `Ne zaboravite: ${names}`,
      'recurring-bills'
    );
    markNotified('recurring');
  }

  const usage = getBudgetUsagePct();
  if (usage >= 80 && shouldNotify('budget')) {
    await showAppNotification(
      'Upozorenje budžeta ⚠️',
      `Potrošili ste ${usage}% mesečnog budžeta. Razmislite o uštedama.`,
      'budget-warning'
    );
    markNotified('budget');
  }

  const shopping = getShoppingList().filter(i => !i.bought);
  if (shopping.length > 0 && shouldNotify('shopping')) {
    await showAppNotification(
      'Lista za kupovinu 🛒',
      `Imate ${shopping.length} stavki na listi. Vreme za kupovinu!`,
      'shopping-reminder'
    );
    markNotified('shopping');
  }
}

async function enableNotifications() {
  const permission = await requestNotificationPermission();
  if (permission === 'granted') {
    saveSettings({ notificationsEnabled: true });
    await checkAndSendNotifications();
    return true;
  }
  saveSettings({ notificationsEnabled: false });
  return false;
}

function disableNotifications() {
  saveSettings({ notificationsEnabled: false });
}
