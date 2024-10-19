let iter = 0;

document.addEventListener('DOMContentLoaded', () => {
    setInterval(() => {
        document.getElementById('iter').style.fontSize = [48, 96][iter++ % 2] + "px";
    }, 400);
});
