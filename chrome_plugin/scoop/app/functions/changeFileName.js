
const changeFileName = async (project, folder, fileName, newFileName) => {
    try {
        // Construct the PATCH request URL
        const url = `${urlBase}/${project}/${folder}/${fileName}?property=name&value=${encodeURIComponent(newFileName)}`;

        // Send the PATCH request
        const response = await fetch(url, {
            method: "PATCH",
        });

        // Parse and alert the result
        const result = await response.json();
        alert(`Name change result:\n${JSON.stringify(result, null, 2)}`);
    } catch (error) {
        alert(`Error changing code block name: ${error.message}`);
    }
};
