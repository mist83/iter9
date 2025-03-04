document.getElementById("view-app-qr-button").onclick = () => {
    const qrElement = document.getElementById("qr-code-element");
    qrElement.style.display = "grid";

    modal(qrElement);
};
