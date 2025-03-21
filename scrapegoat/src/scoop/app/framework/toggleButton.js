const toggleButton = (element, func) => {
    const isToggled = element.children[0].style.display !== "none";

    if (func) {
        func(isToggled)
    }

    if (isToggled) {
        element.children[0].style.display = "none";
        element.children[1].style.display = "grid";
    } else {
        element.children[0].style.display = "grid";
        element.children[1].style.display = "none";
    }
}