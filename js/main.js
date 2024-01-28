const submit_btn = document.getElementById("submit-btn");
const input = document.getElementById("input");
const play_audio = document.getElementById("play-audio");
const define = document.getElementById("define");
const alerts = document.getElementById("alerts");
const number_correct = document.getElementById("number-correct");
const number_incorrect = document.getElementById("number-incorrect");
const accuracy = document.getElementById("accuracy");
const round = document.getElementById("round-number");
const history = document.getElementById("history");
let word;
let definitions = [];

const X_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-lg"
         viewBox="0 0 16 16">
        <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
    </svg>
`;

const get_word = () => {
    return new Promise((resolve, reject) => {
        fetch("https://random-word-api.herokuapp.com/word")
            .then(res => res.json())
            .then((data) => {
                    resolve(data[0])
                }
            );
    });
}

const get_definition = () => {
    return new Promise((resolve, reject) => {
        fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
            .then(res => res.json())
            .then((data) => {
                resolve(data);
            }
        );
    });
}

const flash = (message, type) => {
    let new_alert = document.createElement("div");
    new_alert.classList.add("alert");
    new_alert.classList.add("mt-3");
    new_alert.classList.add("alert-" + type);
    new_alert.innerText = message;
    alerts.appendChild(new_alert);
    setTimeout(() => {
        new_alert.remove();
    }, 8000);
};

const speak = (message) => {
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
    }
    let utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.7;
    speechSynthesis.speak(utterance);
}

const load_round = () => {
    play_audio.disabled = true;
    define.disabled = true;
    definitions = [];
    get_word().then(data => {
        word = data;
        get_definition().then((data) => {
            if (data['title'] === "No Definitions Found") {
                return load_round();
            }
            data[0]['meanings'].forEach(meaning => {
                meaning['definitions'].forEach(definition => {
                    definitions.push(definition['definition']);
                });
            });
            play_audio.disabled = false;
            define.disabled = false;
        });
    })
};

const append_history = (word, correct) => {
    let new_record = document.createElement("li");
    new_record.classList.add("dropdown-item");
    if (!correct) {
        new_record.innerHTML += X_ICON;
        new_record.classList.add("disabled")
    }
    new_record.innerHTML += " " + word;
    history.appendChild(new_record);
}

play_audio.addEventListener("click", (e) => speak(word));

define.addEventListener("click", (e) => {
    definitions.forEach((definition) => speak(definition));
});


submit_btn.addEventListener("click", (e) => {
    if (input.value.toLowerCase().trim() === word.toLowerCase().trim()) {
        flash("Correct! Good Job! You now have a new word", "primary");
        append_history(word, true);
        input.value = "";
        number_correct.innerText = (parseInt(number_correct.innerText) + 1).toString();
        load_round();
    } else {
        flash("Incorrect. The word was \"" + word + "\". Good try. You have a new word", "danger");
        append_history("<s>" + input.value + "</s>\n" + word, false);
        input.value = "";
        number_incorrect.innerText = (parseInt(number_incorrect.innerText) + 1).toString();
        load_round();
    }
    accuracy.innerText = (parseInt(number_correct.innerText) / parseInt(round.innerText) * 100).toString() + "%";
    round.innerText = (parseInt(round.innerText) + 1).toString();
});

load_round();


