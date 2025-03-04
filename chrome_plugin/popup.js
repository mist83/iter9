const urlBase = "https://zrihfe7jqvlhlyrrh5lznnsbc40llfui.lambda-url.us-west-2.on.aws/iter9";
//const urlBase = https://localhost:7171/iter9;

const projectNames = [
    // Fruits
    'apple', 'apricot', 'avocado', 'banana', 'blackberry', 'blueberry', 'boysenberry', 'breadfruit',
    'cantaloupe', 'carambola', 'cherry', 'cloudberry', 'coconut', 'cranberry', 'currant', 'date',
    'dragonfruit', 'durian', 'elderberry', 'feijoa', 'fig', 'gooseberry', 'grape', 'grapefruit',
    'guava', 'hackberry', 'honeydew', 'huckleberry', 'jabuticaba', 'jackfruit', 'jambul', 'jostaberry',
    'jujube', 'kiwi', 'kumquat', 'lemon', 'lime', 'longan', 'loquat', 'lychee', 'mandarin', 'mango',
    'mangosteen', 'maracuja', 'marionberry', 'melon', 'mulberry', 'nance', 'nectarine', 'olive',
    'orange', 'papaya', 'passionfruit', 'pawpaw', 'peach', 'pear', 'persimmon', 'physalis', 'pineapple',
    'pitaya', 'plantain', 'plum', 'pomegranate', 'pomelo', 'pricklypear', 'quince', 'rambutan',
    'raspberry', 'redcurrant', 'roseapple', 'salak', 'satsuma', 'soursop', 'starfruit', 'strawberry',
    'tamarillo', 'tangerine', 'tomato', 'watermelon', 'yumberry', 'zucchini',

    // Vegetables
    'artichoke', 'arugula', 'asparagus', 'beet', 'broccoli', 'brussels', 'cabbage', 'carrot',
    'cauliflower', 'celery', 'chard', 'chicory', 'collard', 'cucumber', 'daikon', 'dill',
    'edamame', 'eggplant', 'endive', 'fennel', 'garlic', 'ginger', 'horseradish', 'jicama',
    'kale', 'kohlrabi', 'leek', 'lettuce', 'mushroom', 'mustard', 'okra', 'onion',
    'parsnip', 'pea', 'peanut', 'pepper', 'potato', 'pumpkin', 'radish', 'rhubarb',
    'shallot', 'spinach', 'squash', 'turnip', 'wasabi', 'yam', 'yucca',

    // Nuts & Seeds
    'almond', 'beech', 'brazilnut', 'cashew', 'chestnut', 'chia', 'coconut', 'flaxseed',
    'hazelnut', 'hempseed', 'macadamia', 'pecan', 'pistachio', 'sesame', 'sunflower', 'walnut',

    // Grains & Legumes
    'amaranth', 'barley', 'buckwheat', 'chickpea', 'corn', 'farro', 'lentil', 'millet',
    'oat', 'quinoa', 'rice', 'rye', 'sorghum', 'spelt', 'teff', 'wheat'
];

const colors = [
    "#FFADAD", // Soft Red
    "#FFD6A5", // Soft Orange
    "#FDFFB6", // Soft Yellow
    "#CAFFBF", // Soft Green
    "#9BF6FF", // Soft Blue
    "#A0C4FF", // Soft Sky Blue
    "#BDB2FF", // Soft Purple
    "#FFC6FF", // Soft Pink
    "#FAF1E6", // Soft Cream
    "#F7D1CD"  // Soft Coral
];

