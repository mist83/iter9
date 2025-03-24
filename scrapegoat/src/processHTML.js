const createTrackedScrapeElement = (codeBlock, suffix) => {
    const template = document.getElementById("scraped-item-template");
    const clone = template.content.cloneNode(true);
    const fileDiv = clone.querySelector(".untracked-file");

    const fileNameInput = fileDiv.querySelector("input");
    const trackFileButton = fileDiv.querySelector(".track-file");

    // Set xPath and title
    fileDiv.dataset.xPath = codeBlock.xPath;
    fileNameInput.placeholder = "File name";
    fileNameInput.title = codeBlock.code;

    // Focus scroll event
    fileNameInput.addEventListener("focus", async () => {
        console.log("Input was focused!");

        await sendMessageToActiveTab({
            action: 'scrollToElement',
            xPath: codeBlock.xPath
        });
    });

    // Determine file name
    const type = codeBlock.type.toLowerCase();
    const fileNames = {
        html: `index${suffix}.html`, css: `styles${suffix}.css`,
        c: `main${suffix}.c`, cpp: `main${suffix}.cpp`, "c++": `main${suffix}.cpp`, cxx: `main${suffix}.cpp`,
        csharp: `class${suffix}.cs`, cs: `class${suffix}.cs`,
        java: `Main${suffix}.java`,
        javascript: `script${suffix}.js`, js: `script${suffix}.js`,
        json: `data${suffix}.json`, typescript: `script${suffix}.ts`, ts: `script${suffix}.ts`,
        python: `script${suffix}.py`, py: `script${suffix}.py`,
        php: `index${suffix}.php`, ruby: `script${suffix}.rb`, rb: `script${suffix}.rb`,
        swift: `main${suffix}.swift`, kotlin: `Main${suffix}.kt`, kt: `Main${suffix}.kt`,
        go: `main${suffix}.go`, golang: `main${suffix}.go`,
        rust: `main${suffix}.rs`, rs: `main${suffix}.rs`,
        bash: `script${suffix}.sh`, sh: `script${suffix}.sh`,
        sql: `query${suffix}.sql`, r: `script${suffix}.r`, perl: `script${suffix}.pl`, pl: `script${suffix}.pl`,
        lua: `script${suffix}.lua`, dart: `main${suffix}.dart`,
        scala: `Main${suffix}.scala`, "objective-c": `main${suffix}.m`, objc: `main${suffix}.m`, m: `main${suffix}.m`,
        haskell: `Main${suffix}.hs`, hs: `Main${suffix}.hs`,
        julia: `script${suffix}.jl`, elixir: `script${suffix}.ex`,
        fortran: `main${suffix}.f90`, f90: `main${suffix}.f90`, f95: `main${suffix}.f90`, f77: `main${suffix}.f90`,
        cobol: `program${suffix}.cbl`, cbl: `program${suffix}.cbl`,
        pascal: `program${suffix}.pas`, p: `program${suffix}.pas`,
        zsh: `script${suffix}.zsh`, assembly: `program${suffix}.asm`, asm: `program${suffix}.asm`,
        prolog: `program${suffix}.plg`, plg: `program${suffix}.plg`,
        smalltalk: `program${suffix}.st`, st: `program${suffix}.st`,
        fsharp: `script${suffix}.fs`, fs: `script${suffix}.fs`,
        lisp: `script${suffix}.lisp`, "common-lisp": `script${suffix}.lisp`, cl: `script${suffix}.lisp`,
        scheme: `script${suffix}.scm`, scm: `script${suffix}.scm`,
        racket: `script${suffix}.rkt`, rkt: `script${suffix}.rkt`,
        tcl: `script${suffix}.tcl`, ocaml: `script${suffix}.ml`, ml: `script${suffix}.ml`,
        j: `script${suffix}.ijs`, brainfuck: `program${suffix}.bf`, bf: `program${suffix}.bf`,
        xslt: `template${suffix}.xsl`, xsl: `template${suffix}.xsl`,
        yaml: `config${suffix}.yaml`, yml: `config${suffix}.yaml`
    };

    fileNameInput.value = fileNames[type] || `file${suffix}.txt`;

    // Click event
    trackFileButton.onclick = async () => {
        const fileName = fileNameInput.value;
        await saveFile(fileName, codeBlock);

        const checkIcon = document.createElement("i");
        checkIcon.classList.add("ti", "ti-check");
        trackFileButton.parentElement.prepend(checkIcon);

        fileDiv.classList.remove("untracked-file");
        fileDiv.classList.add("tracked-file");

        trackFileButton.remove();
    };

    // Return both DOM node and input for tracking
    return { fileDiv, fileNameInput };
};

const processHTML = async (response) => {
    console.log(`Inside ${nameof(processHTML)}`, response);

    const content = document.getElementById('code-scrape-screen');
    content.innerHTML = "";

    if (!response || response.codeBlocks.length === 0) return;

    const mainContainer = document.createElement('div');
    const gridContainer = document.createElement('div');
    mainContainer.appendChild(gridContainer);

    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = '1fr';
    gridContainer.style.width = '100%';
    gridContainer.style.gap = '8px';

    const fileCount = {};
    const codeBlocks = response.codeBlocks;
    for (let i = 0; i < codeBlocks.length; i++) {
        const codeBlock = codeBlocks[i];
        const type = codeBlock.type;

        let suffix = "";
        if (!fileCount[type]) {
            fileCount[type] = 1;
        } else {
            fileCount[type]++;
            suffix = `_${fileCount[type]}`;
        }

        const { fileDiv, fileNameInput } = createTrackedScrapeElement(codeBlock, suffix);
        gridContainer.appendChild(fileDiv);

        codeBlock.input = fileNameInput;
        allCodeBlocks.push(codeBlock);
    }

    content.appendChild(mainContainer);
    return codeBlocks.length > 0;
};

