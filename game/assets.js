import { Background, Character, IMG, Music, Sfx } from "../vnsutra_modules/asset-utils.js";

let witch_hut = new Background("backgrounds/witch_hut.jpeg");

let god = new Character({
    name: "Mithrandir",
    folder: "characters/Mithrandir",
    scale: isMobile ? 1.1 : 1.2
});

function getGreeting() {
    const currentHour = new Date().getHours();

    if (currentHour >= 5 && currentHour < 12) {
        return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 17) {
        return "Good Afternoon";
    } else if (currentHour >= 17 && currentHour < 21) {
        return "Good Evening";
    } else {
        return "Hello";
    }
}

let chars = {
    "Frodo": {
        char: new Character({
            name: "Frodo",
            folder: "characters/Snape",
            scale: isMobile ? 1 : 1.2
        }),
        intro: (lang) => {
            return `${getGreeting()}, fella. I am old man Frodo. I will be teaching you ${lang}`;
        },
        map: new Background("backgrounds/jungle1.jpeg")
    },
    "Maria": {
        char: new Character({
            name: "Maria",
            folder: "characters/Maria",
            scale: isMobile ? 1 : 1.2
        }),
        intro: (lang) => {
            return `${getGreeting()}, my dear. I am Maria. I will be helping you learn ${lang}`;
        },
        map: new Background("backgrounds/fantasy.jpeg")
    },
    "Prof. John Doe": {
        char: new Character({
            name: "Prof. John Doe",
            folder: "characters/JohnDoe",
            scale: isMobile ? 1 : 1.2
        }),
        intro: (lang) => {
            return `${getGreeting()}, student. I am Prof. John Doe. I will be assisting you in learning ${lang}`;
        },
        map: new Background("backgrounds/officee.jpeg")
    },
    "Amy": {
        char: new Character({
            name: "Amy",
            folder: "characters/Amy",
            scale: isMobile ? 1 : 1.2
        }),
        intro: (lang) => {
            return `${getGreeting()}, bestie. I am Amy. I will be helping you learn ${lang}`;
        },
        map: new Background("backgrounds/cafe.jpeg")
    }
};

let music = new Music("../assets/music/bgm2.mp3");

let correct = new Sfx("../assets/music/ma_soundsbyjw_the_brightest_alerts_and_notifications_1.wav");
let wrong = new Sfx("../assets/music/ma_soundsbyjw_the_brightest_alerts_and_notifications_2.wav");

god.loadOutfit("Casual");

Object.keys(chars).forEach(key => {
    chars[key].char.loadOutfit("Casual");
});

let obj = new IMG({ src: "../assets/images/144.png", scale: 0.5 });

let sounds = {
    wrong, correct
};

export { music, obj, god, witch_hut, sounds, chars };