!(function () {
  let t = 'STATSIG_LOCAL_STORAGE_STABLE_ID';
  function e() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    let t = () =>
      Math.floor(65536 * Math.random())
        .toString(16)
        .padStart(4, '0');
    return `${t()}${t()}-${t()}-4${t().substring(1)}-${t()}-${t()}${t()}${t()}`;
  }
  let i = null,
    n = localStorage.getItem(t) || null;
  if (
    (document.cookie.match(/statsiguuid=([\w-]+);?/) &&
      ([, i] = document.cookie.match(/statsiguuid=([\w-]+);?/)),
    i && n && i === n)
  );
  else if (i && n && i !== n) localStorage.setItem(t, i);
  else if (i && !n) localStorage.setItem(t, i);
  else {
    let o = e();
    localStorage.setItem(t, o),
      (function t(i) {
        let n = new Date();
        n.setMonth(n.getMonth() + 12);
        let o = window.location.host.split('.');
        o.length > 2 && o.shift();
        let s = `.${o.join('.')}`;
        document.cookie = `statsiguuid=${i || e()};Expires=${n};Domain=${s};Path=/;Secure`;
      })(o);
  }
})();

// --- Timebox helper: resolves to { ok: true } or { ok: false, timeout: true }
async function withTimeout(promise, ms) {
  return Promise.race([
    promise.then(() => ({ ok: true })),
    new Promise((resolve) => setTimeout(() => resolve({ ok: false, timeout: true }), ms)),
  ]);
}

// --- Retry logic for Statsig initialization
async function waitForStatsig(timeout = 1000, retries = 100, delay = 100) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const { StatsigClient } = window.Statsig || {};

    if (StatsigClient && !window.statsigClient) {
      const userObj = {};
      if (localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID')) {
        userObj.customIDs = {
          stableID: localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID'),
        };
      }

      // const client = new StatsigClient("client-qFGr4zDaYW5oH0a40Gf5rZInM1UXVqvLJuByLtwUJQt", userObj, {environment: {tier: 'staging'} });
      const client = new StatsigClient(
        'client-eNg4fu7Fpe036cvkjwJk5AheQdNZUgFIWeSme9TRQMw',
        userObj,
        { environment: { tier: 'production' } }
      );

      window.statsigClient = client;
    }

    if (window.statsigClient && typeof window.statsigClient.initializeAsync === 'function') {
      const result = await withTimeout(window.statsigClient.initializeAsync(), timeout);
      if (result.ok) {
        return { ok: true };
      }
    }

    if (attempt < retries) {
      console.warn(`Statsig not ready (attempt ${attempt}/${retries}). Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  return { ok: false, timeout: true };
}

async function initStatsig() {
  // --- Global Statsig readiness promise (never rejects)
  window.statsigReady = (async () => {
    const result = await waitForStatsig();
    return result;
  })();

  const statsigStatus = await window.statsigReady;

  const quizGateOn = statsigStatus?.ok
    ? window.statsigClient.checkGate('quiz_flow_marketing_site')
    : false;

  //quizGateOn = true;
  console.log(
    'quizGateOn:',
    quizGateOn,
    window.statsigClient.checkGate('quiz_flow_marketing_site')
  );

  document.querySelectorAll('.is-home-no-ab').forEach((el) => el.classList.remove('hide'));
  document.querySelectorAll('.is-home-ab').forEach((el) => el.classList.add('hide'));
  document.querySelectorAll('.is-home-ab-button').forEach((el) => el.classList.add('hide'));

  if (quizGateOn) {
    localStorage.setItem('hasQuizFlow', true);
    document
      .querySelectorAll('.find-dietitian-link')
      .forEach((el) => el.setAttribute('href', 'https://signup.faynutrition.com/quiz'));
    /* setTimeout(() => {
        addUtmParamsInLinks();
      }, 100) */
  } else {
    localStorage.removeItem('hasQuizFlow');
  }
}
