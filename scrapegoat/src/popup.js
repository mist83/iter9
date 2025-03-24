console.log("Popup opened");

const allCodeBlocks = [];

const saveFile = async (only) => {
    const project = document.getElementById("project-name").value;

    try {
        const files = allCodeBlocks
            .map(x => ({
                name: x.input.value,
                content: x.code,
            }));

        let fileName;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (only) {
                if (file.name !== only) {
                    continue;
                }
            }

            if (!fileName) {
                fileName = file.name;
            }

            if (file.name.indexOf(".html") !== -1) {
                fileName = file.name;
            }

            const response = await fetch(`${urlBase}/iter9/${project}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(file)
            });

            const data = await response.json();
            console.log(data);
        }

        const projectName = project.split('/')[0];
        const folderName = project.split('/')[1];

        return [projectName, folderName, fileName];
    }
    catch (error) {
        alert(`Sorry!\n\nWe couldn't back up your code!\n\n${error}`);
    }
};

const showSplashScreen = async () => {
    alert("splash");
}

console.log("Popup (outer): processHTML");
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    const startupName = document.getElementById("project-name").value.split('/');
    if (startupName[0] == "system") {
        if (startupName[1] == "splash") {
            await showSplashScreen();
            return;
        }

        await alert("Unknown system screen: " + startupName[1]);
        return;
    }

    if (tabs.length === 0) return; // No active tab
    chrome.tabs.sendMessage(tabs[0].id, {
        action: 'getHTML'
    }, async (response) => {
        console.log("Popup (inner): processHTML");

        const codeFound = await processHTML(response);

        if (codeFound) {
            await loadTrackedCodeSnippets();
        }
    });
});

//const urlBase = https://localhost:7171/iter9;

const urlBase = localStorage.getItem("url");
document.getElementById("server-url-input").value = urlBase;
