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
    'sugarcane', 'switch', 'Tahoma', 'tall', 'texas', 'thin', 'timothy', 'tifton',
    'tifway', 'turf', 'velvet', 'virginia', 'water', 'weeping', 'wheat', 'witch', 'yellow',
    'zeon', 'zoysia'
];

function randomizeProjectName(projectName) {
    if (!projectName) {
        var randomProjectName = projectNames[Math.floor(Math.random() * projectNames.length)];
        projectName = randomProjectName + "/" + (1000 + Math.floor(Math.random() * 10000));;
    }

    const validateInput = (target) => {
        const isValid = /^[a-zA-Z0-9_]+\/[a-zA-Z0-9_]+$/.test(target.value);
        if (!isValid) {
            target.style.color = "red";
            document.getElementById("graze-button").disabled = true;
            return;
        }

        document.getElementById("graze-button").disabled = false;
        localStorage.setItem("projectName", target.value);
    }

    document.getElementById("project-name").value = projectName;
    document.getElementById("project-name").oninput = (event) => {
        validateInput(event.target);
    }

    // should always work, we just set it programmatically
    validateInput(document.getElementById("project-name"))

    localStorage.setItem("projectName", projectName);
}

document.getElementById("randomize-pasture-name").onclick = (sender) => {
    randomizeProjectName();
}

document.getElementById("graze-button").onclick = (sender) => {
    document.getElementById("header-bar").style.display = "grid";
    document.getElementById("code-snippet-area").style.display = "grid";
    document.getElementById("close").style.display = "grid";
    document.getElementById("splash-screen").style.display = "none";

    document.getElementById("pasture-name").innerText = document.getElementById("project-name").value;
};

document.getElementById("close").onclick = (sender) => {
    document.getElementById("header-bar").style.display = "none";
    document.getElementById("code-snippet-area").style.display = "none";
    document.getElementById("splash-screen").style.display = "grid";
};

randomizeProjectName(localStorage.getItem("projectName"));
