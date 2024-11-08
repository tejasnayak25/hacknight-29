function dialog(speaker, text = "", wait = true) {
    let data = game.ui.dialog;
    if(speaker === null) {
        data.name.text("");
        data.message.text("");
        data.message.fire("update");
        return;
    }
    return new Promise(async (resolve, reject) => {
        data.name.text(speaker.data.name);
    
        if(gameSettings["text_animation"]) {
            data.message.text(text);
            data.message.fire("update");
            await animateDialog(text);
            if(wait) {
                document.body.onkeydown = (e) => {
                    if(e.key === "Enter") {
                        document.body.onkeydown = () => {};
                        resolve();
                    }
                };
                let container = game.ui.game.container;
                container.on("click touchstart", () => {
                    container.off("click touchstart");
                    resolve();
                });
            } else {
                resolve();
            }
        } else {
            data.message.text(text);
            data.message.fire("update");
            if(wait) {
                document.body.onkeydown = (e) => {
                    if(e.key === "Enter") {
                        document.body.onkeydown = () => {};
                        resolve();
                    }
                };
                let container = game.ui.game.container;
                container.on("click touchstart", () => {
                    container.off("click touchstart");
                    resolve();
                });
            } else {
                resolve();
            }
        }
    });
}

function animateDialog(text) {
    return new Promise((resolve, reject) => {
        let dialog_text = game.ui.dialog.message;
        dialog_text.text("");
    
        let time = 0;
        let interval = setInterval(() => {
            time++;
            if(time <= text.length) {
                let data = text.substring(0, time);
                dialog_text.text(data);
            } else {
                stopInterval();
            }
        }, 50);

        document.body.onkeydown = (e) => {
            if(e.key === "Enter") {
                stopInterval();
                dialog_text.text(text);
            }
        };

        let container = game.ui.game.container;
        container.on("click touchstart", () => {
            stopInterval();
            dialog_text.text(text);
        });
    
        function stopInterval() {
            clearInterval(interval);
            interval = undefined;
            document.body.onkeydown = () => {};
            container.off("click touchstart");
            resolve();
        }
    });
}

function next(scene, story) {
    game.ui.game.end.visible(false);
    activeScene = scene.name;
    scene(story);
}

function input(message, placeholder = undefined) {
    return new Promise((resolve, reject) => {
        let proceedBtn = document.createElement("button");
        proceedBtn.innerText = "Continue";
        proceedBtn.className = "btn hover:bg-inherit border-0";
        proceedBtn.style.backgroundColor = configuration.colors.primary;
        proceedBtn.style.color = configuration.colors['primary-text'];
    
        let inp = document.createElement("input");
        inp.type = "text";
        inp.placeholder = placeholder ?? "Enter something...";
        inp.className = "w-full input rounded-full input-bordered border-2";
        inp.style.borderColor = configuration.colors.primary;
        inp.style.backgroundColor = "transparent";
        inp.style.color = configuration.colors.text;
    
        let alertwin = new AlertWindow(message, [proceedBtn], configuration, "input", { input: inp });
        alertwin.btns.classList.replace("justify-between", "justify-end");

        if(isMobile) {
            inp.onblur = () => {
                document.documentElement.requestFullscreen();
            }

            document.onclick = (e) => {
                if(e.target.tagName !== "INPUT") {
                    inp.blur();
                }
            }
        }

        inp.onkeydown = (e) => {
            if(e.key === "Enter") {
                if(inp.value !== "") {
                    if(isMobile) {
                        inp.blur();
                    } else {
                        alertwin.close();
                        alertwin.btns.classList.replace("justify-end", "justify-between");
                        resolve(inp.value);
                    }
                }
            }
        }
    
        proceedBtn.onclick = () => {
            if(inp.value !== "") {
                alertwin.close();
                alertwin.btns.classList.replace("justify-end", "justify-between");
                resolve(inp.value);
                document.onclick = () => {};
            }
        }

        alertwin.show();
        inp.select();
    });
}

function choice(message, opts, large = false, answer = null, sound = null) {
    return new Promise((resolve, reject) => {
        let proceedBtn = document.createElement("button");
        proceedBtn.innerText = "Continue";
        proceedBtn.className = "btn hover:bg-inherit border-0";
        proceedBtn.style.backgroundColor = configuration.colors.primary;
        proceedBtn.style.color = configuration.colors['primary-text'];
    
        let choices = new LongTextRadio({
            label: "Choices",
            id: "choices",
            options: opts,
            large: large,
            answer: answer,
            onchange: (e, input) => {
                if(e.correct) {
                    sound.correct.play();
                } else {
                    sound.wrong.play();
                }
                setTimeout(() => {
                    let value = choicesElem.querySelector(`input[name="choices-radio"]:checked`).value;
                    alertwin.close();
                    alertwin.btns.classList.replace("justify-end", "justify-between");
                    resolve(value);
                }, 1000);
            }
        });

        let choicesElem = choices.element;
    
        let alertwin = new AlertWindow(message, answer ? [] : [proceedBtn], configuration, "choice", { opts: choicesElem });
        alertwin.btns.classList.replace("justify-between", "justify-end");
    
        proceedBtn.onclick = () => {
            let value = choicesElem.querySelector(`input[name="choices-radio"]:checked`).value;
            alertwin.close();
            alertwin.btns.classList.replace("justify-end", "justify-between");
            resolve(value);
        }

        alertwin.show();

        choices.onappend();
    });
}

function trace(message, char) {
    return new Promise((resolve, reject) => {
        let proceedBtn = document.createElement("button");
        proceedBtn.innerText = "Continue";
        proceedBtn.className = "btn hover:bg-inherit border-0";
        proceedBtn.style.backgroundColor = configuration.colors.primary;
        proceedBtn.style.color = configuration.colors['primary-text'];
    
        let alertwin = new AlertWindow(message, [proceedBtn], configuration, "trace", { trace: char });
        alertwin.btns.classList.replace("justify-between", "justify-end");
    
        proceedBtn.onclick = () => {
            // let value = choicesElem.querySelector(`input[name="choices-radio"]:checked`).value;
            alertwin.close();
            alertwin.btns.classList.replace("justify-end", "justify-between");

            resolve(null);
        }

        alertwin.show();
    });
}

const storage = {
    setItem: (key, value) => addData(story_db, { key, value }),
    getItem: async (key) => {
        const data = await getData(story_db, key);
        return data ? data.value : null;
    },
    removeItem: (key) => deleteData(story_db, key),
    clear: () => clearData(story_db),
    key: (index) => getKeyAt(story_db, index),
    get length() {
        return getDataLength(story_db);
    },
}

function end() {
    game.ui.game.end.visible(true);
}

/**
 * 
 * @param {number} time 
 */
function wait(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time*1000);
    });
}

export { dialog, next, input, choice, storage, end, wait, trace };