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
const keyboard = document.getElementById("keyboard");
let word;
let definitions = [];

const X_ICON = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
         viewBox="0 0 16 16">
        <path
            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/>
    </svg>
`;

const get_word = () => {
    return new Promise((resolve) => {
        fetch("https://random-word-api.herokuapp.com/word")
            .then(res => res.json())
            .then((data) => {
                    resolve(data[0])
                }
            );
    });
}

const get_definition = (word) => {
    return new Promise((resolve, reject) => {
        fetch("https://api.dictionaryapi.dev/api/v2/entries/en/" + word)
            .then(res => res.json())
            .then((data) => {
                if (data['title'] === "No Definitions Found") {
                    reject("Definition not found");
                } else {
                    resolve(data[0]['meanings']);
                }
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
    new_alert.addEventListener("click",() => new_alert.remove());
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
        get_definition(word)
            .then((data) => {
                data.forEach(meaning => {
                    meaning['definitions'].forEach(definition => {
                        definitions.push(definition['definition']);
                    });
                });
                play_audio.disabled = false;
                define.disabled = false;
            })
            .catch(() => {
                return load_round();
            })
        ;
    })
};

const append_history = (word, correct) => {
    let new_record = document.createElement("li");
    new_record.classList.add("dropdown-item");
    if (!correct) {
        new_record.innerHTML += X_ICON +  "<s>" + input.value + "</s>";
    }
    new_record.setAttribute("word", word);
    new_record.innerHTML += " " + word;
    new_record.addEventListener("click", () => {
        get_definition(word).then(data => {
            data.forEach(meaning => {
                meaning['definitions'].forEach(definition => {
                    speak(definition['definition']);
                });
            });
        });
    })
    history.appendChild(new_record);
};

const handle_submission = () => {
    if (input.value.toLowerCase().trim() === word.toLowerCase().trim()) {
        flash("Correct! Good Job! You now have a new word", "primary");
        append_history(word, true);
        input.value = "";
        number_correct.innerText = (parseInt(number_correct.innerText) + 1).toString();
        load_round();
    } else {
        flash("Incorrect. The word was \"" + word + "\". Good try. You have a new word", "danger");
        append_history(word, false);
        input.value = "";
        number_incorrect.innerText = (parseInt(number_incorrect.innerText) + 1).toString();
        load_round();
    }
    accuracy.innerText = (parseInt(number_correct.innerText) / parseInt(round.innerText) * 100).toString() + "%";
    round.innerText = (parseInt(round.innerText) + 1).toString();
};

const init_keyboard = () => {
    [
        ["delete"],
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m"],
    ].forEach((row, index) => {
        let key_row = document.createElement("div");
        key_row.classList.add("key-row");
        key_row.classList.add("d-flex")
        if (index === 0) {
            key_row.classList.add("justify-content-end")
        } else {
            key_row.classList.add("justify-content-center")
        }
        row.forEach((letter) => {
            let key = document.createElement("button");
            key.classList.add("key");
            key.classList.add("btn");
            key.classList.add("btn-sm");
            key.classList.add("btn-outline-dark");
            key.classList.add("mx-1");
            key.classList.add("my-2");
            key.innerText = letter.toUpperCase();
            key.addEventListener("click", () => {
                if (letter === "delete") {
                    input.value = input.value.substring(0, input.value.length - 1)
                } else {
                    input.value += letter;
                }
            })
            key_row.appendChild(key);
        });
        keyboard.appendChild(key_row);
    })
};

play_audio.addEventListener("click", () => speak(word));

define.addEventListener("click", () => {
    definitions.forEach((definition) => speak(definition));
});

submit_btn.addEventListener("click", () => {
    handle_submission();
});

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handle_submission()
    }
})
init_keyboard();
load_round();

