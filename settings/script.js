const checkboxes = document.querySelectorAll(`input[type="checkbox"]`);
for (let i = 0; i < checkboxes.length; i++) {
    checkboxes[i].addEventListener("onclick", playPing);
}

function playPing() {
    const audio = document.querySelector(`audio[name="on2"]`);
    if(!audio) return;
    audio.currentTime = 0;
    audio.play();
}