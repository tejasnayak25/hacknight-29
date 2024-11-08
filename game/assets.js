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
    scale: isMobile ? 1 : 1.2
});

let music = new Music("../assets/music/bgm2.mpeg");

let correct = new Sfx("../assets/music/ma_soundsbyjw_the_brightest_alerts_and_notifications_1.wav");
let wrong = new Sfx("../assets/music/ma_soundsbyjw_the_brightest_alerts_and_notifications_2.wav");

mary.loadOutfit("Casual");
god.loadOutfit("Casual");

let obj = new IMG({ src: "../assets/images/logo.png", scale: 0.5 });

let sounds = {
    wrong, correct
};

export { futon_room, apartment_ext, mary, music, obj, god, portal, witch_hut, sounds };