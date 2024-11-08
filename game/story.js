import { futon_room, apartment_ext, mary, god, music, obj, portal, witch_hut, sounds } from "./assets.js";
import { dialog, next, input, choice, storage, end, wait } from "../vnsutra_modules/game-utils.js";

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Get random index
      [array[i], array[j]] = [array[j], array[i]];   // Swap elements
    }
    return array;
}

export const story = {
    start: async function () {
        game.background.reset();
        god.reset(["scale"]);
        game.background = witch_hut;
        god.outfit = god.outfits['Casual'];
        god.mood = "Casual1";
        god.x = 0.5;

        if(isMobile) {
            god.y = 0.4;
        }
        god.show();

        music.play();

        let user = await storage.getItem("user");
        if(!user) {
            // await dialog(god, "What would you like to learn today?");
            await dialog(god, "Hello human, what is your name?");
            let name = await input("Your name:", "John Doe");
            await dialog(god, "Choose your native language");
            let nativelang = await choice("Native Language:", ["English", "Kannada", "Hindi"]);

            storage.setItem("user", {name, lang: nativelang});

            await dialog(god, "What would you like to learn today?");
        } else {
            await dialog(god, `Hello, ${user.name}. What would you like to learn today?`);
        }

        let lang = await choice("Choose language", ["English", "Kannada", "Hindi", "Japanese"]);

        await dialog(god, `Ohh, so you would like to learn ${lang}`);

        let langdata = await storage.getItem(`lang-${lang}`);

        if(!langdata) {
            await dialog(god, `Picking a teacher for you...`);
            await storage.setItem(`lang-${lang}`, {
                progress: 0,
                lang: lang
            });
            await storage.setItem("active-lang", {
                progress: 0,
                lang: lang
            });
        }
        else {
            await storage.setItem("active-lang", langdata);
        }

        
        next(this.scene2);
    },
    scene2: async function () {
        music.play();
        game.background.reset();
        god.reset(["scale", "x", "y"]);
        // god.hide();
        game.background = witch_hut;

        let lang = await storage.getItem("active-lang");
        let user = await storage.getItem("user");

        if(lang.progress === 0) {
            await dialog(god, `Welcome to learning ${lang.lang}`)
        }

        await dialog(god, "What would you like to focus on today?");

        let char = await choice("Decide", ["Info Time", "Guess the Letter", "Words", "Sentences"]);

        if(char === "Guess the Letter") {
            await dialog(god, "Now, let's play guess the letter!");

            let res = await fetch("/ai/random-alpha", {
                method: "POST",
                body: JSON.stringify({
                    target: lang.lang,
                    native: user.lang,
                    progress: 0
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            res = await res.json();

            if(res['status'] === 200) {
                let data = JSON.parse(res['content']);

                let correct = 0;

                for(let i=0;i<data['letters'].length;i++) {
                    let cur = data['letters'][i];
                    let c = await choice(`Guess the letter! ${cur['native']}`, shuffleArray(cur['options']), true, cur['target'], sounds);
                    if(c === cur['target']) {
                        correct++;
                    }
                }

                if(correct > 5) {
                    await dialog(god, `Nice. You got ${correct} of them correct.`);
                } else {
                    await dialog(god, `You got ${correct} of them correct. You could do better.`);
                }
            } else {
                await dialog(god, "Looks like there was a problem. I need to leave immediately.");
                await dialog(god, "I'll be back soon");

                next(this.scene2);
            }
        }
        
        // await game.background.to({ scale: 4, duration: 1000 });
        
        end();
    }
}