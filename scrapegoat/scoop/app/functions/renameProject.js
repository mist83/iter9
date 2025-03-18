const renameProject = async (oldProjectName, newProjectName) => {
    try {
        const response = await fetch(`${urlBase}/${oldProjectName}?newProjectName=${encodeURIComponent(newProjectName)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            await alert(`HTTP error! Status: ${response.status}`);
        }
    } catch (error) {
        await alert(`Error renaming project: ${error.message}`);
    }
}
