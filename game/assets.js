import { Background, Character, IMG, Music, Sfx } from "../vnsutra_modules/asset-utils.js";

let futon_room = new Background("backgrounds/Noraneko_Background_Pack_1/Futon_Room.png");
let portal = new Background("backgrounds/portal.jpg");
let witch_hut = new Background("backgrounds/witch_hut.jpeg");
let apartment_ext = new Background("backgrounds/Noraneko_Background_Pack_1/Apartment_Exterior.png");

let mary = new Character({
    name: "Mary",
    folder: "characters/Rin",
    scale: isMobile ? 1 : 1.5
});

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
    // "Kenny": {
    //     char: new Character({
    //         name: "Kenny",
    //         folder: "characters/Kenny",
    //         scale: isMobile ? 1 : 1.2
    //     })
    // },
    "Prof. John Doe": {
        char: new Character({
            name: "JohnDoe",
            folder: "characters/JohnDoe",
            scale: isMobile ? 1 : 1.2
        }),
        intro: (lang) => {
            return `${getGreeting()}, student. I am Prof. John Doe. I will be assisting you in learning ${lang}`;
        },
        map: new Background("backgrounds/officee.jpeg")
    },
    // "Walter": {
    //     char: new Character({
    //         name: "Walter",
    //         folder: "characters/Walter",
    //         scale: isMobile ? 1 : 1.2
    //     })
    // },
    "Snape": {
        char: new Character({
            name: "Snape",
            folder: "characters/Snape",
            scale: isMobile ? 1 : 1.2
        }),
        intro: (lang) => {
            return `${getGreeting()}, fella. I am old man Snape. I will be teaching you ${lang}`;
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
    // "Aragon": {
    //     char: new Character({
    //         name: "Aragon",
    //         folder: "characters/Aragon",
    //         scale: isMobile ? 1 : 1.2
    //     })
    // }
};

let music = new Music("../assets/music/bgm2.mp3");

let correct = new Sfx("../assets/music/ma_soundsbyjw_the_brightest_alerts_and_notifications_1.wav");
let wrong = new Sfx("../assets/music/ma_soundsbyjw_the_brightest_alerts_and_notifications_2.wav");

mary.loadOutfit("Casual");
god.loadOutfit("Casual");

Object.keys(chars).forEach(key => {
    chars[key].char.loadOutfit("Casual");
});

let obj = new IMG({ src: "../assets/images/144.png", scale: 0.5 });

let sounds = {
    wrong, correct
};

export { futon_room, apartment_ext, mary, music, obj, god, portal, witch_hut, sounds, chars };