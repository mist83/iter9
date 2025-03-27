const getFileIconClasses = (extension) => {
    switch (extension) {
        case "html":
            return ["ti", "ti-file-type-html"];
        case "css":
            return ["ti", "ti-file-type-css"];
        case "js":
        case "ts":
            return ["ti", "ti-file-type-js"];
        case "json":
            //return ["ti", "ti-file-type-json"]; // hallucination ugh
            return ["ti", "ti-file-check"];
        case "md":
            return ["ti", "ti-file-type-md"];
        case "txt":
            return ["ti", "ti-file-type-txt"];
        case "xml":
            return ["ti", "ti-file-type-xml"];
        case "yml":
        case "yaml":
            return ["ti", "ti-file-type-yml"];
        case "php":
            return ["ti", "ti-file-type-php"];
        case "py":
            return ["ti", "ti-file-type-py"];
        case "rb":
            return ["ti", "ti-file-type-rb"];
        case "java":
            return ["ti", "ti-file-type-java"];
        case "c":
            return ["ti", "ti-file-type-c"];
        case "cpp":
            return ["ti", "ti-file-type-cpp"];
        case "cs":
            return ["ti", "ti-file-code"];
        case "sh":
            return ["ti", "ti-file-type-sh"];
        case "sql":
            return ["ti", "ti-file-type-sql"];
        case "csv":
            return ["ti", "ti-file-type-csv"];
        case "pdf":
            return ["ti", "ti-file-type-pdf"];
        case "zip":
        case "rar":
            return ["ti", "ti-file-type-zip"];
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
        case "bmp":
        case "svg":
            return ["ti", "ti-file-type-image"];
        case "mp3":
        case "wav":
            return ["ti", "ti-file-type-audio"];
        case "mp4":
        case "mkv":
        case "webm":
            return ["ti", "ti-file-type-video"];

        default:
            return ["ti", "ti-file-alert"];
    }
}
