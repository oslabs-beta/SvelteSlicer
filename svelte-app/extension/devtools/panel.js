let tabId;

async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}

async function setScript() {
    tabId = await getCurrentTab();
    chrome.scripting.executeScript(
        {
            target: {tabId: tabId},
            files: ['devtools/observer.js'],
        });
}

setScript();