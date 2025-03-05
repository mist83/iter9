async function loadTrackedCodeSnippets(projectFullName) {
    const fullProjectName = localStorage.getItem("projectName");

    const url = `https://zrihfe7jqvlhlyrrh5lznnsbc40llfui.lambda-url.us-west-2.on.aws/Iter9/${fullProjectName}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            // likely empty
        }

        const data = await response.json();

        const mainContainer = document.createElement('div');

        document.getElementById("view-dashboard").style.display = "grid";
        for (let i = 0; i < data.length; i++) {
            const div = document.createElement("div");
            div.className = "tracked-file";
            div.innerText = data[i].name;

            if (data[i].name.indexOf(".backup.") !== -1) {
                continue;
            }

            const item = [...document.getElementsByTagName("input")].filter(x => x.value == data[i].name)[0];
            if (!item) {
                // tracked, just not with the file name on screen
                const warning = document.createElement("h1");
                warning.style.color = "Yellow";

                // TODO
                warning.innerText = "RENAME: " + data[i].name;
                mainContainer.appendChild(warning);

                continue;
            }

            const fileDiv = item.parentElement;

            fileDiv.classList.remove("untracked-file");
            fileDiv.classList.add("tracked-file");

            const launchable = data[i].name.indexOf(".html") !== -1;
            if (launchable) {
                const trackFileButton = fileDiv.children[0];
                fileDiv.removeChild(trackFileButton);

                const trackFileIcon = document.createElement("i");
                fileDiv.prepend(trackFileIcon);

                trackFileIcon.classList.add("ti", "ti-rocket");
                fileDiv.onclick = () => {
                    const projectNameValue = document.getElementById("project-name").value;
                    const parts = projectNameValue.split('/');

                    const projectName = parts[0];
                    const folderName = parts[1];

                    const fileName = div.innerText;
                    chrome.tabs.create({ url: `${urlBase}/${projectName}/${folderName}/${fileName}` });
                }
            } else {
                const trackFileButton = fileDiv.children[0];
                fileDiv.removeChild(trackFileButton);

                const trackFileIcon = document.createElement("i");
                fileDiv.prepend(trackFileIcon);

                trackFileIcon.classList.add("ti", "ti-check");
            }
        }

        const content = document.getElementById('code-snippet-area');
        content.appendChild(mainContainer);

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
