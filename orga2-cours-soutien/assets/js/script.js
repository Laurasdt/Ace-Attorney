let pressedBtn = false;
let messageIndex = -1;

let isTyping = false;

let typeWriterInterval;

// Define the UI elements by their ID
const ui = {
    // Character identity UI
    nameBox: document.querySelector('#window_name'),
    dialogBox: document.querySelector('#window_message'),

    // Character UI
    character: document.querySelector('#character'),
    characterBox: document.querySelector('#characterbox'),
    bg: document.querySelector('#bg'),

    // Character name and dialog UI
    characterName: document.querySelector('#name'),
    dialog: document.querySelector('#dialog'),

    // Next button UI
    nextBox: document.querySelector('#nextbox'),
    nextButton: document.querySelector('#next_button'),
    arrowButton: document.querySelector('#arrow')
};

// Define the various audio files
const audios = {
    bgm: new Audio('assets/sfx/gumshoe.mp3'),
    next: new Audio('assets/sfx/bip.wav'),
    alert: new Audio('assets/sfx/lightbulb.wav'),
    shake: new Audio('assets/sfx/smack.wav'),
    male: new Audio('assets/sfx/male.wav'),
    female: new Audio('assets/sfx/female.wav')
};

// Define the scene, the various dialogues and the character expressions
const scene = [{
    character: 'tektiv',
    name: "Tektiv",
    expression: 'pumped',
    message: "${!}Bonjour je suis Tektiv, je recherche une ${!}${red}alternance${/} !",
    voice: audios.male
}, {
    character: 'tektiv',
    name: "Tektiv",
    expression: 'mad',
    message: "Je n'ai pas toujours, ${?}${red}c'est inadmissible${/} !",
    voice: audios.male
}, {
    character: 'maya',
    name: "Maya",
    expression: 'surprised',
    message: "Mais ce n'est pas normal !",
    voice: audios.female
}, {
    character: 'maya',
    name: "Maya",
    expression: 'pumped',
    message: "Tu mérites d'en avoir ${?}${red}au moins 100${/} !",
    voice: audios.female
}, {
    character: 'tektiv',
    name: "Tektiv",
    expression: 'disheartened',
    message: "${!}Pas vrai ? ...",
    voice: audios.male
}, {
    character: 'tektiv',
    name: "Wright",
    expression: 'thinking',
    message: "${blue}(Il n'a pas l'air d'avoir la pêche, le pauvre.)",
    voice: audios.male
}];

const numberOfEffects = {
    alert: 0,
    shake: 0
};

// Reset the next button UI to its default state
const resetUIButton = () => {
    ui.nextButton.classList.remove('pressBtn');
    ui.arrowButton.classList.remove('d-none');

    ui.nextButton.src = 'assets/img/ui/default_button.png';

    pressedBtn = false;
};

// Play the next button UI animation and play sound
const pressNextButton = () => {
    pressedBtn = true;

    ui.nextButton.classList.add('pressBtn');
    ui.arrowButton.classList.add('d-none');

    ui.nextButton.src = 'assets/img/ui/pressed_button.png';

    audios.next.currentTime = 0;
    audios.next.volume = 0.1;
    audios.next.play();
};

// Set the character sprite and expression
const setCharacter = (character, expression, isTalking = 0) => {
    const mode = isTalking ? 'talking' : 'silent';
    ui.character.src = `./assets/img/sprites/${character}/${mode}/${expression}.gif`;
};

