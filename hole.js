
const searchInput = document.getElementById('hubSearch');
const voiceBtn = document.getElementById('voiceSearchBtn');

function filterCards(filterText) {
    let filter = filterText.toLowerCase();
    let cards = document.querySelectorAll('.hub-card');

    cards.forEach(function(card) {
        let title = card.querySelector('h3').textContent.toLowerCase();
        let desc = card.querySelector('p').textContent.toLowerCase();

        if (title.includes(filter) || desc.includes(filter)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

searchInput.addEventListener('input', function() {
    filterCards(this.value);
});

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'ta-IN'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    voiceBtn.addEventListener('click', function() {
        recognition.start();
        voiceBtn.classList.add('listening');
    });

    recognition.onresult = function(event) {
        const speechToText = event.results[0][0].transcript;
        const cleanText = speechToText.replace(/\.$/, ''); 
        
        searchInput.value = cleanText;
        filterCards(cleanText);
    };

    recognition.onspeechend = function() {
        recognition.stop();
        voiceBtn.classList.remove('listening');
    };

    recognition.onerror = function(event) {
        console.error("Voice error: ", event.error);
        voiceBtn.classList.remove('listening');
        alert("குரலை அடையாளம் காண முடியவில்லை. மீண்டும் முயற்சிக்கவும்!");
    };
} else {
    voiceBtn.style.display = 'none';
}