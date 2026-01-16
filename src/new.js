const STORAGE_KEY = 'STATSIG_LOCAL_STORAGE_STABLE_ID';
const TEST_PREFIX = 'test_';

const urlParams = new URLSearchParams(window.location.search);
const statsigParam = urlParams.get('statsig');

if (statsigParam) {
  if (statsigParam === 'clear') {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie =
      'statsiguuid=; Max-Age=0; Domain=.' +
      window.location.host.split('.').slice(-2).join('.') +
      '; Path=/';
    urlParams.delete('statsig');
    const newUrl =
      window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
    window.history.replaceState({}, '', newUrl);
  } else {
    const testId = `test_${statsigParam.replace(/-/g, '_')}`;
    localStorage.setItem(STORAGE_KEY, testId);
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 12);
    const domain = '.' + window.location.host.split('.').slice(-2).join('.');
    document.cookie = `statsiguuid=${testId};Expires=${expires};Domain=${domain};Path=/;Secure`;
  }
}

const currentId = localStorage.getItem(STORAGE_KEY);
if (currentId && currentId.startsWith(TEST_PREFIX) && !statsigParam) {
  const variant = currentId.substring(TEST_PREFIX.length);
  urlParams.set('statsig', variant);
  const newUrl = window.location.pathname + '?' + urlParams.toString();
  window.history.replaceState({}, '', newUrl);
}

// UUID generation and sync
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

window.initStatsig = async function () {
  try {
    // Get user ID from localStorage
    const userObj = {};
    const stableId = localStorage.getItem('STATSIG_LOCAL_STORAGE_STABLE_ID');

    if (stableId) {
      userObj.customIDs = {
        stableID: stableId,
      };
    }

    // Create Statsig client
    const client = new window.Statsig.StatsigClient(
      'client-eNg4fu7Fpe036cvkjwJk5AheQdNZUgFIWeSme9TRQMw',
      userObj,
      { environment: { tier: 'production' } }
    );

    // Store client globally
    window.statsigClient = client;

    // Initialize and wait for completion
    await client.initializeAsync();

    // Check all gates
    const homepageRedesignGateOn = client.checkGate('website_homepage_redesign');
    const quizGateOn = client.checkGate('quiz_flow_marketing_site');

    // Store gate results globally
    window.statsigGates = {
      homepageRedesign: homepageRedesignGateOn,
      quizFlow: quizGateOn,
      ready: true,
    };

    document.querySelectorAll('.is-home-no-ab').forEach((el) => el.classList.remove('hide'));
    document.querySelectorAll('.is-home-ab').forEach((el) => el.classList.add('hide'));
    document.querySelectorAll('.is-home-ab-button').forEach((el) => el.classList.add('hide'));

    if (quizGateOn) {
      window.localStorage.setItem('hasQuizFlow', true);
      document
        .querySelectorAll('.find-dietitian-link')
        .forEach((el) => el.setAttribute('href', 'https://signup.faynutrition.com/quiz'));
    } else {
      window.localStorage.removeItem('hasQuizFlow');
    }

    return true;
  } catch (error) {
    console.error('Statsig initialization failed:', error);
    window.statsigGates = {
      homepageRedesign: false,
      quizFlow: false,
      ready: false,
      error: error,
    };
    return false;
  }
};
