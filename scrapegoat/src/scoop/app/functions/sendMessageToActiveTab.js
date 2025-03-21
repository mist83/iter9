function sendMessageToActiveTab(payload) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs.length) return; // No active tab
        chrome.tabs.sendMessage(tabs[0].id, payload);
    });
}
