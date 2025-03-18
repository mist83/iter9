const renameFolder = async (projectName, oldFolderName, newFolderName) => {
    try {
        const response = await fetch(`${urlBase}/${projectName}/${oldFolderName}?newFolderName=${encodeURIComponent(newFolderName)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            alert(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        alert(`Error renaming folder: ${error.message}`);
    }
}
