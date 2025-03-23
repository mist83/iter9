const urlBase = localStorage.getItem("scrapegoat:url") + "/iter9";

document.addEventListener("DOMContentLoaded", async function () {
    const grid = document.getElementById("grid");
    try {
        const response = await fetch(`${urlBase}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const items = await response.json();
        grid.innerHTML = ""; // Clear existing content

        items.forEach(id => {
            const item = document.createElement("div");
            item.classList.add("grid-item");
            item.textContent = id;

            // Redirect on click
            item.addEventListener("click", () => {
                window.location.href = `index.html?project=${id}`;
            });

            grid.appendChild(item);
        });
    } catch (error) {
        console.error("Error loading data:", error);
        grid.innerHTML = "<p>Failed to load content.</p>";
    }
});
