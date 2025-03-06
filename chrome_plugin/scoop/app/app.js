document.getElementById("rename-project").onclick = async (sender) => {
    const projectTitle = document.getElementById("project-title").innerText;

    const newName = await prompt("Project name", projectTitle)
    if (!newName || newName === projectTitle) {
        return;
    }

    await renameProject(projectTitle, newName);

    const newUrl =
        window.location.href
            .replace(`?project=${projectTitle}`, `?project=${newName}`)
        ;

    await alert(newUrl);
    //    window.location.href = newUrl;
}

document.getElementById("edit-area").addEventListener("keyup", () => {
    document.getElementById("edit-save-button").style.display = "grid";
});

document.getElementById("edit-save-button").addEventListener("click", async () => {
    const content = document.getElementById("edit-area").innerText;

    const hackParts = document.getElementById("open-in-new-tab").innerText.split(' / ');
    const project = hackParts[0];
    const bucket = hackParts[1];
    const resource = hackParts[2];

    const url = `${urlBase}/${project}/${bucket}`;
    const body = {
        name: resource,
        content: content
    }

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(response => {
            //    return response.json();
        })
        .then(data => {
            const frame = document.getElementById("preview-frame");
            const src = frame.getAttribute("src");
            frame.setAttribute("src", src + (src.includes("?") ? "&" : "?") + "t=" + new Date().getTime());
        })

    document.getElementById("show-code-button").children[0].classList.remove("ti-code");
    document.getElementById("show-code-button").children[0].classList.add("ti-eye");

    document.getElementById("preview-frame").style.display = "grid"
    document.getElementById("edit-area").style.display = "none";
    document.getElementById("edit-save-button").style.display = "none";

    // TODO: this seems like it should be automatic and shown from the folder page
    document.getElementById("make-pwa").style.display = "none";

    document.getElementById("view-app-qr-button").style.display = "grid";
});

document.getElementById("edit-area").addEventListener("paste", (e) => {
    e.preventDefault(); // Stop the default paste behavior

    let text = (e.clipboardData || window.clipboardData).getData("text"); // Extract plain text

    // Insert text at cursor position
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    selection.deleteFromDocument(); // Remove any selected text
    selection.getRangeAt(0).insertNode(document.createTextNode(text));
});
