const renameFile = async (projectName, folderName, oldFileName, newFileName) => {
    try {
        const response = await fetch(`${urlBase}/${projectName}/${folderName}/${oldFileName}?newFileName=${encodeURIComponent(newFileName)}`, {
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
        alert(`Error renaming file: ${error.message}`);
    }
};
