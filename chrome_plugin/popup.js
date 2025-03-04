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

        event.target.style.color = "var(--text-light)";
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

document.addEventListener("DOMContentLoaded", async function () {
    await fetchData("pomegranate");
});

const allCodeBlocks = [];

const saveAll = async (only) => {
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
    } catch (error) {
        alert(`Sorry!\n\nWe couldn't back up your code!\n\n${error}`);
    }
};

document.getElementById("view-dashboard").addEventListener("click", async () => {
    const items = document.getElementById("project-name").value.split('/');

    const projectName = items[0];
    const folderName = items[1];

    chrome.tabs.create({ url: `scoop/index.html?project=${projectName}&folderName=${folderName}` });
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

    const fileCount = {};
    for (let i = 0; i < response.codeBlocks.length; i++) {
        let suffix = "";

        codeBlockType = response.codeBlocks[i].type;

        if (!fileCount[codeBlockType]) {
            fileCount[codeBlockType] = 1;
        } else {
            fileCount[codeBlockType]++;
            suffix = `_${fileCount[codeBlockType]}`;
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

        const fileNameInput = document.createElement("input");
        fileNameInput.type = "text";
        fileNameInput.placeholder = "File name";
        fileNameInput.title = response.codeBlocks[i].code;

        switch (response.codeBlocks[i].type) {
            case "html": fileNameInput.value = `index${suffix}.html`; break;
            case "css": fileNameInput.value = `styles${suffix}.css`; break;
            case "c": fileNameInput.value = `main${suffix}.c`; break;
            case "cpp":
            case "c++":
            case "cxx": fileNameInput.value = `main${suffix}.cpp`; break;
            case "csharp":
            case "cs": fileNameInput.value = `class${suffix}.cs`; break;
            case "java": fileNameInput.value = `Main${suffix}.java`; break;
            case "javascript":
            case "js": fileNameInput.value = `script${suffix}.js`; break;
            case "json": fileNameInput.value = `data{suffix}.json`; break;
            case "typescript":
            case "ts": fileNameInput.value = `script${suffix}.ts`; break;
            case "python":
            case "py": fileNameInput.value = `script${suffix}.py`; break;
            case "php": fileNameInput.value = `index${suffix}.php`; break;
            case "ruby":
            case "rb": fileNameInput.value = `script${suffix}.rb`; break;
            case "swift": fileNameInput.value = `main${suffix}.swift`; break;
            case "kotlin":
            case "kt": fileNameInput.value = `Main${suffix}.kt`; break;
            case "go":
            case "golang": fileNameInput.value = `main${suffix}.go`; break;
            case "rust":
            case "rs": fileNameInput.value = `main${suffix}.rs`; break;
            case "bash":
            case "sh": fileNameInput.value = `script${suffix}.sh`; break;
            case "sql": fileNameInput.value = `query${suffix}.sql`; break;
            case "r": fileNameInput.value = `script${suffix}.r`; break;
            case "perl":
            case "pl": fileNameInput.value = `script${suffix}.pl`; break;
            case "lua": fileNameInput.value = `script${suffix}.lua`; break;
            case "dart": fileNameInput.value = `main${suffix}.dart`; break;
            case "scala": fileNameInput.value = `Main${suffix}.scala`; break;
            case "objective-c":
            case "objc":
            case "m": fileNameInput.value = `main${suffix}.m`; break;
            case "haskell":
            case "hs": fileNameInput.value = `Main${suffix}.hs`; break;
            case "julia": fileNameInput.value = `script${suffix}.jl`; break;
            case "elixir": fileNameInput.value = `script${suffix}.ex`; break;
            case "fortran":
            case "f90":
            case "f95":
            case "f77": fileNameInput.value = `main${suffix}.f90`; break;
            case "cobol":
            case "cbl": fileNameInput.value = `program${suffix}.cbl`; break;
            case "pascal":
            case "p": fileNameInput.value = `program${suffix}.pas`; break;
            case "zsh": fileNameInput.value = `script${suffix}.zsh`; break;
            case "assembly":
            case "asm": fileNameInput.value = `program${suffix}.asm`; break;
            case "prolog":
            case "plg": fileNameInput.value = `program${suffix}.plg`; break;
            case "smalltalk":
            case "st": fileNameInput.value = `program${suffix}.st`; break;
            case "fsharp":
            case "fs": fileNameInput.value = `script${suffix}.fs`; break;
            case "lisp":
            case "common-lisp":
            case "cl": fileNameInput.value = `script${suffix}.lisp`; break;
            case "scheme":
            case "scm": fileNameInput.value = `script${suffix}.scm`; break;
            case "racket":
            case "rkt": fileNameInput.value = `script${suffix}.rkt`; break;
            case "tcl": fileNameInput.value = `script${suffix}.tcl`; break;
            case "ocaml":
            case "ml": fileNameInput.value = `script${suffix}.ml`; break;
            case "j": fileNameInput.value = `script${suffix}.ijs`; break;
            case "brainfuck":
            case "bf": fileNameInput.value = `program${suffix}.bf`; break;
            case "xslt":
            case "xsl": fileNameInput.value = `template${suffix}.xsl`; break;
            default: fileNameInput.value = `file${suffix}.txt`; break;
        }

        const launchable = fileNameInput.value.indexOf(".html") !== -1;
        if (launchable && trackFileIcon.parentElement.backgroundColor === "yellow") {
            trackFileIcon.classList.add("ti", "ti-rocket");
        } else {
            trackFileIcon.classList.add("ti", "ti-cloud-up");
        }

        trackFileButton.onclick = async () => {
            const projectName1 = document.getElementById("project-name").value;
            const items = projectName1.split('/');

            const projectName = items[0];
            const folderName = items[1];
            const fileName = fileNameInput.value;

            await saveAll(fileName);
            trackFileButton.parentElement.style.backgroundColor = "yellow";

            if (launchable) {
                chrome.tabs.create({ url: `${urlBase}/${projectName}/${folderName}/${fileName}` });
            }
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