// Show the next dialogue and hide the UI if there is no more dialogue
const showNextDialog = () => {
    if (messageIndex >= scene.length - 1) { // Hide the UI if there is no more dialogue
        messageIndex = -1; // Reset the message index

        // Hide the UI
        ui.dialogBox.classList.add('d-none');
        ui.nameBox.classList.add('d-none');

        // Reset the character name and dialogue
        ui.characterName.textContent = '';
        ui.dialog.innerHTML = '';
    } else { // Otherwise, show the next dialogue
        messageIndex++;

        ui.dialogBox.classList.remove('d-none');

        // Show the name box if the name is not null 
        if (ui.nameBox.classList.contains('d-none') && scene[messageIndex]?.name)
            ui.nameBox.classList.remove('d-none');
        else if (ui.nameBox.classList.contains('d-none') == false && scene[messageIndex]?.name == null)
            ui.nameBox.classList.add('d-none');

        // Print the character name and dialogue
        ui.characterName.textContent = scene[messageIndex]?.name;

        if (messageIndex >= 0) {
            numberOfEffects.alert = scene[messageIndex].message.split('${?}').length - 1;
            numberOfEffects.shake = scene[messageIndex].message.split('${!}').length - 1;
        }

        typeWriter(scene[messageIndex]);
    }
};

const nextCharactersAreEffects = (str, index) => {
    return str.substring(index, index + 4) === '${?}'
        || str.substring(index, index + 4) === '${!}';
};

const getEffect = (str, index) => {
    const substring = str.substring(index, index + 4);
    if (substring === '${!}') return 'shake';
    if (substring === '${?}') return 'alert';
    return null;
};

const handleEffect = (effect) => {
    if (numberOfEffects[effect] <= 0) return;
    numberOfEffects[effect]--;

    audios[effect].currentTime = 0;
    audios[effect].volume = 0.1;
    audios[effect].play();

    const element = effect === 'alert' ? ui.characterBox : ui.bg;
    element.classList.add(effect);
    setTimeout(() => {
        element.classList.remove(effect)
    }, 500);
};

const typeWriter = (currentScene) => {
    let index = 0;
    let printedMessage = '';

    if (typeWriterInterval)
        clearInterval(typeWriterInterval);

    isTyping = true;

    const isTalking = currentScene.name.toLowerCase() === currentScene.character
    setCharacter(currentScene.character, currentScene.expression, isTalking)

    currentScene.message = currentScene.message
        .replace(/\$\{(red|green|blue)\}/g, '<span class="$1">')
        .replace(/\$\{\/\}/g, '</span>');

    const message = currentScene.message?.trim();

    typeWriterInterval = setInterval(() => {
        if (index < message.length) {

            // Gérer les effets d'écrans
            if (nextCharactersAreEffects(message, index)) {
                const effect = getEffect(message, index);
                handleEffect(effect);
                index += 4;
            }

            if (message[index] === '<') {
                const closingTagIndex = message.indexOf('>', index);
                if (closingTagIndex !== -1) {
                    printedMessage += message.substring(index, closingTagIndex + 1);
                    index = closingTagIndex + 1;
                } else {
                    printedMessage += message[index];
                    index++;
                }
            } else {
                printedMessage += message[index];
                index++;
            }

            ui.dialog.innerHTML = printedMessage;
            if (index % 2 === 0) {
                currentScene.voice.currentTime = 0;
                currentScene.voice.volume = 0.1;
                currentScene.voice.play();
            }

        } else {
            clearInterval(typeWriterInterval);
            setCharacter(currentScene.character, currentScene.expression, 0)
            isTyping = false;
        }
    }, 40);
}

const displayFullMessage = () => {
    const currentScene = scene[messageIndex];
    const message = currentScene.message?.trim()?.replace(/\$\{[?!]\}/g, '');

    if (currentScene.message.includes('${?}')) {
        handleEffect('alert');
    } else if (currentScene.message.includes('${!}')) {
        handleEffect('shake');
    }

    ui.dialog.innerHTML = message;
    setCharacter(currentScene.character, currentScene.expression, 0);
}

ui.nextBox.addEventListener('click', () => {
    if (pressedBtn) return;

    // Play the background music if it is paused
    if (audios.bgm.paused) {
        audios.bgm.loop = true;
        audios.bgm.volume = 0.1;
        audios.bgm.play();
    }

    pressNextButton();

    if (isTyping) {
        clearInterval(typeWriterInterval);
        displayFullMessage();
        resetUIButton();
        isTyping = false;
    } else {
        setTimeout(() => {
            showNextDialog();
            resetUIButton();
        }, 100);
    }
});