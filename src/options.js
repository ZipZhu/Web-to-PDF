let messages = {};

async function fetchMessages(lang) {
  const url = chrome.runtime.getURL(`/_locales/${lang}/messages.json`);
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const json = await response.json();
    const formattedMessages = {};
    for (const key in json) {
      formattedMessages[key] = json[key].message;
    }
    return formattedMessages;
  } catch (error) {
    return null;
  }
}

function applyLocalization() {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = messages[key] || `Missing: ${key}`;
    if (key === 'footerText') {
      element.innerHTML = translation;
    } else {
      element.textContent = translation;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const defaultSettings = {
    patchesOn: true,
    expandScrollableOn: true,
    prescrollOn: true,
    hideFixedOn: true,
    autoSaveOn: true,
    showStickerOn: true,
    filenameStrategy: 'title'
  };

  const settingsMap = {
    'setting-patches': 'patchesOn',
    'setting-expand-scrollable': 'expandScrollableOn',
    'setting-prescroll': 'prescrollOn',
    'setting-hide-fixed': 'hideFixedOn',
    'setting-save-as': 'autoSaveOn',
    'setting-show-sticker': 'showStickerOn',
  };

  function applySettingsToUI(settings) {
    for (const [id, key] of Object.entries(settingsMap)) {
      const element = document.getElementById(id);
      if (element) {
        element.checked = settings[key];
      }
    }
    const strategy = settings.filenameStrategy || 'title';
    const radio = document.getElementById(`filename-strategy-${strategy}`);
    if (radio) {
      radio.checked = true;
    }
  }

  function loadSettings() {
    chrome.storage.local.get({ settings: defaultSettings }, (data) => {
      applySettingsToUI(data.settings);
    });
  }

  function saveSettings() {
    const currentSettings = {};
    for (const [id, key] of Object.entries(settingsMap)) {
      const element = document.getElementById(id);
      if (element) {
        currentSettings[key] = element.checked;
      }
    }
    const selectedStrategy = document.querySelector('input[name="filenameStrategy"]:checked');
    if (selectedStrategy) {
      currentSettings.filenameStrategy = selectedStrategy.value;
    }
    chrome.storage.local.set({ settings: currentSettings });
  }

  for (const id of Object.keys(settingsMap)) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('change', saveSettings);
    }
  }

  document.querySelectorAll('input[name="filenameStrategy"]').forEach(radio => {
    radio.addEventListener('change', saveSettings);
  });

  const resetButton = document.getElementById('reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      console.log('Resetting to default settings.');
      chrome.storage.local.set({ settings: defaultSettings }, () => {
        applySettingsToUI(defaultSettings);
      });
    });
  }

  async function initializeLocalization() {
    const { userLang = 'auto' } = await chrome.storage.local.get('userLang');

    let langToLoad = userLang;
    if (langToLoad === 'auto') {
      const uiLang = chrome.i18n.getUILanguage();
      langToLoad = uiLang.startsWith('zh') ? 'zh_CN' : 'en';
    }

    messages = await fetchMessages(langToLoad) || {};
    applyLocalization();

    const radioToCheck = document.querySelector(`input[name="language"][value="${userLang}"]`);
    if (radioToCheck) radioToCheck.checked = true;

    const langRadios = document.querySelectorAll('input[name="language"]');
    langRadios.forEach(radio => {
      radio.addEventListener('change', async (event) => {
        const selectedLang = event.target.value;
        await chrome.storage.local.set({ userLang: selectedLang });

        let newLangToLoad = selectedLang;
        if (newLangToLoad === 'auto') {
          const uiLang = chrome.i18n.getUILanguage();
          newLangToLoad = uiLang.startsWith('zh') ? 'zh_CN' : 'en';
        }

        messages = await fetchMessages(newLangToLoad) || {};
        applyLocalization();
      });
    });
  }

  loadSettings();
  initializeLocalization();
});
