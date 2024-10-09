console.log("Loaded functions.js (hook for finding console debugging)");

function getTotalLocalStorageSizeInBytes() {
    let totalSize = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            totalSize += key.length + localStorage.getItem(key).length;
        }
    }
    return totalSize * 2; // Each character is 2 bytes
}

function listLocalStorageApps(delegate) {
    const dataString = localStorage.getItem(localStorageDataKey);

    const dataObj = JSON.parse(dataString);
    if (dataObj && Array.isArray(dataObj.apps)) {
        dataObj.apps.forEach(app => {
            delegate(app);
        });
    }
}

function addAppRecordToLocalStorage(newApp) {
    const dataJSON = localStorage.getItem(localStorageDataKey);

    let data = {};

    try {
        data.apps = dataJSON ? JSON.parse(dataJSON).apps : [];
    } catch (error) {
        console.error("Error parsing JSON from localStorage:", error);
        debugger;
    }

    data.apps.push(newApp);

    localStorage.setItem(localStorageDataKey, JSON.stringify(data));
}

function addUIJobStatus(obj, success) {
    const template = document.getElementById("appInstanceDetailRowTemplate");
    var templateElement = document.importNode(template.content, true);

    templateElement.children[0].children[1].href = "/html/" + obj.url;
    templateElement.children[0].children[1].children[0].innerText = obj.slug;
    templateElement.children[0].children[1].children[1].innerText = obj.url.split("/")[1];

    let appInstanceDetailsElement = templateElement.children[0];
    if (success) {
        appInstanceDetailsElement.classList.add("success");
    }
    else {
        appInstanceDetailsElement.classList.add("fail");
    }

    document.getElementById('job-status-list').children[0].prepend(appInstanceDetailsElement);
}

function cycleActiveClassOnScroll(elements) {
    let currentIndex = 0;

    // hacky
    const map = {
        0: "html",
        1: "css",
        2: "js",
        3: "settings",
    }

    // this HAS to be in the same order
    const relatedElements = Array.from(document.getElementById("contentArea").getElementsByClassName("cycle-item"));

    function updateActiveElement(direction) {
        if (currentIndex === 0 && direction === -1) {
            return;
        }

        if (currentIndex === elements.length - 1 && direction === 1) {
            return;
        }

        elements[currentIndex].classList.remove('active');
        relatedElements[currentIndex].classList.remove('active');

        currentIndex += direction;
        if (currentIndex >= elements.length) currentIndex = 0;
        else if (currentIndex < 0) currentIndex = elements.length - 1;

        elements[currentIndex].classList.add('active');
        selectContentTab([
            elements[currentIndex],
            relatedElements[currentIndex],
        ], `color-${map[currentIndex]}`);
    }

    document
        .getElementById("inputSwitchTab")
        .addEventListener('wheel', function (event) {
            const direction = event.deltaY > 0 ? 1 : -1;
            updateActiveElement(direction);
            event.preventDefault();
        }, { passive: false });

    return updateActiveElement;
}

function clearActiveTabs() {
    const tabContainer = document.getElementById("inputSwitchTab");
    for (let i = 0; i < tabContainer.children.length; i++) {
        const child = tabContainer.children[i];
        child.classList.remove("active");
    }
}

function clearContentAreaClasses() {
    const contentArea = document.getElementById("contentArea");

    contentArea.classList.remove("color-html");
    contentArea.classList.remove("color-css");
    contentArea.classList.remove("color-js");
    contentArea.classList.remove("color-settings");

    for (let i = 0; i < contentArea.children.length; i++) {
        const child = contentArea.children[i];
        child.classList.remove("active");
    }
}

function selectContentTab(elements, color) {
    clearActiveTabs();
    clearContentAreaClasses();

    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        element.classList.add(color, "active");
    }

    document.documentElement.style.setProperty('--color-active', window.getComputedStyle(document.body).getPropertyValue(`--${color}`));
}

function taintHtmlContent() { document.getElementById("htmlContent").classList.add("error"); }

function taintCssContent() { document.getElementById("cssContent").classList.add("error"); }

function taintJsContent() { document.getElementById("jsContent").classList.add("error"); }

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
