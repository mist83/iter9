const toggleBackupFileVisibility = () => {
    element = document.getElementById("show-backup-file-toggle");

    element.onclick = () => toggleButton(element, (toggleState) => {
        toggleState = !toggleState;

        const backupItems = [...[...document.getElementsByClassName("backup")]];
        backupItems.forEach(x => {
            if (!toggleState) {
                x.classList.add("hide");
            }
            else {
                x.classList.remove("hide");
            }
        });
    });
}
