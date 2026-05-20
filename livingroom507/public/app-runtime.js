(function () {
  const defaultConfig = {
    apiBase: '/api',
    features: {
      affiliateProfile: 'production',
      empathQuizSubmissions: 'practice',
    },
  };

  const userConfig = window.APP_CONFIG || {};
  const config = {
    apiBase: userConfig.apiBase || defaultConfig.apiBase,
    features: {
      affiliateProfile: userConfig.features?.affiliateProfile || defaultConfig.features.affiliateProfile,
      empathQuizSubmissions: userConfig.features?.empathQuizSubmissions || defaultConfig.features.empathQuizSubmissions,
    },
  };

  function isPracticeMode(featureName) {
    return config.features[featureName] === 'practice';
  }

  function buildApiUrl(path) {
    if (!path.startsWith('/')) {
      path = `/${path}`;
    }

    return `${config.apiBase}${path}`;
  }

  async function fetchJson(path, options) {
    const response = await fetch(buildApiUrl(path), options);
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText} (Status: ${response.status})`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new Error(`Expected JSON from ${buildApiUrl(path)} but received ${contentType || 'unknown content type'}.`);
    }

    return response.json();
  }

  function readStorage(key, fallbackValue) {
    try {
      const rawValue = localStorage.getItem(key);
      return rawValue ? JSON.parse(rawValue) : fallbackValue;
    } catch (error) {
      console.warn(`Invalid local storage payload for ${key}.`, error);
      return fallbackValue;
    }
  }

  function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async function submitQuizResult(payload) {
    if (isPracticeMode('empathQuizSubmissions')) {
      const storageKey = 'empathQuizPracticeResults';
      const existingResults = readStorage(storageKey, []);
      existingResults.push({
        ...payload,
        mode: 'practice',
        submittedAt: new Date().toISOString(),
      });
      writeStorage(storageKey, existingResults);
      return { ok: true, mode: 'practice' };
    }

    await fetchJson('/submit-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return { ok: true, mode: 'production' };
  }

  window.LIVINGROOM507_RUNTIME = {
    config,
    isPracticeMode,
    fetchJson,
    readStorage,
    writeStorage,
    submitQuizResult,
  };
})();
