class AlertWindow {
    constructor(message, btns, config, type="message", { input, opts, trace } = { input: null, opts: null, trace: null}) {
        this.win = document.getElementById("alert-win");
        this.card = this.win.querySelector("#alert-card");
        this._message = this.win.querySelector("#alert-message");
        this.input_holder = this.win.querySelector("#alert-input");
        this.choice_holder = this.win.querySelector("#alert-opts");
        this.btns = this.win.querySelector("#alert-btns");
        
        this.color = config.colors.primary;
        this.cardColor = config.colors.menu;
        this.textColor = config.colors.text;

        this.data = {
            message, btns, type, input, opts, trace
        }
    }

    /**
     * @param {string} value 
     */
    set color(value) {
        this.card.style.borderColor = value;
    }

    get color() {
        return this.card.style.borderColor;
    }

    /**
     * @param {string} value 
     */
    set textColor(value) {
        this._message.style.color = value;
    }

    get textColor() {
        return this._message.style.color;
    }

    /**
         * @param {string} value 
         */
    set cardColor(value) {
        this.card.style.backgroundColor = value;
    }

    get cardColor() {
        return this.card.style.backgroundColor;
    }    

    /**
     * @param {string} text 
     */
    set message(text) {
        this._message.innerText = text; 
        this.data.message = text;
    }

    show() {
        this._message.innerText = this.data.message;
        this.btns.innerHTML = "";
        this.btns.append(...this.data.btns);

        if(this.data.type === "input") {
            this.input_holder.classList.replace("hidden", "flex");
            this.input_holder.innerHTML = "";
            this.input_holder.append(this.data.input);
        } else {
            this.input_holder.classList.replace("flex", "hidden");
        }

        if(this.data.type === "choice") {
            this.choice_holder.classList.remove("hidden");
            this.choice_holder.innerHTML = "";
            this.choice_holder.append(this.data.opts);
        } else {
            this.choice_holder.classList.add("hidden");
        }

        this.win.classList.replace("hidden", "flex");

        if(this.data.type === "trace") {
            trace_holder.classList.remove("hidden");

            trace_canvas.width = trace_canvas.offsetWidth;
            trace_canvas.height = trace_canvas.offsetHeight;

            console.log(trace_canvas.width, trace_canvas.height);
            // Clear the canvas
            trace_context.clearRect(0, 0, trace_canvas.width, trace_canvas.height)

            const fontSize = 250;

            // Calculate font size based on canvas dimensions (optional, adjust for different canvas sizes)
            const maxFontSize = Math.min(trace_canvas.width, trace_canvas.height) * 1; // 80% of canvas size
            const adjustedFontSize = Math.min(fontSize, maxFontSize);
            
            // Set font
            trace_context.font = `${adjustedFontSize}px sans-serif`;
            
            // Set fill style to gray
            trace_context.fillStyle = "gray";
            
            // Set text alignment and baseline
            trace_context.textAlign = "center";
            trace_context.textBaseline = "middle";
            
            // Fill the canvas with gray background (optional, adjust based on use case)
            // trace_context.fillRect(0, 0, trace_canvas.width, trace_canvas.height);
            
            // Draw the text
            trace_context.fillText(this.data.trace, trace_canvas.width / 2, trace_canvas.height / 2);

        } else {
            trace_holder.classList.add("hidden");
        }
    }

    close() {
        this.win.classList.replace("flex", "hidden");
    }
}