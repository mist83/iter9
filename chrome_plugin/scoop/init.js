document.querySelectorAll('.todo').forEach(element => {
    element.addEventListener('click', function () {
        alert(this.title);
    });
});

document.querySelectorAll('.todo_c').forEach(element => {
    element.addEventListener('click', function () {
        confirm("Confirm: " + this.title);
    });
});

