(() => {
    const key = 'tweaker';
    const script = localStorage.getItem(key);
    if (script) {
        eval(script);
    } else {
        console.warn(`No script found in localStorage under key: ${key}`);
    }
})();
