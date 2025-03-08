(function () {
    window.shift = false;

    function updateShiftState(event) {
        window.shift = event.shiftKey;
        console.log(window.shift);
    }

    window.addEventListener("keydown", updateShiftState);
    window.addEventListener("keyup", updateShiftState);
})();
