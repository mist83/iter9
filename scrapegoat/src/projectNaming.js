// Do you need a POC to prove that the grass is greener when you let AI rewrite it? Choose from one of these pastures.
const projectNames = [
    'alkali', 'arizona', 'bahia', 'banner', 'barnyard', 'beaked', 'bent', 'big', 'bluejoint',
    'bluestem', 'brome', 'buffalo', 'buffel', 'bulbous', 'canada', 'carpet', 'celebration',
    'chewings', 'colonial', 'couch', 'crab', 'creeping', 'crowfoot', 'dallis', 'dawson',
    'desert', 'dogtooth', 'durar', 'el', 'empire', 'fall', 'field', 'fine', 'florida',
    'foxtail', 'geo', 'giant', 'goose', 'green', 'gulf', 'hairy', 'hard', 'highland',
    'houndstongue', 'hybrid', 'indian', 'innovation', 'jamestown', 'japanese', 'johnson',
    'kentucky', 'korean', 'latitude', 'lehmann', 'little', 'love', 'maiden', 'manila',
    'marsh', 'meadow', 'meyer', 'miscanthus', 'mountain', 'napier', 'nevada', 'northbridge',
    'orchard', 'palisades', 'panic', 'paspalum', 'pennington', 'perennial', 'plains',
    'prairie', 'princess', 'purpletop', 'quack', 'red', 'reed', 'rescue', 'rhodes',
    'rough', 'rye', 'sahara', 'saint', 'salt', 'sand', 'scribner', 'seashore', 'sheep',
    'sharpblue', 'sideoats', 'signal', 'silver', 'slender', 'slough', 'spike', 'suborbital',
    'sugarcane', 'switch', 'tahoma', 'tall', 'texas', 'thin', 'timothy', 'tifton',
    'tifway', 'turf', 'velvet', 'virginia', 'water', 'weeping', 'wheat', 'witch', 'yellow',
    'zeon', 'zoysia'
];

function setupSplashScreen() {
    const splashHeaderLink = document.getElementById("splash-header");
    splashHeaderLink.setAttribute("tabindex", "-1");

    const projectNameInput = document.getElementById("project-name");
    projectNameInput.value = localStorage.getItem("projectName");
    projectNameInput.oninput = (event) => {
        validateInput(event.target);
    }

    const grazeButton = document.getElementById("graze-button");
    grazeButton.setAttribute("tabindex", "2");
    grazeButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            const projectName = localStorage.getItem("projectName");
            localStorage.setItem("activeProjectName", projectName);

            launchProject();
        }
    });

    const randomizePastureNameButton = document.getElementById("randomize-pasture-name");
    randomizePastureNameButton.setAttribute("tabindex", "3");
    randomizePastureNameButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            randomizePastureName();
        }
    });
}

function launchProject() {
    const fullPastureName = localStorage.getItem("activeProjectName");
    if (!fullPastureName) {
        return;
    }

    document.getElementById("pasture-name").innerText = fullPastureName;
    const parts = fullPastureName.split('/');
    const pastureName = parts[0];
    document.getElementById("pasture-name").href = `/scoop/index.html?project=${pastureName}`;

    document.getElementById("splash-screen").style.display = "none";
    document.getElementById("header-bar").style.display = "grid";
    document.getElementById("code-scrape-screen").style.display = "grid";
}

const validateInput = (target) => {
    const isValid = /^[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+$/.test(target.value);
    if (!isValid) {
        target.style.color = "red";
        document.getElementById("graze-button").disabled = true;
        console.error("INVALID!");

        return;
    }

    console.log("VALID!");
    target.style.color = null;

    localStorage.setItem("projectName", target.value);
    document.getElementById("graze-button").disabled = false;
}

const randomizePastureName = () => {
    const projectName = projectNames[Math.floor(Math.random() * projectNames.length)] + "/" + Math.floor(1000 + Math.random() * 9000);
    document.getElementById("project-name").value = projectName;

    // should always work, we just set it programmatically
    validateInput(document.getElementById("project-name"))
}

document.getElementById("randomize-pasture-name").onclick = () => {
    randomizePastureName();
}



document.getElementById("graze-button").onclick = (sender) => {
    document.getElementById("header-bar").style.display = "grid";
    document.getElementById("code-scrape-screen").style.display = "grid";
    document.getElementById("splash-screen").style.display = "none";

    const pastureName = document.getElementById("project-name").value;
    document.getElementById("pasture-name").innerText = pastureName;
    localStorage.setItem("projectName", pastureName);
    localStorage.setItem("activeProjectName", pastureName);
};

const navigate = (url) => {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

}

document.getElementById("settings-button").onclick = (sender) => {
    document.getElementById("splash-screen").style.display = "none";
    document.getElementById("settings-screen").style.display = "grid";
};

document.getElementById("back-button").onclick = (sender) => {
    document.getElementById("splash-screen").style.display = "grid";
    document.getElementById("settings-screen").style.display = "none";
};

document.getElementById("splash-launch").onclick = (sender) => {
    navigate("scoop/index.html");
};

document.getElementById("close-pasture").onclick = (sender) => {
    document.getElementById("header-bar").style.display = "none";
    document.getElementById("code-scrape-screen").style.display = "none";
    document.getElementById("splash-screen").style.display = "grid";
    document.getElementById("project-name").value = document.getElementById("pasture-name").innerText;

    localStorage.setItem("projectName", localStorage.getItem("projectName"));
    localStorage.removeItem("activeProjectName");
};

setupSplashScreen();
launchProject();
