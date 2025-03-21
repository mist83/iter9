(function () {
    // Create the modal elements
    const modalBackdrop = document.createElement("div");
    const modalContainer = document.createElement("div");
    const modalContent = document.createElement("div");
    const modalCloseButton = document.createElement("button");

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

    modalContainer.style.background = "var(--background-light, #fff)";
    modalContainer.style.padding = "20px";
    modalContainer.style.border = "1px solid var(--border-color, #ccc)";
    modalContainer.style.boxShadow = "0px 4px 10px rgba(0, 0, 0, 0.2)";
    modalContainer.style.minWidth = "320px";
    modalContainer.style.maxWidth = "80%";
    modalContainer.style.textAlign = "center";
    modalContainer.style.alignSelf = "center";
    modalContainer.style.position = "relative";
    modalContainer.style.borderRadius = "8px";
    modalContainer.style.overflow = "auto";

    modalContent.style.marginBottom = "20px";

    modalCloseButton.textContent = "Close";
    modalCloseButton.style.padding = "10px 20px";
    modalCloseButton.style.background = "var(--primary-color)";
    modalCloseButton.style.color = "var(--text-light, #fff)";
    modalCloseButton.style.border = "none";
    modalCloseButton.style.cursor = "pointer";
    modalCloseButton.style.borderRadius = "4px";

    modalCloseButton.addEventListener("mouseover", () => {
        modalCloseButton.style.color = "var(--primary-hover-color)";
        modalCloseButton.style.backgroundColor = "var(--primary-hover-background-color)";
    });

    modalCloseButton.addEventListener("mouseout", () => {
        modalCloseButton.style.background = "var(--primary-color)";
    });

    // Append elements
    modalContainer.appendChild(modalContent);
    modalContainer.appendChild(modalCloseButton);
    modalBackdrop.appendChild(modalContainer);
    document.body.appendChild(modalBackdrop);

    // Function to show modal with custom content
    function showModal(contentElement) {
        if (!(contentElement instanceof HTMLElement)) {
            console.error("showModal expects an HTML element as input.");
            return;
        }

        // Clear existing content and append new content
        modalContent.innerHTML = "";
        modalContent.appendChild(contentElement);

        modalBackdrop.style.display = "flex";
    }

    // Function to close modal
    function closeModal() {
        modalBackdrop.style.display = "none";
    }

    modalBackdrop.addEventListener("click", (event) => {
        if (event.target === modalBackdrop) {
            closeModal();
        }
    });

    modalCloseButton.addEventListener("click", closeModal);

    // Close modal on Escape key press
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    // Attach function to global scope
    window.modal = showModal;
})();
