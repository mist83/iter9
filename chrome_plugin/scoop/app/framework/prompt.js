(function () {
    // Create the modal elements
    const modalBackdrop = document.createElement("div");
    const modalContainer = document.createElement("div");
    const modalMessage = document.createElement("p");
    const modalInput = document.createElement("input");
    const modalButtonContainer = document.createElement("div"); // Container for buttons
    const modalButtonOK = document.createElement("button");
    const modalButtonCancel = document.createElement("button");

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
    modalContainer.style.minWidth = "400px";
    modalContainer.style.maxWidth = "80%";
    modalContainer.style.textAlign = "center";
    modalContainer.style.alignSelf = "center";

    modalInput.style.width = "90%";
    modalInput.style.padding = "10px";
    modalInput.style.marginTop = "10px";
    modalInput.style.border = "1px solid var(--border-color)";
    modalInput.style.outline = "none";

    // Button container (Grid Layout)
    modalButtonContainer.style.display = "grid";
    modalButtonContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    modalButtonContainer.style.gap = "10px";
    modalButtonContainer.style.marginTop = "20px";

    modalButtonOK.textContent = "OK";
    modalButtonOK.style.padding = "10px 20px";
    modalButtonOK.style.background = "var(--primary-color)";
    modalButtonOK.style.color = "var(--text-light)";
    modalButtonOK.style.border = "none";
    modalButtonOK.style.cursor = "pointer";

    modalButtonCancel.textContent = "Cancel";
    modalButtonCancel.style.padding = "10px 20px";
    modalButtonCancel.style.background = "#ccc";
    modalButtonCancel.style.border = "none";
    modalButtonCancel.style.cursor = "pointer";

    // Append elements
    modalButtonContainer.appendChild(modalButtonOK);
    modalButtonContainer.appendChild(modalButtonCancel);
    modalContainer.appendChild(modalMessage);
    modalContainer.appendChild(modalInput);
    modalContainer.appendChild(modalButtonContainer);
    modalBackdrop.appendChild(modalContainer);
    document.body.appendChild(modalBackdrop);

    // Function to show modal and return input value
    function customPrompt(message, defaultValue = "") {
        return new Promise((resolve) => {
            modalMessage.textContent = message;
            modalInput.value = defaultValue;
            modalBackdrop.style.display = "flex";
            modalInput.focus();
            modalInput.select();

            function closePrompt(value) {
                modalBackdrop.style.display = "none";
                modalButtonOK.removeEventListener("click", onConfirm);
                modalButtonCancel.removeEventListener("click", onCancel);
                resolve(value);
            }

            function onConfirm() {
                closePrompt(modalInput.value);
            }

            function onCancel() {
                closePrompt(null);
            }

            modalButtonOK.addEventListener("click", onConfirm);
            modalButtonCancel.addEventListener("click", onCancel);
            modalBackdrop.addEventListener("click", onCancel);
            modalContainer.addEventListener("click", (event) => {
                event.stopPropagation(); // Prevents clicks inside the modal from closing it
            });
        });
    }

    // Override window.prompt
    window.prompt = async function (message, defaultValue) {
        return await customPrompt(message, defaultValue);
    };
})();
