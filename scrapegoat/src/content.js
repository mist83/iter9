console.log("Adding Chrome listener");

const peepUrl = "https://localhost:7118/api/peep";
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
        case "downloadImage": {
            chrome.downloads.download({
                url: request.url,
                filename: request.fileName
            }, function (downloadId) {
                sendResponse({
                    success: true,
                    downloadId: downloadId
                });
            });

            return true;
        }
        case "downloadAllImages": {
            sendResponse({ status: "Images are being downloaded" });
            const images = Array.from(document.querySelectorAll('img')).slice(2);

            images.forEach(async (img, index) => {
                const order = index + 1;

                // retrieve every time - CANNOT CACHE THIS!!!
                const fullUrl = window.location.href;
                const chatId = fullUrl.substring(fullUrl.lastIndexOf('/') + 1);

                // download the image
                setTimeout(() => {
                    const src = img.src;
                    chrome.runtime.sendMessage({
                        action: 'downloadImage',
                        url: src,
                        fileName: chatId + "_" + order + ".webp"
                    });
                }, index * 100);

                // create a record of it
                await fetch(peepUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: chatId + "_image_" + order,
                        chat: chatId,
                        type: "webp",
                        order: order,
                        content: img.alt,
                    })
                });
            });

            sendResponse({ status: "Code blocks are being downloaded" });
            const codeBlocks = Array.from(document.querySelectorAll("pre div div code"));
            codeBlocks.forEach(async (code, index) => {
                return;

                const order = index + 1;

                // retrieve every time - CANNOT CACHE THIS!!!
                const fullUrl = window.location.href;
                const chatId = fullUrl.substring(fullUrl.lastIndexOf('/') + 1);

                let content = code.innerText;

                let type = code.classList[code.classList.length - 1].split('-')[1];
                if (type == "json") {
                    try {
                        content = JSON.stringify(JSON.parse(content), null, 0);
                    } catch {
                        type = "unknown";
                    }
                }

                await fetch(peepUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: chatId + "_data_" + order,
                        chat: chatId,
                        order: order,
                        type: type,
                        content: content
                    })
                });
            });

            break;
        }
        default:
            console.error("Unknown action: " + request.action);
            break;
    }
});
