const loadTrackedCodeSnippets = async () => {
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
            // likely empty, e.g. no snippets
            console.error(response)
        }

        const data = await response.json();

        const mainContainer = document.createElement('div');

        const inputs = [...document.getElementsByTagName("input")];
        console.log("ALL INPUTS", inputs);

        for (let i = 0; i < data.length; i++) {
            const div = document.createElement("div");
            div.className = "tracked-file";
            div.innerText = data[i].name;

            if (data[i].name.indexOf(".backup.") !== -1) {
                continue;
            }

            // .title is where we store the actual code, so we can use it doubly for matching
            const item = inputs.filter(x => x.title == data[i].content)[0];
            if (!item) {
                // The fact that we got here means that one of the items is tracked, just not with one of the auto-generated file names on the screen
                const warning = document.createElement("h2");
                warning.className = "warning";

                warning.innerText = `(not shown: ${data[i].name})`;
                warning.title = data[i].content;
                mainContainer.appendChild(warning);

                continue;
            }

            const fileDiv = item.parentElement;

            // In case the tracked version of the file is named differently from the auto-incremented name
            fileDiv.children[1].value = data[i].name;

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
