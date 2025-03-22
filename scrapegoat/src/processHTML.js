const processHTML = async (response) => {
    console.log(`Inside ${nameof(processHTML)}`, response);

    const content = document.getElementById('code-scrape-screen');
    content.innerHTML = "";

    if (!response || response.codeBlocks.length === 0) {
        return;
    }

    const mainContainer = document.createElement('div');

    const gridContainer = document.createElement('div');
    mainContainer.appendChild(gridContainer);
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = '1fr';
    gridContainer.style.width = '100%';
    gridContainer.style.gap = '8px';

    response.codeBlocks.reduce((acc, codeBlock) => {
        if (!acc[codeBlock.code.type]) {
            acc[codeBlock.code.type] = [];
        }
        acc[codeBlock.code.type].push(codeBlock);
        return acc;
    }, {});

    const fileCount = {};
    const codeBlocks = response.codeBlocks;
    console.log(codeBlocks);
    for (let i = 0; i < codeBlocks.length; i++) {
        const codeBlock = response.codeBlocks[i];
        codeBlockType = codeBlock.type;

        let suffix = "";
        if (!fileCount[codeBlockType]) {
            fileCount[codeBlockType] = 1;
        } else {
            fileCount[codeBlockType]++;
            suffix = `_${fileCount[codeBlockType]}`;
        }

        const fileDiv = document.createElement("div");
        gridContainer.appendChild(fileDiv);

        fileDiv.className = "untracked-file";
        fileDiv.style.display = "grid";
        fileDiv.style.gridTemplate = "1fr / auto 1fr";
        fileDiv.style.gap = "8px";

        const trackFileButton = document.createElement("i");
        {
            fileDiv.appendChild(trackFileButton);
            trackFileButton.classList.add("track-file");
            trackFileButton.title = "Track file";

            const trackFileIcon = document.createElement("i");
            trackFileButton.appendChild(trackFileIcon)
            trackFileIcon.classList.add("ti", "ti-cloud-up");
        }

        const fileNameInput = document.createElement("input");
        {
            fileDiv.appendChild(fileNameInput);
            fileNameInput.type = "text";
            fileDiv.dataset.xPath = response.codeBlocks[i].xPath;

            fileNameInput.placeholder = "File name";
            fileNameInput.title = response.codeBlocks[i].code;

            fileNameInput.addEventListener("focus", async () => {
                console.log("Input was focused!");

                await sendMessageToActiveTab({
                    action: 'scrollToElement',
                    xPath: response.codeBlocks[i].xPath
                });
            });
        }

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
            case "json": fileNameInput.value = `data${suffix}.json`; break;
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
            case "yaml":
            case "yml":
                fileNameInput.value = `config${suffix}.yaml`; break;
            default: fileNameInput.value = `file${suffix}.txt`; break;
        }

        trackFileButton.onclick = async () => {
            const fileName = fileNameInput.value;
            await saveFile(fileName, codeBlock);

            const trackFileIcon = document.createElement("i");
            trackFileButton.parentElement.prepend(trackFileIcon)
            trackFileIcon.classList.add("ti", "ti-check");

            trackFileButton.parentElement.classList.remove("untracked-file");
            trackFileButton.parentElement.classList.add("tracked-file");

            trackFileButton.parentElement.removeChild(trackFileButton);
        }

        response.codeBlocks[i].input = fileNameInput;

        allCodeBlocks.push(response.codeBlocks[i]);
    }

    // Append the grid container to the content div
    content.appendChild(mainContainer);

    return codeBlocks.length > 0;
}
