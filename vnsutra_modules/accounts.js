async function accounts(config, actionbar, fonts, credit_details) {
    let actionContent = actionbar.actionContent;

    actionbar.addBtn.visible(false);
    
    let { width: containerWidth, height: containerHeight } = actionContent.getAttrs();

    let padding = 30, gap = 30;

    let mainContainer = new Konva.Group({
        x: padding,
        width: containerWidth - 2 * padding,
        height: containerHeight
    });


    let btnimage = new Image();
    
    if(config.gui.button) {
        btnimage.src = config.gui.button;
    }

    let user = window.getUser();

    let btns = [ 
        { name: user ? 'LogOut' : 'Login With Google', onclick: () => {
            window.dispatchEvent(new CustomEvent(user ? "logout" : "login"));
        } }
    ];

    let version_text = new Konva.Text({
        align: "center",
        padding: isMobile ? 60 : 30,
        verticalAlign: "middle",
        width: isMobile ? mainContainer.width() : containerWidth,
        height: isMobile ? 80 : (isAndroid ? 60 : 70),
        y: 15,
        text: user ? user.displayName : "Username",
        fontFamily: fonts['other'],
        fontSize: isMobile ? 27 : (isAndroid ? 25 : 27),
        fill: config.colors.text,
        fillAfterStrokeEnabled: true,
        wrap: "word"
    });

    window.addEventListener("user-update", async () => {
        let ac = await accounts(config, actionbar, fonts, credit_details);
        ac.render();

        window.addEventListener("click", () => {
            document.body.requestFullscreen();
        }, {once: true});
    });

    let btny = 15 + version_text.height() + (isMobile ? 0 : gap);

    let btns_holder = new Konva.Group({
        width: isMobile ? containerWidth - 30 : 300,
        height: btns.length * (isMobile ? 70 : (isAndroid ? 50 : 70)),
        x: isMobile ? -15 : (containerWidth - 300)/2,
        y: btny
    });

    let btn_height = isMobile ? 70 : (isAndroid ? 60 : 80);

    for (let i = 0; i < btns.length; i++) {
        const btn = btns[i];

        let btn_group = new Konva.Group({
            width: btns_holder.width(),
            height: (isMobile ? 50 : (isAndroid ? 40 : 50)),
            y: i * btn_height
        });

        btn_group.on("mouseover", () => {
            btn_group.scale({ x: 1.05, y: 1.05 });
            let widthdiff = btn_group.width()*(0.05);
            let heightdiff = btn_group.height()*(0.05);
            btn_group.x(0 - widthdiff/2);
            btn_group.y( i*btn_height - heightdiff/2 );
            document.body.style.cursor = "pointer";
        });

        btn_group.on("mouseout", () => {
            btn_group.scale({ x: 1, y: 1 });
            btn_group.x(0);
            btn_group.y(i*btn_height);
            document.body.style.cursor = "auto";
        });

        let btn_rect = new Konva.Rect({
            width: btn_group.width(),
            height: btn_group.height()
        });

        let btn_img;
            
        if(config.gui.button !== null) {
            btn_img = new Konva.Image({
                width: btn_group.width(),
                height: btn_rect.height(),
                image: btnimage
            });
        } else {
            btn_img = new Konva.Rect({
                width: btn_group.width(),
                height: btn_rect.height(),
                fill: config.colors.button ?? config.colors.primary,
                cornerRadius: btn_group.width()/2
            });
        }

        let btntext = new Konva.Text({
            align: "center",
            width: btn_group.width(),
            y: btn_rect.height() / 2 - 10,
            text: btn.name,
            fontFamily: fonts['other'],
            fontSize: 25,
            fill: config.colors['button-text'],
            fillAfterStrokeEnabled: true
        });

        btn_group.on("click touchstart", () => {
            btntext.to({
                scaleX: 1.04,
                duration: 0.05,
                onFinish: () => {
                    btntext.to({
                        scaleX: 1,
                        duration: 0.05
                    });
                },
            });

            btn.onclick();
        });

        btn_group.add(btn_img);
        btn_group.add(btn_rect);
        btn_group.add(btntext);

        btns_holder.add(btn_group);
    }

    let separator = new Konva.Rect({
        width: isMobile ? mainContainer.width() : containerWidth  - 2*padding,
        height: 1,
        fill: "gray",
        y: btny + btns_holder.height() + gap
    });

    mainContainer.add(version_text, btns_holder, separator);

    let langhead = new Konva.Text({
        align: "center",
        padding: isMobile ? 60 : 30,
        verticalAlign: "middle",
        width: isMobile ? mainContainer.width() : containerWidth,
        height: isMobile ? 80 : (isAndroid ? 60 : 70),
        y: separator.y() + separator.height() + gap,
        text: "Languages:",
        fontFamily: fonts['other'],
        fontSize: isMobile ? 25 : (isAndroid ? 23 : 25),
        fill: config.colors.text,
        fillAfterStrokeEnabled: true,
        wrap: "word",
        textDecoration: "underline"
    });

    mainContainer.add(langhead);

    let userd = await story_store.getItem("user");

    if(userd) {
        let previous = 0;
        if(userd.targets.length === 0) {
            let course_title = new Konva.Text({
                align: "center",
                padding: isMobile ? 60 : 30,
                verticalAlign: "middle",
                width: isMobile ? mainContainer.width() : containerWidth,
                height: isMobile ? 60 : (isAndroid ? 40 : 50),
                y: previous + langhead.y() + langhead.height() + gap,
                text: `Nothing here!`,
                fontFamily: fonts['other'],
                fontSize: isMobile ? 25 : (isAndroid ? 23 : 25),
                fill: "gray",
                fillAfterStrokeEnabled: true,
                wrap: "word"
            });

            mainContainer.add(course_title);
        }
        for(let i=0;i<userd.targets.length;i++) {
            let cur = userd.targets[i];
            let data = await story_store.getItem(`lang-${cur}`);
            let items = [
                await story_store.getItem(`lang-${cur}-guessletter`),
                await story_store.getItem(`lang-${cur}-guessword`),
                await story_store.getItem(`lang-${cur}-guesssentence`)
            ];
            
            // Filter out null or undefined items
            let validItems = items.filter(item => item != null);
            
            let accuracy = validItems.map(item => item.accuracy || 0).reduce((a, b) => a + b, 0);
            accuracy = validItems.length > 0 ? accuracy / validItems.length : 0; // Avoid division by zero
            
            let games_played = validItems.map(item => item.trials || 0).reduce((a, b) => a + b, 0);
            
            let course_title = new Konva.Text({
                align: "center",
                padding: isMobile ? 60 : 30,
                verticalAlign: "middle",
                width: isMobile ? mainContainer.width() : containerWidth,
                height: isMobile ? 60 : (isAndroid ? 40 : 50),
                y: previous + langhead.y() + langhead.height() + gap,
                text: `${i+1}) ${cur.toUpperCase()} - Accuracy: ${accuracy*100}% | Games Played: ${games_played}`,
                fontFamily: fonts['other'],
                fontSize: isMobile ? 22 : (isAndroid ? 23 : 25),
                fill: config.colors.text,
                fillAfterStrokeEnabled: true,
                wrap: "word"
            });

            previous += course_title.height() + gap;

            mainContainer.add(course_title);
        }
    } else {
        let course_title = new Konva.Text({
            align: "center",
            padding: isMobile ? 60 : 30,
            verticalAlign: "middle",
            width: isMobile ? mainContainer.width() : containerWidth,
            height: isMobile ? 60 : (isAndroid ? 40 : 50),
            y: langhead.y() + langhead.height() + gap,
            text: `Nothing here!`,
            fontFamily: fonts['other'],
            fontSize: isMobile ? 25 : (isAndroid ? 23 : 25),
            fill: "gray",
            fillAfterStrokeEnabled: true,
            wrap: "word"
        });

        mainContainer.add(course_title);
    }


    // textAnimation.update();
    // music.update();
    // sfx.update();

    function render() {
        actionbar.clear();
        actionbar.title = "Account";

        // textAnimation.update();
        // music.update();
        // sfx.update();

        actionContent.add(mainContainer);

        actionbar.scrollbarHeight = actionContent.height() / mainContainer.height();

        let scrollbar = actionbar.scrollbar;
    
        if(actionbar.scrollbarHeight > 0) {
            scrollbar.off("dragmove");
            scrollbar.on("dragmove", () => {
                mainContainer.y(-(actionbar.scrollHeight / actionbar.scrollScale));
            });
        
            actionContent.off("mousedown touchstart");
    
            let {x: minX, y: minY} = actionContent.getAbsolutePosition();
            window.onmousewheel = (e) => {
                if(e.clientX > minX && e.clientY > minY) {
                    actionbar.scrollHeight += e.deltaY;
                    scrollbar.fire("dragmove");
                }
            };
    
            actionContent.on("mousedown touchstart", (ev) => {
                let startY = actionbar.scrollHeight;
                let y = 0;
        
                if(ev.type === "touchstart") {
                    y = ev.evt.touches[0].clientY;
                } else {
                    y = ev.evt.y;
                }
        
                actionContent.on("mousemove touchmove", (e) => {
                    let y2 = 0;
                    if(e.type === "touchmove") {
                        y2 = e.evt.touches[0].clientY;
                    } else {
                        y2 = e.evt.y;
                    }
        
                    actionbar.scrollHeight = startY + (y - y2);
                    scrollbar.fire("dragmove");
                });
        
                actionContent.on("mouseup touchend", () => {
                    actionContent.off("mousemove mouseup");
                });
            });
        } else {
            scrollbar.off("dragmove");
            actionContent.off("mousedown touchstart");
        }
    }

    return ({
        container: mainContainer,
        render
    });
}