function setProjectName(projectName) {
    if (!projectName) {
        var randomProjectName = projectNames[Math.floor(Math.random() * projectNames.length)];
        projectName = randomProjectName + "/" + (1000 + Math.floor(Math.random() * 10000));;
    }

    document.getElementById("project-name").value = projectName;
    document.getElementById("project-name").oninput = (event) => {
        const isValid = /^[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+$/.test(event.target.value);
        if (!isValid) {
            event.target.style.color = "red";
            return;
        }

        event.target.style.color = "unset";
        localStorage.setItem("projectName", event.target.value);
    }

    localStorage.setItem("projectName", projectName);
}

document.getElementById("randomize").onclick = () => {
    setProjectName();

    const content = document.getElementById('code-snippet-area');
    content.innerHTML = "";

    setRandomColor();
};

function setRandomColor() {
    var randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.documentElement.style.setProperty('--highlight-color', randomColor);

    document.documentElement.style.setProperty('--background-color', randomColor);
    document.documentElement.style.setProperty('--highlight-color', "black");
}

setProjectName(localStorage.getItem("projectName"));
setRandomColor();

async function fetchData(projectFullName) {
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

        if (data.length > 0) {
            const trackedFileHeader = document.createElement("div");
            mainContainer.appendChild(trackedFileHeader);

            trackedFileHeader.style.display = "grid";
            trackedFileHeader.style.gridTemplate = "1fr / 1fr auto auto 1fr";

            trackedFileHeader.appendChild(document.createElement("span"));

            const fileGroupHeader = document.createElement("h2");
            trackedFileHeader.appendChild(fileGroupHeader);
            fileGroupHeader.textContent = "Project files";

            const openDashboardButton = document.createElement("i");
            //trackedFileHeader.appendChild(openDashboardButton);

            const openDashboardIcon = document.createElement("i");
            openDashboardButton.appendChild(openDashboardIcon);
            openDashboardIcon.classList.add("ti", "ti-dots");
            openDashboardButton.title = "Track file";
            openDashboardButton.onclick = () => {
                const project = document.getElementById("project-name").value.split('/')[0];
                chrome.tabs.create({ url: `scoop/index.html?project=${project}` });
            }
        }

        for (let i = 0; i < data.length; i++) {
            const div = document.createElement("div");
            div.className = "tracked-file";
            div.innerText = data[i].name;

            mainContainer.appendChild(div);
        }

        const content = document.getElementById('code-snippet-area');
        content.appendChild(mainContainer);

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

(async () => await fetchData())();

const allCodeBlocks = [];

const saveAll = async () => {
    const project = document.getElementById("project-name").value;

    try {
        const files = allCodeBlocks
            .map(x => ({
                name: x.input.value,
                content: x.code
            }));

        let fileName;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
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
    } catch (error) {
        alert(`Sorry!\n\nWe couldn't back up your code!\n\n${error}`);
    }
};

document.getElementById("smart-launch").addEventListener("click", async () => {
    const items = await saveAll();
    const projectName = items[0];
    const folderName = items[1];
    const fileName = items[2];

    chrome.tabs.create({ url: `${urlBase}/${projectName}/${folderName}/${fileName}` });
});

// Close alert function
function closeAlert() {
    document.getElementById("custom-alert").style.display = "none";
}

const getHTML = async (response) => {
    const content = document.getElementById('code-snippet-area');
    content.innerHTML = "";

    if (!response || response.codeBlocks.length === 0) {
        return;
    }

    const mainContainer = document.createElement('div');

    if (response.codeBlocks.length > 0) {
        const fileGroupHeader = document.createElement("h2");
        fileGroupHeader.textContent = "Found code";
        mainContainer.appendChild(fileGroupHeader);
    }

    const gridContainer = document.createElement('div');
    mainContainer.appendChild(gridContainer);
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = '1fr 1fr';
    gridContainer.style.width = '100%';
    gridContainer.style.gap = '8px';

    const groupedByType = response.codeBlocks.reduce((acc, codeBlock) => {
        if (!acc[codeBlock.type]) {
            acc[codeBlock.type] = [];
        }
        acc[codeBlock.type].push(codeBlock);
        return acc;
    }, {});



    for (let i = 0; i < response.codeBlocks.length; i++) {
        let suffix = groupedByType[response.codeBlocks[i].type].length > 1 ? `_${i}` : "";

        if (i === response.codeBlocks.length - 1) {
            suffix = "";
        }

        const untrackedFileDiv = document.createElement("div");
        gridContainer.appendChild(untrackedFileDiv);

        untrackedFileDiv.className = "untracked-file";
        untrackedFileDiv.style.display = "grid";
        untrackedFileDiv.style.gridTemplate = "1fr / auto 1fr";
        untrackedFileDiv.style.gap = "8px";

        const trackFileButton = document.createElement("i");
        untrackedFileDiv.appendChild(trackFileButton);
        trackFileButton.classList.add("track-file");
        trackFileButton.title = "Track file";

        const trackFileIcon = document.createElement("i");
        trackFileButton.appendChild(trackFileIcon)
        trackFileIcon.classList.add("ti", "ti-cloud-up");

        const fileNameInput = document.createElement("input");
        fileNameInput.type = "text";
        fileNameInput.placeholder = "File name";
        fileNameInput.title = response.codeBlocks[i].code;

        switch (response.codeBlocks[i].type) {
            case "html": fileNameInput.value = `index${suffix}.html`; break;
            case "css": fileNameInput.value = `styles${suffix}.css`; break;
            case "javascript":
            case "js": fileNameInput.value = `script${suffix}.js`; break;
            case "python": fileNameInput.value = `script${suffix}.py`; break;
            case "java": fileNameInput.value = `Main${suffix}.java`; break;
            case "ruby": fileNameInput.value = `script${suffix}.rb`; break;
            case "php": fileNameInput.value = `script${suffix}.php`; break;
            case "sql": fileNameInput.value = `query${suffix}.sql`; break;
            case "c": fileNameInput.value = `program${suffix}.c`; break;
            case "cpp": fileNameInput.value = `program${suffix}.cpp`; break;
            case "bash": fileNameInput.value = `script${suffix}.sh`; break;
            case "swift": fileNameInput.value = `Main${suffix}.swift`; break;
            case "go": fileNameInput.value = `main${suffix}.go`; break;
            case "typescript": fileNameInput.value = `script${suffix}.ts`; break;
            case "r": fileNameInput.value = `script${suffix}.r`; break;
            case "matlab": fileNameInput.value = `script${suffix}.m`; break;
            case "kotlin": fileNameInput.value = `Main${suffix}.kt`; break;
            case "lua": fileNameInput.value = `script${suffix}.lua`; break;
            case "json": fileNameInput.value = `data${suffix}.json`; break;
            case "xml": fileNameInput.value = `data${suffix}.xml`; break;
            default: break;
        }

        trackFileButton.onclick = () => {
            alert("track " + fileNameInput.value)
        }

        untrackedFileDiv.appendChild(fileNameInput);

        response.codeBlocks[i].input = fileNameInput;

        allCodeBlocks.push(response.codeBlocks[i]);
    }

    // Append the grid container to the content div
    content.appendChild(mainContainer);

    // Styling the columns (auto-shrink for most columns, expand 'code' column)
    let style = document.createElement('style');

    document.head.appendChild(style);
}

chrome.runtime.sendMessage({ action: 'getHTML' }, (response) => getHTML(response));
