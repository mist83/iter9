(() => {
    function tweaker() {
        const btn = document.createElement('button');
        btn.innerText = 'Tweak Site';
        btn.style.position = 'fixed';
        btn.style.bottom = '20px';
        btn.style.right = '20px';
        btn.style.zIndex = '9999';
        btn.style.padding = '10px 15px';
        btn.style.background = '#ff5733';
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.onclick = () => alert('todo: tweak');
        document.body.appendChild(btn);
    }

    localStorage.setItem('tweaker', `(${tweaker.toString()})();`);
})();
