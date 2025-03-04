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

            const item = [...document.getElementsByTagName("input")].filter(x => x.value == data[i].name)[0];
            if (!item) {
                // tracked, just not with the file name on screen
                const warning = document.createElement("h4");
                warning.style.color = "limegreen";
                warning.innerText = data[i].name;
                mainContainer.appendChild(warning);

                continue;
            }

            const itemParent = item.parentElement;

            itemParent.title = "this item is (probably) tracked - based on file name only lol";
            item.style.color = "yellow";
            itemParent.style.backgroundColor = "yellow";
        }

        const content = document.getElementById('code-snippet-area');
        content.appendChild(mainContainer);

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
