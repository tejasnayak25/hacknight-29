let game, 
gameSettings = {
    text_animation: true
}, exitApp = () => {
    history.back();
}, bgm = () => {
    document.getElementById("music").play();
}, autoplay = false, is_app = false;
let activeScene = undefined, activeLayer = 'home', configuration = null;

document.oncontextmenu = (e) => {
    e.preventDefault();
}

window.getUser = () => {
    return null;
}

document.onkeydown = (e) => {
    if(e.ctrlKey && e.shiftKey) {
        switch(e.key) {
            case "I": e.preventDefault();break;
            default: break;
        }
    }
}

let alertwintrace = document.getElementById("alert-win");
let trace_holder = alertwintrace.querySelector("#alert-trace");
let trace_canvas = trace_holder.querySelector("canvas");
let trace_context = trace_canvas.getContext("2d");

let isDrawing = false;

trace_canvas.addEventListener("mousedown", () => {
    isDrawing = true;
});

trace_canvas.addEventListener("mouseup", () => {
    isDrawing = false;
    trace_context.beginPath(); // reset the path for clean lines
});

trace_canvas.addEventListener("mousemove", (event) => {
    if (!isDrawing) return;

    // Get mouse position within the canvas
    const rect = trace_canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Draw
    trace_context.lineWidth = 10;
    trace_context.lineCap = "round";
    trace_context.strokeStyle = "black";
    
    trace_context.lineTo(x, y);
    trace_context.stroke();
    trace_context.beginPath();
    trace_context.moveTo(x, y);
});

trace_canvas.addEventListener("touchstart", () => {
    isDrawing = true;
  });
  
  trace_canvas.addEventListener("touchend", () => {
    isDrawing = false;
    trace_context.beginPath(); // reset the path for clean lines
  });

  trace_canvas.addEventListener("touchmove", (event) => {
    if (!isDrawing) return;
  
    // Prevent default behavior to avoid conflicts with scrolling
    event.preventDefault();
  
    // Get the first touch point
    const touch = event.changedTouches[0];
  
    // Get the relative coordinates within the canvas
    const rect = trace_canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
  
    // Draw line
    trace_context.lineWidth = 10;
    trace_context.lineCap = "round";
    trace_context.strokeStyle = "black";
  
    trace_context.lineTo(x, y);
    trace_context.stroke();
    trace_context.beginPath();
    trace_context.moveTo(x, y);
  });