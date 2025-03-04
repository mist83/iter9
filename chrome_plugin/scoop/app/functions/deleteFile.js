const deleteFile = async (project, folder, fileName) => {
    try {
        const url = `${urlBase}/${project}/${folder}/${fileName}`;
        const response = await fetch(url, {
            method: "DELETE",
        });

        const result = await response.json();
        alert(`Delete result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
        alert(`Error deleting code block: ${error.message}`);
    }
};
