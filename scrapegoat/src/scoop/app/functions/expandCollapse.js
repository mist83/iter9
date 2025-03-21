const expandCollapse = () => {
    const element = document.getElementById("project-title");
    element.onclick = () => {
        const folders = [...document.getElementsByClassName("folder")];

        let anyOpen = false;
        for (let i = 0; i < folders.length; i++) {
            const folderDiv = folders[i];
            anyOpen = folderDiv.children[1].style.display !== "none";

            if (anyOpen) {
                break;
            }
        }

        const allFileLists = document.querySelectorAll(".resource-list");
        allFileLists.forEach(list => {
            list.style.display = anyOpen ? "none" : "block";
        });
    }
}
