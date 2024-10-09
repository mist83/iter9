console.log("Loaded init.js (hook for finding console debugging)");

document.addEventListener('DOMContentLoaded', function () {
    const appSlugInput = document.getElementById('app-slug');

    appSlugInput.value = `iter9-${Math.floor(Math.random() * 900) + 100}`;

    async function uploadAllContent(html, css, js, isLocal) {
        const bodyContent = {
            slug: appSlugInput.value,
            files: {
                html: [html],
                css: [css],
                js: [js]
            }
        };

        localStorage.setItem("app-slug", document.getElementById("app-slug").value);


        // Add it right away to localstorage? this feels wrong and premature
        addAppRecordToLocalStorage(bodyContent);

        if (isLocal) {
            console.log("Skipping: running local mode");
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyContent)
            });

            if (response.ok) {
                console.log('All content uploaded successfully.');
                const text = await response.text();
                const obj = JSON.parse(text);

                addUIJobStatus(obj, true);
            } else {
                console.error(await response.text());

                addUIJobStatus(obj, false);
            }
        } catch (error) {
            console.error(error);

            addUIJobStatus({
                slug: "BROKEN AF",
                url: "https://check.yourself"
            }, false);
        }
    }

    document.getElementById("pasteHtml").onclick = async (event) => {
        console.log("pasting html");
        const clipboardText = await navigator.clipboard.readText();
        const element = document.getElementById("htmlContent");
        element.children[1].innerText = clipboardText;
        element.classList.remove("error");
    }

    document.getElementById("pasteCss").onclick = async (event) => {
        console.log("pasting css");
        const clipboardText = await navigator.clipboard.readText();
        const element = document.getElementById("cssContent");
        element.children[1].innerText = clipboardText;
        element.classList.remove("error");
    }

    document.getElementById("pasteJs").onclick = async (event) => {
        console.log("pasting js");
        const clipboardText = await navigator.clipboard.readText();
        const element = document.getElementById("jsContent");
        element.children[1].innerText = clipboardText;
        element.classList.remove("error");
    }

    document.getElementById("selectHtmlTab").onclick = (event) => {
        const type = "html";

        const id = type + "-content-pane";
        const color = "color-" + type;
        selectContentTab([event.target, document.getElementById(id)], color);
    }

    document.getElementById("selectCssTab").onclick = (event) => {

        const type = "css";

        const id = type + "-content-pane";
        const color = "color-" + type;
        selectContentTab([event.target, document.getElementById(id)], color);
    }

    document.getElementById("selectJsTab").onclick = (event) => {
        const type = "js";

        const id = type + "-content-pane";
        const color = "color-" + type;
        selectContentTab([event.target, document.getElementById(id)], color);
    }

    document.getElementById("selectSettingsTab").onclick = (event) => {
        event.target.classList.add("active");

        const type = "settings";

        const id = type + "-content-pane";
        const color = "color-" + type;
        selectContentTab([event.target, document.getElementById(id)], color);
    }

    document.getElementById('snapshot-button').addEventListener('click', function () {
        const html = document.getElementById('htmlContent').innerText;
        const css = document.getElementById('cssContent').innerText;
        const js = document.getElementById('jsContent').innerText;
        uploadAllContent(html, css, js);
    });

    //if (document.getElementById("toggleLocalMode").classList.contains("selected")) {
    //    listLocalStorageApps((app) => {
    //        addUIJobStatus(app, true);
    //    });
    //}

    const appSlug = localStorage.getItem("app-slug");
    if (appSlug) {
        document.getElementById("app-slug").value = appSlug;
    }

    const cycleItems = Array.from(document.getElementById("inputSwitchTab").getElementsByClassName('cycle-item'));

    //const cycleInDirection = cycleActiveClassOnScroll(cycleItems.slice(0, -1));
    const cycleInDirection = cycleActiveClassOnScroll(cycleItems);

    setInterval(() => {
        if (demoMode) {
            cycleInDirection(1);
        }
    }, 3000);

    findInlineStyles();
});
