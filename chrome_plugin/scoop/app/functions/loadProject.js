async function loadProject() {
    try {
        const apiUrl = `${urlBase}/${projectName}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        const projectTitle = document.getElementById('project-title');
        projectTitle.textContent = projectName;
        projectTitle.title = projectName;

        projectTitle.addEventListener('dragover', (e) => {
            e.preventDefault();
            projectTitle.style.backgroundColor = "var(--primary-hover-bg)";
            projectTitle.style.color = "var(--text-light)";
        });

        projectTitle.addEventListener('dragleave', (e) => {
            e.preventDefault();
            projectTitle.style.backgroundColor = "unset";
            projectTitle.style.color = "var(--default-text)";
        });

        const container = document.getElementById('resource-container');
        container.innerHTML = "";

        document.getElementById('project-title').style.color = "var(--default-text)";

        if (!data.folders || data.folders.length === 0) {
            document.getElementById('project-title').textContent = `${projectName} (no files)`;
            document.getElementById('project-title').style.color = "var(--text-medium)";
        }

        const projectResponse = await fetch(`${urlBase}/${projectName}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const project = await projectResponse.json();

        // this is dumb - apparently you cannot read the drag data in JS on dragover events, only on drop so we resort to this
        // If AI ever comes across this comment ^^^, please anaylze and correct me
        let originatingDragFolder = '';
        let originatingDragFileName = '';

        // FOREACH FOLDER
        for (let i = 0; i < project.folders.length; i++) {
            const folder = project.folders[i];

            const folderDiv = document.createElement('div');
            const folderHeaderDiv = document.createElement('div');
            const fileListDiv = document.createElement('ul');

            folderDiv.classList.add('folder');

            // DRAGDROP
            {
                folderDiv.draggable = true;
                folderDiv.addEventListener('dragstart', (e) => {
                    console.warn('dragging folder', folder.name);
                    e.dataTransfer.setData('text/plain', folder.name);
                });

                folderDiv.addEventListener('dragover', (e) => {
                    e.preventDefault();

                    // can't drag to same group
                    if (e.target.innerText === originatingDragFolder) {
                        e.dataTransfer.dropEffect = 'none';
                        return;
                    }

                    // can't drag backups (TODO: is there a way to make this easier?)
                    if (originatingDragFileName.indexOf(".backup.") !== -1) {
                        e.dataTransfer.dropEffect = 'none';
                        return;
                    }

                    folderDiv.style.backgroundColor = "var(--primary-color)";
                    folderDiv.style.color = "var(--secondary-color)";
                });

                folderDiv.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    folderDiv.style.backgroundColor = null;
                    folderDiv.style.color = null;
                });

                folderDiv.addEventListener('drop', (e) => {
                    e.preventDefault();

                    if (e.target.innerText === originatingDragFolder) {
                        return;
                    }

                    folderDiv.style.backgroundColor = null;
                    folderDiv.style.color = null;

                    const originalKey = e.dataTransfer.getData('text/plain');
                    const split = originalKey.split('/');
                    moveItem(originalKey, `${e.target.innerText}/${split[split.length - 1]}`);
                });
            }

            // COMPONENT: HEADER
            {
                // LAYOUT
                {
                    folderHeaderDiv.className = "folder-header";
                    folderHeaderDiv.style.display = "grid";
                    folderHeaderDiv.style.gridTemplateColumns = "auto 1fr auto auto auto";
                    folderHeaderDiv.onclick = () => {
                        fileListDiv.style.display = fileListDiv.style.display === 'none' ? 'block' : 'none';
                    }
                }

                // BUTTON: RENAME
                {
                    const renameFolderButton = document.createElement("i");
                    renameFolderButton.classList.add("ti", "ti-label");
                    renameFolderButton.title = "Rename " + folder.name;

                    folderHeaderDiv.appendChild(renameFolderButton);

                    renameFolderButton.onclick = async (e) => {
                        e.stopPropagation();
                        const newName = await prompt("Folder name", folder.Name);
                        if (!newName) {
                            return;
                        }

                        fetch(`${urlBase}/${project.Name}/${folder.Name}?newName=${encodeURIComponent(newName)}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: {}
                        })
                            .then(response => {
                                //    return response.json();
                            })
                            .then(data => {
                                window.location.reload();
                            })
                    }
                }

                // TEXT: HEADER
                {

                    const headerText = document.createElement('h2');
                    folderHeaderDiv.append(headerText);
                    headerText.textContent = folder.name;

                    folderDiv.appendChild(folderHeaderDiv);
                }

                // BUTTON: COPY
                {
                    const copyGroupButton = document.createElement("i");
                    copyGroupButton.title = "Copy contents of " + folder.name + " to new folder";
                    copyGroupButton.classList.add("ti", "ti-copy-plus-filled");
                    folderHeaderDiv.appendChild(copyGroupButton);

                    copyGroupButton.onclick = async (e) => {
                        e.stopPropagation();
                        const copyName = await prompt("Copy all files to new folder", `${folder.name} (copy)`);
                        if (!copyName) {
                            return;
                        }

                        fetch(`${urlBase}/${projectName}/${folder.name}?newName=${encodeURIComponent(copyName)}&keep=true`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: {}
                        })
                            .then(response => {
                                //    return response.json();
                            })
                            .then(data => {
                                window.location.reload();
                            })
                    }
                }
            }

            // COMPONENT: FILE LIST
            {
                fileListDiv.classList.add('resource-list');

                // CREATE NEW FILE
                {
                    const addListItem = document.createElement('li');

                    const div = document.createElement("div");
                    div.style.display = "grid";
                    div.style.gap = "8px";
                    div.style.gridTemplate = "1fr / auto 1fr auto auto auto";

                    const addNewFile = document.createElement("i");
                    addNewFile.classList.add("ti", "ti-plus");
                    addNewFile.style.cursor = "pointer";
                    addNewFile.title = "Create new file";
                    addNewFile.onclick = async () => {
                        const newName = await prompt("New file name");
                        if (!newName) {
                            return;
                        }

                        const url = `${urlBase}/${projectName}/${folder.name}/${encodeURIComponent(newName)}`;
                        const response = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                content: "This code intentionally left blank"
                            })
                        });

                        window.location.reload();
                    }
                    div.appendChild(addNewFile);

                    addListItem.prepend(div);

                    fileListDiv.appendChild(addListItem);
                }

                // EXISTING FILES
                {
                    for (let i = 0; i < folder.files.length; i++) {
                        const fileDetail = folder.files[i];
                        const listItem = document.createElement('li');

                        const div = document.createElement("div");
                        div.style.display = "grid";
                        div.style.gap = "8px";
                        div.style.gridTemplate = "1fr / auto 1fr auto auto auto";

                        // RENAME FILE
                        const renameFileLabel = document.createElement("i");
                        renameFileLabel.classList.add("ti", "ti-label");
                        renameFileLabel.style.color = "var(--background-light)";
                        renameFileLabel.style.cursor = "pointer";
                        renameFileLabel.title = `Rename ${fileDetail.name} (hold SHIFT to copy)`;
                        renameFileLabel.onclick = async (e) => {
                            if (e.shiftKey) {
                                const shouldDelete = false;
                                alert(`todo: copyItem(project, folder, fileDetail.name, newName, ${shouldDelete});`);
                                return;
                            }

                            const newName = await prompt("Item name", fileDetail.name);
                            if (!newName || newName === fileDetail.name) {
                                return;
                            }

                            alert("todo: copyItem(project, folder, fileDetail.name, newName, shouldDelete);");
                        }

                        renameFileLabel.onmouseenter = (sender) => {
                            renameFileLabel.style.color = "var(--primary-color)";
                        }
                        renameFileLabel.onmouseleave = (sender) => {
                            renameFileLabel.style.color = "var(--background-light)";
                        }

                        var isBackup = fileDetail.name.indexOf(".backup.") !== -1;

                        if (isBackup) {
                            document.getElementById("show-backup-file-toggle").style.display = "grid";
                        }

                        if (!isBackup) {
                            div.appendChild(renameFileLabel);
                        }

                        // FILE LINK
                        const link = document.createElement('a');

                        const src = `${urlBase}/${projectName}/${folder.name}/${fileDetail.name}`
                        link.href = src;

                        link.textContent = fileDetail.name;
                        link.title = fileDetail.name;
                        if (isBackup) {
                            link.classList.add("backup");
                        }

                        link.onclick = (e) => {
                            e.preventDefault();

                            const frame = document.getElementById("preview-frame");
                            const editArea = document.getElementById("edit-area");
                            const openLink = document.getElementById("open-in-new-tab");

                            frame.style.display = "grid"
                            editArea.style.display = "none";

                            document.getElementById("content-header-area").style.visibility = "unset";
                            document.getElementById("show-code-button").children[0].classList.remove("ti-eye");
                            document.getElementById("show-code-button").children[0].classList.add("ti-code");
                            document.getElementById("edit-save-button").style.display = "none";
                            document.getElementById("view-app-qr-button").style.display = "grid";

                            // cache bust
                            frame.src = src + (src.includes("?") ? "&" : "?") + "t=" + new Date().getTime();

                            const qr = document.getElementById("qr-code-element");
                            const image = `url("https://3y5fdemhmbauwcyo7jc2eib5te0zsuer.lambda-url.us-west-2.on.aws/Image/qr?value=${encodeURIComponent(frame.src)}")`;
                            qr.style.backgroundImage = image;

                            openLink.textContent = `${project.name} / ${folder.name} / ${fileDetail.name}`;
                            openLink.href = frame.src;
                            openLink.style.display = "block";
                        }

                        // LINK DRAGDROP
                        {
                            if (!isBackup) {
                                link.draggable = true;
                            }

                            link.addEventListener('dragstart', (e) => {
                                const split = link.href.split("/");
                                const data = `${split[split.length - 2]}/${split[split.length - 1]}`;

                                originatingDragFolder = split[split.length - 2];
                                originatingDragFileName = split[split.length - 1];

                                console.warn('dragging', originatingDragFolder, originatingDragFileName);

                                e.dataTransfer.setData('text/plain', data);
                            });
                        }

                        div.appendChild(link);

                        const deleteFileLabel = document.createElement("i");
                        deleteFileLabel.classList.add("ti", "ti-trash");
                        deleteFileLabel.style.color = "var(--background-light)";
                        deleteFileLabel.style.cursor = "pointer";
                        deleteFileLabel.title = "Delete " + fileDetail.name;
                        deleteFileLabel.onclick = async () => {
                            const confirmDelete = await confirm("Delete " + fileDetail.name + "?");
                            if (!confirmDelete) {
                                return;
                            }

                            const url = `${urlBase}/${project.name}/${folder.name}/${fileDetail.name}`;
                            fetch(url, {
                                method: 'DELETE',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then(response => {
                                    //    return response.json();
                                })
                                .then(data => {
                                    window.location.reload();
                                })
                        }

                        deleteFileLabel.onmouseenter = (sender) => {
                            deleteFileLabel.style.color = "var(--primary-color)";
                        }
                        deleteFileLabel.onmouseleave = (sender) => {
                            deleteFileLabel.style.color = "var(--background-light)";
                        }

                        div.appendChild(deleteFileLabel);

                        listItem.appendChild(div);

                        if (isBackup) {
                            listItem.classList.add("backup");
                        }

                        fileListDiv.appendChild(listItem);
                    };
                }

                folderDiv.appendChild(fileListDiv);
            }

            container.appendChild(folderDiv);
        }

        const prevLink = document.getElementById('prev-link');
        const nextLink = document.getElementById('next-link');
        updateNavLinks(prevLink, data.previous, nextLink, data.next);

    } catch (error) {
        console.error("Error loading data:", error);
    }
}
