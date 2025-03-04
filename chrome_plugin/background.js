// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getHTML') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab) {
                console.log("Active tab:", activeTab.url);
                chrome.tabs.sendMessage(activeTab.id, { action: 'getHTML' }, (response) => {
                    sendResponse(response);
                });
            } else {
                console.log("No active tab found.");
            }
            return true;  // Keep the response asynchronous
        });

        // Return true to indicate that the response is asynchronous
        return true;
    }
});

let icons = ["icons/red.png", "icons/blue.png", "icons/yellow.png", "icons/green.png"];
let currentIndex = 0;

function changeIcon() {
    let iconPath = icons[currentIndex];

    if (!chrome.action) {
        return;
    }

    chrome.action.setIcon({ path: iconPath });

    currentIndex = (currentIndex + 1) % icons.length;
}

// Change icon every 2 seconds
setInterval(changeIcon, 2000);

function sendGenericActionMessage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const activeTab = tabs[0];
            if (activeTab) {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'genericAction' });
            }
        });
    });
}

// Run every 10 seconds (adjust as needed)
setInterval(sendGenericActionMessage, 3000);
