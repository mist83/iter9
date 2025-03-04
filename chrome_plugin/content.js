chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case "getHTML":
            console.log(new Date() + ": Sending response");
            const response = {
                codeBlocks: [...document.getElementsByTagName("code")]
                    .filter(x => x.className !== '' && x.className !== "!whitespace-pre")
                    .map(x => {
                        const split = x.className.split(' ');

                        return {
                            type: split[split.length - 1].replace("language-", ""),
                            code: x.innerText
                        };
                    })
            }

            console.log(response);

            sendResponse(response);
            break;
        case "genericAction":
            console.log(new Date() + ": generic request to content.js");
            break;
        default:
            console.error("Unknown action: " + request.action);
            break;
    }
});
