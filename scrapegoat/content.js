console.log("Adding Chrome listener");

function getXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';

    if (element.id) return `//*[@id="${element.id}"]`; // Fast lookup by ID

    let path = [];
    while (element.parentNode && element.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let siblings = Array.from(element.parentNode.children).filter(el => el.tagName === element.tagName);
        if (siblings.length > 1) {
            index = siblings.indexOf(element) + 1; // Get position among same tags
        }

        let tagName = element.tagName.toLowerCase();
        path.unshift(`${tagName}[${index}]`);
        element = element.parentNode;
    }

    return '/' + path.join('/');
}

function getElementByXPath(xpath) {
    let result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Inside Chrome listener");

    switch (request.action) {
        case "scrollToElement":
            console.log("scrollToElement: " + request.xPath);

            const element = getElementByXPath(request.xPath);
            element.parentElement.parentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            sendResponse({
                xPath: request.xPath
            });

            break;
        case "getHTML":
            console.log(new Date() + ": Sending response");
            const response = {
                codeBlocks: [...document.getElementsByTagName("code")]
                    .filter(x => x.className !== '' && x.className !== "!whitespace-pre")
                    .map(x => {
                        const split = x.className.split(' ');

                        return {
                            type: split[split.length - 1].replace("language-", ""),
                            code: x.innerText,
                            xPath: getXPath(x)
                        };
                    })
            }

            sendResponse(response);
            break;
        default:
            console.error("Unknown action: " + request.action);
            break;
    }
});
