const urlBase = "https://zrihfe7jqvlhlyrrh5lznnsbc40llfui.lambda-url.us-west-2.on.aws/iter9";
//const urlBase = https://localhost:7171/iter9;

const allCodeBlocks = [];

const saveFile = async (only) => {
    const project = document.getElementById("project-name").value;

    try {
        const files = allCodeBlocks
            .map(x => ({
                name: x.code.input.value,
                content: x.code.code
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

            const response = await fetch(`${urlBase}/${project}`, {
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

console.log("popup");
document.getElementById("view-dashboard").addEventListener("click", async () => {
    const items = document.getElementById("project-name").value.split('/');

    const projectName = items[0];
    const folderName = items[1];

    chrome.tabs.create({ url: `scoop/index.html?project=${projectName}&folderName=${folderName}` });
});

chrome.runtime.sendMessage({ action: 'getHTML' }, async (response) => {
    await getHTML(response);
});

document.addEventListener("DOMContentLoaded", async function () {
    await loadTrackedCodeSnippets("pomegranate");
});
