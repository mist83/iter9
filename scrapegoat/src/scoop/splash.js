const tagLines = [
    "Has AI hit another moat? Ready to be the real GOAT?",
    "When you need to blame (or to steal credit)",
    "The scapegoat your code deserves, but not the one it needs right now",
    "Scrape smarter, not harder",
    "Manual? AI? ¿Por qué no los dos?",
    "Unlike a real goat, I'm not picky",
    "For when your code is so baa'aad that you need my help",
    "Like copy-paste, but evolved to stomach your code 4x",
    "A tool from your friendly neighborhood cyber ruminant",
    "Senior devs say 'that will take a while'. ScrapeGOAT says 'hold my hay'.",
    "Point. Click. Blame.",
    "Give your code a second set of eyes - weird, sideways ones",
    "Because your natural skills are already un-bleat-able.",
    "Need to quickly fill a portfolio for an interview? I've got your baaaack.",
    "Goats get really high when climbing. What do devs do while writing code?",
    "For when you're a coder as stubborn as a ... coder",
    "Turning messy prompts into delicious C(r)UD frontends since...now",
    "It’s not a bug, It’s a hoofprint",
    "It’s not hacked together, It’s *hoof-crafted*",
    "Don't follow best practices, Headbutt them",
    "Your AI sidekick, if your sidekick had horns and no chill. Or real ability.",
    "Works great, even when your codebase doesn’t.",
    "Be a GOAT without having to smell like a farm. Or a dev.",
    "The GOAT of 'just one more weekend project'.",
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
