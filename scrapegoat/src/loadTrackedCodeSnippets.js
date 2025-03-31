const loadTrackedCodeSnippets = async () => {
    const fullProjectName = localStorage.getItem("projectName");

    var base = localStorage.getItem("url")
    const url = `${urlBase}/Iter9/${fullProjectName}`;

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

        const showBackups = false;

        const counters = {

        };

        for (let i = 0; i < data.length; i++) {
            if (!showBackups && data[i].name.indexOf(".backup.") !== -1) {
                continue;
            }

            // .title is where we store the actual code, so we can use it doubly for matching
            const filenameInputs = inputs.filter(x => x.title == data[i].content);
            const key = data[i].content;
            if (!counters[key]) {
                counters[key] = 0;
            }

            const filenameInput = filenameInputs[counters[key]];
            counters[key]++;

            if (!filenameInput) {
                // The fact that we got here means that one of the items is tracked, just not with one of the auto-generated file names on the screen
                const warning = document.createElement("h2");
                warning.className = "warning";

                warning.innerText = `(not shown: ${data[i].name})`;
                warning.title = data[i].content;
                mainContainer.appendChild(warning);

                continue;
            }

            const fileDiv = filenameInput.parentElement;

            // In case the tracked version of the file is named differently from the auto-incremented name
            fileDiv.children[1].value = data[i].name;

            fileDiv.classList.remove("untracked-file");
            fileDiv.classList.add("tracked-file");
            filenameInput.setAttribute("tabindex", "-1");

            const trackFileIcon = document.createElement("i");
            const trackFileButton = fileDiv.children[0];
            fileDiv.removeChild(trackFileButton);
            fileDiv.prepend(trackFileIcon);

            const launchable = data[i].name.indexOf(".html") !== -1;
            const split = data[i].name.split('.');

            const extension = split[split.length - 1].toLowerCase();

            const classes = getFileIconClasses(extension);
            trackFileIcon.classList.add(...classes);

            fileDiv.onclick = async () => {
                // hack - not even working, just got bored/distracted and need to stop
                const xPath = fileDiv.dataset.xPath;

                await sendMessageToActiveTab({
                    action: 'scrollToElement',
                    xPath: xPath
                });
            }

            trackFileIcon.onclick = (event) => {
                event.stopPropagation();

                const projectNameValue = document.getElementById("project-name").value;
                const parts = projectNameValue.split('/');
                const projectName = parts[0];
                const folderName = parts[1];

                const fileName = data[i].name;
                navigate(`${urlBase}/iter9/${projectName}/${folderName}/${fileName}`);
            }
        }

        const content = document.getElementById('code-scrape-screen');
        content.appendChild(mainContainer);

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
