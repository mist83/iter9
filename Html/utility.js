console.log("Loaded utility.js (hook for finding console debugging)");

function findInlineStyles() {
    const inlineStyles = {};
    const allElements = document.querySelectorAll('*');

    let i = 0;
    for (let element of allElements) {
        if (element.getAttribute('style')) {

            const id = element.id|| "unknown_"+(i++);
            inlineStyles[element.id] = element.getAttribute('style');
        }
    }

    return inlineStyles;
}
