let tabs = ['html'];
let currentTabIndex = 0;

let baseBaseUrl = `https://zrihfe7jqvlhlyrrh5lznnsbc40llfui.lambda-url.us-west-2.on.aws`;
baseBaseUrl = `https://localhost:7056`;

const baseUrl = `${baseBaseUrl}/api/iter9`;

function toggleBottomBar() {
    const section = document.getElementById("deploy-section");
    section.classList.toggle("zero-height");
    document.getElementById("expand").classList.toggle("fade");
    document.getElementById("collapse").classList.toggle("fade");
}

async function replaceContent(id, sourceId) {
    const btn = document.getElementById(id);

    let url = `${baseBaseUrl}/api/iter9/snapshots/${slug}/revision/resource`;
    url = `${baseUrl}/snapshots/${sourceId}/${fileName}`;

    const fileName = "index.html";
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });

    try {
        const resource = await response.text();

        const slug = document.getElementById("slugName").value;
        btn.innerText = resource.replace(`${slug}/`, "");
    } catch {
        btn.innerText = `=== ERROR loading ${sourceId}) ===`;
    }
}

async function pasteInto(id) {
    const btn = document.getElementById(id);
    const text = await navigator.clipboard.readText();

    btn.innerText = "Pasting...";
    btn.innerText = text;
}

async function setActive(id) {
    const quadrants = Array.from(document.getElementsByClassName("quadrant"));
    for (let i = 0; i < quadrants.length; i++) {
        if (quadrants[i].classList.contains("deploy")) {
            continue;
        }

        quadrants[i].style.display = quadrants[i].classList.contains(id) ? "grid" : "none";
    }

    const deployedButtons = Array.from(document.getElementsByClassName("deployed-button"));
    for (let i = 0; i < deployedButtons.length; i++) {
        if (deployedButtons[i].classList.contains("delete")) {
            continue;
        }

        deployedButtons[i].style.display = deployedButtons[i].classList.contains(id) ? "grid" : "none";
    }
}

async function list() {
    const slug = document.getElementById("slugName").value;

    const url = `${baseUrl}/list`;
    //const url = "https://localhost:7056/api/iter9/list";
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }); 6

    const list = await response.json();
    const log = document.getElementById("deployLog");
    log.innerHTML = "";

    for (let i = 0; i < list.length; i++) {
        let fullUrl = "/api/iter9/snapshots/" + list[i] + "/index.html";
        addActionRow(list[i], fullUrl);
    }
}

list();

async function deploy() {
    const btn = document.getElementById("deploy");

    document.getElementById("deploy").classList.toggle("fade");
    document.getElementById("deploying").classList.toggle("fade");

    document.getElementById("deploy-section").classList.remove("zero-height");

    const slug = document.getElementById("slugName").value;

    const htmlContent = document.getElementById('html').innerText;

    const snapshotModel = {
        slug: slug,
        files: {
            html: [htmlContent],
        }
    };

    const url = `${baseUrl}/snapshots`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshotModel),
    });

    const response2 = await response.json();
    const fullUrl = "/api/iter9/" + response2.key;

    addActionRow(response2.revision, fullUrl);

    document.getElementById("deploy").classList.toggle("fade");
    document.getElementById("deploying").classList.toggle("fade");
}

async function deleteAsync(sender, url) {
    const fudgedUrl = baseBaseUrl + url.split("/").slice(0, -1).join("/");
    await fetch(fudgedUrl, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    sender.parentElement.parentElement.removeChild(sender.parentElement);
}

async function addActionRow(fullName, fullUrl) {

    const slug = document.getElementById("slugName").value;
    const name = fullName.replace(`${slug}/`, "");

    const deployLog = document.getElementById('deployLog');

    const actionRow = `` +
        `<div class="deploy-log-row">` +
        `    <div class="deployed-button html" onclick="replaceContent('html', '${fullName}')">` +
        `        <i class="ti ti-file-type-html"></i>` +
        `    </div>` +
        `    <a class="deploy" style="display: grid; font-size: var(--font-size); margin-left: 24px; align-self: center; background-color: black; width: unset;" href="${fullUrl}" target="blank">${name}</a>` +
        `    <div class="deployed-button delete" onclick="deleteAsync(this, '${fullUrl}');">` +
        `        <i class="ti ti-trash"></i>` +
        `    </div>` +
        `</div>`.trim();

    deployLog.innerHTML = `${actionRow}\n${deployLog.innerHTML}`;
    setActive(tabs[currentTabIndex]);
}

async function pasteAndDeploy(id) {
    pasteInto(tabs[0]);
    deploy();
}

async function setDefaultContent() {
    const url = `${baseUrl}/defaults`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
    });

    const item = await response.json();

    // Set the default content in the text area
    document.getElementById('html').innerText = item.html;
}

setDefaultContent();
