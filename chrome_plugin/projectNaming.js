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
    document.body.style.height = "44px";
};

setProjectName(localStorage.getItem("projectName"));
