(function () {
    // Create the modal elements
    const modalBackdrop = document.createElement("div");
    const modalContainer = document.createElement("div");
    const modalMessage = document.createElement("p");
    const modalButton = document.createElement("button");

    // Set up the modal styles
    modalBackdrop.style.position = "fixed";
    modalBackdrop.style.top = "0";
    modalBackdrop.style.left = "0";
    modalBackdrop.style.width = "100vw";
    modalBackdrop.style.height = "100vh";
    modalBackdrop.style.background = "rgba(0, 0, 0, 0.5)";
    modalBackdrop.style.display = "none";
    modalBackdrop.style.justifyContent = "center";
    modalBackdrop.style.alignItems = "center";
    modalBackdrop.style.zIndex = "1000";

    modalContainer.style.background = "var(--background-light)";
    modalContainer.style.padding = "20px";
    modalContainer.style.border = "1px solid var(--border-color)";
    modalContainer.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
    modalContainer.style.minWidth = "640px";
    modalContainer.style.maxWidth = "80%";
    modalContainer.style.textAlign = "center";
    modalContainer.style.alignSelf = "center";

    modalButton.textContent = "OK";
    modalButton.style.marginTop = "20px";
    modalButton.style.padding = "10px 20px";
    modalButton.style.background = "var(--primary-color)";
    modalButton.style.color = "var(--text-light)";
    modalButton.style.border = "none";
    modalButton.style.cursor = "pointer";

    modalButton.addEventListener("mouseover", () => {
        modalButton.style.background = "var(--primary-hover-background-color)";
        modalButton.style.color = "var(--primary-color-hover)";
    });

    modalButton.addEventListener("mouseout", () => {
        modalButton.style.background = "var(--primary-color)";
        modalButton.style.color = "var(--text-light)";
    });

    // Append elements
    modalContainer.appendChild(modalMessage);
    modalContainer.appendChild(modalButton);
    modalBackdrop.appendChild(modalContainer);
    document.body.appendChild(modalBackdrop);

    // Function to show modal
    function customAlert(msg) {
        modalMessage.textContent = msg;
        modalBackdrop.style.display = "flex";
    }

    // Function to close modal
    function closeModal() {
        modalBackdrop.style.display = "none";
    }

    modalBackdrop.addEventListener("click", closeModal);
    modalButton.addEventListener("click", closeModal);

    // Close modal on Escape key press
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    // Override window.alert
    window.alert = customAlert;
})();
