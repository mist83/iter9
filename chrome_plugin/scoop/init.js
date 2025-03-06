document.querySelectorAll('.todo').forEach(element => {
    element.addEventListener('click', function () {
        alert(this.title);
    });
});
