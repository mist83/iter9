function updateNavLinks(prevLink, prev, nextLink, next) {
    if (prev) {
        prevLink.textContent = prev;
        document.getElementById('prev-link').href = `?project=${prev}`;
    }
    if (next) {
        nextLink.textContent = next;
        document.getElementById('next-link').href = `?project=${next}`;
    }
}
