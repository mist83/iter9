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
    'tifway', 'tifTuf', 'turf-type', 'velvet', 'virginia', 'water', 'weeping', 'wheat',
    'witch', 'yellow', 'zeon', 'zoysia'
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

document.getElementById("randomize").onclick = (sender) => {
    if (!confirm("Randomize project name?")) {
        return;
    }

    setProjectName();

    sender.target.parentElement.style.display = "none";
    document.getElementById("close").style.display = "grid";
};

document.getElementById("close").onclick = (sender) => {
    sender.target.parentElement.style.display = "none";
    document.getElementById("randomize").style.display = "grid";
};

setProjectName(localStorage.getItem("projectName"));
