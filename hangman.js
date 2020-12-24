"use strict";
let can_play = true;
let words = [];

let to_guess = "";
let display_word = "";
let used_letters = "";
let wrong_guesses = 0;

let helpOn = false;

//const dictionary = "1000_parole_italiane_comuni.txt";
//const dictionary = "660000_parole_italiane.txt";
const dictionary = "words.txt";


function selectLetter(l) {

    if (!can_play || used_letters.indexOf(l) != -1) {
        return;
    }

    used_letters += l;
    setUsedLetter(l);

    let pos = to_guess.indexOf(l);
    if (pos != -1) {
        while (pos != -1) {
            const start_text = display_word.substring(0, pos);
            const end_text = display_word.substring(pos + 1, display_word.length);
            display_word = start_text + l + end_text;
            pos = to_guess.indexOf(l, pos + 1);
        }

        setSolution(display_word);

        if (display_word.indexOf("_") == -1) {
            // won
            setBanner("You win!");
            onTimesUp();
            can_play = false;
        }
    }
    else {
        // incortect letter guess
        wrong_guesses += 1;
        drawHangman(wrong_guesses);
        setErrorCounter(wrong_guesses);
        if (wrong_guesses == 10) {
            // lost
            const s = "You lost!<br>The word to be guessed was<br/>" + "\"" + to_guess + "\"";
            setBanner(s, "#444444", "#AAAAAA");
            onTimesUp();
            can_play = false;
        }
    }
}

function clear() {
    setSolution("");
    clearUsedLetters();
    clearHangman();
    wrong_guesses = 0;
    setErrorCounter(wrong_guesses);
}

function clearUsedLetters() {
    const el = document.getElementById("letters");
    const alphabet = "A B C D E F G H I J K L M N O P Q R S T U V W X Y Z";
    const alphabetList = alphabet.split(" ");
    let str = "";
    alphabetList.forEach(element => {
        str = `${str}<span id="char_${element}" class="char-on">${element}</span>`;
        if (element == "M") {
            str = str + "<br/>";
        }
    });
    el.innerHTML = str;
    used_letters = "";
}

function clearHangman() {
    for (let i = 1; i <= 10; i++) {
        const el_id = "svg_" + i;
        const el = document.getElementById(el_id);
        el.style.display = "none";
    }
}

function drawHangman(i) {
    const el = document.getElementById("svg_" + i);
    el.style.display = "inline";
}

function setUsedLetter(l) {
    console.log("Letter " + l);
    const el = document.getElementById("char_" + l);
    el.classList.remove("char-on");
    el.classList.add("char-off");
}

function setBanner(s, color = "rgb(244, 164, 96)", bkcolor = "rgb(46, 139, 87)") {
    const el = document.getElementById("info");
    el.innerHTML = s;
    el.style.color = color;
    el.style.background = bkcolor;
    el.style.display = "flex";
    //    setInterval(function () {
    //      el.style.display = "none";
    //   }, 7000);
}

function setErrorCounter(i) {
    const el = document.getElementById("errorCounter");
    el.innerHTML = "Errors: " + i;
}

function setSolution(s) {
    const el = document.getElementById("solution");
    el.innerHTML = s;
}

function createMask(m) {
    let mask = "";
    const word_lenght = m.length;
    for (let i = 0; i < word_lenght; i++) {
        mask += "_";
    }
    return mask;
}

function selectWord() {
    can_play = true;
    const random_number = Math.round(Math.random() * (words.length - 1));
    to_guess = words[random_number].toUpperCase();
    //console.log("TO GUESS: " + to_guess);
    display_word = createMask(to_guess);
    setSolution(display_word);
}

function reset() {
    onTimesUp();
    timePassed = 0;
    timeLeft = TIME_LIMIT;
    remainingPathColor = COLOR_CODES.info.color;
    startTimer();
    clear();
    selectWord();
}

function isLetter(str) {
    return str.length === 1 && str.match(/[A-Z]/i);
}

function main() {
    //    fetch('1000_parole_italiane_comuni.txt')
    fetch(dictionary)
        .then(response => response.text())
        .then(data => {
            // Do something with your data
            words = data.split(/\n/);
            //reset();
            document.addEventListener('keydown', function (evt) {
                const key = evt.key.toUpperCase();
                const keyCode = evt.code;
                console.log("KEYDOWN " + key);
                if (isLetter(key)) {
                    selectLetter(key);
                }

                if (keyCode == "F1") {
                    helpOn = !helpOn;
                    const help = document.getElementById("help");
                    if (helpOn) {
                        help.style.visibility = "visible";
                    } else {
                        help.style.visibility = "hidden";
                    }
                    evt.preventDefault();
                }

                if (keyCode == "F2") {
                    reset();
                }
            });
            const info = document.getElementById("info");
            info.addEventListener('click', function () {
                info.style.display = "none";
            });
            document.getElementById("app").innerHTML = `
            <div id="timer" class="base-timer">
              <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <g class="base-timer__circle">
                  <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
                  <path
                    id="base-timer-path-remaining"
                    stroke-dasharray="283"
                    class="base-timer__path-remaining ${remainingPathColor}"
                    d="
                      M 50, 50
                      m -45, 0
                      a 45,45 0 1,0 90,0
                      a 45,45 0 1,0 -90,0
                    "
                  ></path>
                </g>
              </svg>
              <span id="base-timer-label" class="base-timer__label">${formatTime(
                timeLeft
            )}</span>
            </div>
            `;
            const baseTimer = document.getElementById("timer");
            baseTimer.addEventListener("timesUp", function () {
                const s = "HAI PERSO!<br/>La parola da indovinare era<br/>" + "\"" + to_guess + "\"";
                setBanner(s, "#444444", "#AAAAAA");
                can_play = false;
            });
        });
}