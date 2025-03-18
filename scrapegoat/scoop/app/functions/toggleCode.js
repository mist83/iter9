document.getElementById("show-code-button").onclick = (e) => {
    const button = document.getElementById("show-code-button");

    const frame = document.getElementById("preview-frame");
    const editArea = document.getElementById("edit-area");

    fetch(frame.src)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text(); // Get the full HTML content
        })
        .then(html => {
            editArea.innerText = html;
        })
        .catch(error => console.error("Fetch error:", error));

    if (frame.style.display === "none") {
        frame.style.display = "grid"
        editArea.style.display = "none";

        document.getElementById("view-app-qr-button").style.display = "grid";
        document.getElementById("edit-save-button").style.display = "none";

        button.children[0].classList.remove("ti-eye");
        button.children[0].classList.add("ti-code");
    }
    else {
        frame.style.display = "none"
        editArea.style.display = "grid";

        document.getElementById("make-pwa").style.display = "grid";
        document.getElementById("view-app-qr-button").style.display = "none";

        button.children[0].classList.remove("ti-code");
        button.children[0].classList.add("ti-eye");
    };
}
