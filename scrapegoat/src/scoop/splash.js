const tagLines = [
    "Has AI hit another moat? Ready to be the real GOAT?",
    "When you need to blame (or to steal credit)",
    "It's the scapegoat your code deserves, but not the one it needs right now",
    "Scrape smarter, not harder",
    "Manual? AI? ¿Por qué no los dos?",
    "For when your code is so baa'aad that you need my help",
    "Like copy-paste, but evolved to stomach your code 4x",
    "A tool from your friendly neighborhood cyber ruminant",
    "Senior devs say 'can't', ScrapeGOAT says 'hold my hay'",
    "Point. Click. Blame.",
    "For when you're a coder as stubborn as a ... coder",
    "Turning messy prompts into delicious C(r)UD frontends since...now",
    "It’s not a bug, It’s a hoofprint",
    "It’s not hacked together, It’s *hoof-crafted*",
    "Don't follow best practices, Headbutt them",
];

window.addEventListener('DOMContentLoaded', () => {
    const taglineElement = document.getElementById('splash-header');

    function updateTagline() {
        const randomIndex = Math.floor(Math.random() * tagLines.length);
        taglineElement.title = tagLines[randomIndex];
    }

    // Show the first one immediately
    updateTagline();
    setInterval(updateTagline, 1000);
});
