const projectName = new URLSearchParams(window.location.search).get('project');
if (!projectName) {
    document.getElementById("sidebar").style.display = "none";
    document.getElementById("preview").style.display = "none";
    document.getElementById("qr-code-element").style.display = "none";
}
else {
    document.getElementById("grid").style.display = "none";
}

// Functionality wireup
expandCollapse();
toggleBackupFileVisibility();

if (projectName) {
    loadProject();
}
