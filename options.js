const DEFAULT_SETTINGS = {
    unit: "km",
    convertMap: true,
    convertBestEffort: true,
    showOriginalTime: false
};

document.addEventListener("DOMContentLoaded", async () => {
    const settings = await chrome.storage.sync.get(DEFAULT_SETTINGS);

    document.querySelector(
        `input[name="paceUnit"][value="${settings.unit}"]`
    ).checked = true;

    document.getElementById("convertMap").checked = settings.convertMap;
    document.getElementById("convertBestEffort").checked = settings.convertBestEffort;
    document.getElementById("showOriginalBestEffort").checked = settings.showOriginalTime;
});

document.querySelectorAll('input[name="paceUnit"]').forEach(input => {
    input.addEventListener("change", saveSettings);
});

document.getElementById("convertMap").addEventListener("change", saveSettings);
document.getElementById("convertBestEffort").addEventListener("change", saveSettings);
document.getElementById("showOriginalBestEffort").addEventListener("change", saveSettings);

async function saveSettings() {
    const paceUnit = document.querySelector(
        'input[name="paceUnit"]:checked'
    ).value;
    
    var dataToSave = {
        unit: paceUnit,
        convertMap: document.getElementById("convertMap").checked,
        convertBestEffort: document.getElementById("convertBestEffort").checked,
        showOriginalTime: document.getElementById("showOriginalBestEffort").checked
    };

    await chrome.storage.sync.set(dataToSave);

    const tabs = await browser.tabs.query({
        active: true,
        currentWindow: true
    });

    const tab = tabs[0];

    if (tab?.url) {
        const url = new URL(tab.url);

        if (url.hostname === 'strava.com' || url.hostname.endsWith('.strava.com')) {
            await browser.tabs.reload(tab.id);
        }
    }
}
