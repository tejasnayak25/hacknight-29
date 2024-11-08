import { futon_room, apartment_ext, mary, god, music, obj, portal, witch_hut, sounds, chars } from "./assets.js";
import { dialog, next, input, choice, storage, end, wait, trace } from "../vnsutra_modules/game-utils.js";

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Get random index
      [array[i], array[j]] = [array[j], array[i]];   // Swap elements
    }
    return array;
}

let langList = ["English", "Kannada", "Hindi", "Japanese"];

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
        god.brightness = -0.5;
        god.opacity = 0;
        god.show();
        god.to({brightness: 0.1, opacity: 1, duration: 0.3});
        god.brightness = 0;
        // god.fadeIn(0.5);

        music.play();

        let user = await storage.getItem("user");
        let userd = await window.getUser();
        if(!user) {
            // await dialog(god, "What would you like to learn today?");
            await dialog(god, `Hello, ${userd.displayName}. Choose your native language`);
            let nativelang = await choice("Native Language:", langList);

            await storage.setItem("user", { lang: nativelang, targets: []});
            user = {
                lang: nativelang, targets: []
            }

            await dialog(god, "What would you like to learn today?");
        } else {
            await dialog(god, `Hello, ${userd.displayName}. What would you like to learn today?`);
        }

        let lang = await choice("Choose language", langList.filter(lang => lang != user.lang));

        await dialog(god, `Ohh, so you would like to learn ${lang}`);

        let langdata = await storage.getItem(`lang-${lang}`);

        if(!langdata) {
            let array = shuffleArray(Object.keys(chars));
            let teach = {name: array[0], intro: false};
            await dialog(god, `Picking a teacher for you...`);
            await storage.setItem(`lang-${lang}`, {
                lang,
                teach
            });
            await storage.setItem("active-lang", {
                lang,
                teach
            });
            await storage.setItem("user", {lang: user.lang, targets: [...user.targets, lang]});
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
        god.hide();
        Object.keys(chars).forEach(char => {
            chars[char].char.hide();
        });

        let lang = await storage.getItem("active-lang");
        let user = await storage.getItem("user");

        let teach_base = chars[lang.teach.name];
        let teach = teach_base.char;
        teach.outfit = teach.outfits['Casual'];
        teach.mood = "Casual";
        teach.x = 0.2;

        game.background = teach_base.map;

        if(isMobile) {
            teach.y = 0.4;
        }
        teach.slideIn(0.5, 0.3);

        if(lang.progress === 0) {
            await dialog(teach, `Welcome to learning ${lang.lang}`)
        }

        if(!lang.teach.intro) {
            await dialog(teach, teach_base.intro(lang.lang));

            await storage.setItem(`lang-${lang}`, {
                lang: lang.lang,
                teach: {
                    name: lang.teach.name,
                    intro: true
                }
            });
        }

        await dialog(teach, "What would you like to focus on today?");

        let char = await choice("Decide", ["Info Time", "Guess the Letter", "Trace Letter", "Guess the Word", "Guess the Sentence"]);

        if(char === "Guess the Letter") {
            await dialog(teach, "Now, let's play guess the letter!");

            let gdata = await storage.getItem(`lang-${lang.lang}-guessletter`);

            if(!gdata) {
                gdata = {
                    trials: 0,
                    total: 0,
                    accuracy: 0
                }
            }

            let res = await fetch("/ai/random-alpha", {
                method: "POST",
                body: JSON.stringify({
                    target: lang.lang,
                    native: user.lang,
                    progress: gdata.accuracy ?? 0
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
                    await dialog(teach, `Nice. You got ${correct} of them correct.`);
                } else {
                    await dialog(teach, `You got ${correct} of them correct. You could do better.`);
                }

                await storage.setItem(`lang-${lang.lang}-guessletter`, {
                    trials: gdata.trials + 1,
                    total: gdata.total + correct,
                    accuracy: (gdata.total + correct)/((gdata.trials+1)*10)
                });
            } else {
                await dialog(teach, "Looks like there was a problem. I need to leave immediately.");
                await dialog(teach, "I'll be back soon");

                next(this.scene2);
            }
        } else if(char === "Guess the Word") {
            await dialog(teach, "Now, let's play guess the word!");

            let gdata = await storage.getItem(`lang-${lang.lang}-guessword`);

            if(!gdata) {
                gdata = {
                    trials: 0,
                    total: 0,
                    accuracy: 0
                }
            }

            let res = await fetch("/ai/random-word", {
                method: "POST",
                body: JSON.stringify({
                    target: lang.lang,
                    native: user.lang,
                    progress: gdata.accuracy ?? 0
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            res = await res.json();

            if(res['status'] === 200) {
                let data = JSON.parse(res['content']);

                let correct = 0;

                for(let i=0;i<data['words'].length;i++) {
                    let cur = data['words'][i];
                    let c = await choice(`Guess the word! ${cur['native']}`, shuffleArray(cur['options']), true, cur['target'], sounds);
                    if(c === cur['target']) {
                        correct++;
                    }
                }

                if(correct > 5) {
                    await dialog(teach, `Nice. You got ${correct} of them correct.`);
                } else {
                    await dialog(teach, `You got ${correct} of them correct. You could do better.`);
                }

                await storage.setItem(`lang-${lang.lang}-guessword`, {
                    trials: gdata.trials + 1,
                    total: gdata.total + correct,
                    accuracy: (gdata.total + correct)/((gdata.trials+1)*10)
                });
            } else {
                await dialog(teach, "Looks like there was a problem. I need to leave immediately.");
                await dialog(teach, "I'll be back soon");

                next(this.scene2);
            }
        } else if(char === "Guess the Sentence") {
            await dialog(teach, "Now, let's play guess the sentence!");

            let gdata = await storage.getItem(`lang-${lang.lang}-guesssentence`);

            if(!gdata) {
                gdata = {
                    trials: 0,
                    total: 0,
                    accuracy: 0
                }
            }

            let res = await fetch("/ai/random-sentence", {
                method: "POST",
                body: JSON.stringify({
                    target: lang.lang,
                    native: user.lang,
                    progress: gdata.accuracy ?? 0
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            res = await res.json();

            if(res['status'] === 200) {
                let data = JSON.parse(res['content']);

                let correct = 0;

                for(let i=0;i<data['sentences'].length;i++) {
                    let cur = data['sentences'][i];
                    let c = await choice(`Guess the sentence! ${cur['native']}`, shuffleArray(cur['options']), true, cur['target'], sounds);
                    if(c === cur['target']) {
                        correct++;
                    }
                }

                if(correct > 5) {
                    await dialog(teach, `Nice. You got ${correct} of them correct.`);
                } else {
                    await dialog(teach, `You got ${correct} of them correct. You could do better.`);
                }

                await storage.setItem(`lang-${lang.lang}-guesssentence`, {
                    trials: gdata.trials + 1,
                    total: gdata.total + correct,
                    accuracy: (gdata.total + correct)/((gdata.trials+1)*10)
                });
            } else {
                await dialog(teach, "Looks like there was a problem. I need to leave immediately.");
                await dialog(teach, "I'll be back soon");

                next(this.scene2);
            }
        } else if(char === "Trace Letter") {
            await dialog(teach, "Now, let's play trace the letter!");

            let res = await fetch("/ai/random-alpha", {
                method: "POST",
                body: JSON.stringify({
                    target: lang.lang,
                    native: user.lang
                }),
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            res = await res.json();

            if(res['status'] === 200) {
                let data = JSON.parse(res['content']);

                for(let i=0;i<data['letters'].length;i++) {
                    let cur = data['letters'][i];
                    // let c = await choice(`Trace the letter! ${cur['native']}`, shuffleArray(cur['options']), true, cur['target'], sounds);
                    let c = await trace(`Trace the character: ${cur['target']}`, cur['target']);
                }

                await dialog(teach, `Wow. That was great!`);
            } else {
                await dialog(teach, "Looks like there was a problem. I need to leave immediately.");
                await dialog(teach, "I'll be back soon");

                next(this.scene2);
            }
        }
        
        // await game.background.to({ scale: 4, duration: 1000 });
        
        next(this.scene2)
    }
}