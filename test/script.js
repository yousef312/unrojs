import unro from "../src/unro.js";

let stack = unro();

let canvas = document.querySelector('canvas');
let ctx = canvas.getContext('2d');
ctx.canvas.width =
    ctx.canvas.height = 250;
ctx.imageSmoothingEnabled = false;

// USE ARROW right & left to undo-redo
window.addEventListener('keydown', function (e) {
    if (e.key.toLowerCase() === "arrowleft") stack.undo();
    else if (e.key.toLowerCase() === "arrowright") stack.redo();
})

document.querySelector('button.undo').addEventListener('click', () => { stack.undo() })
document.querySelector('button.redo').addEventListener('click', () => { stack.redo() })

document.querySelector('button.draw').addEventListener('click', function () {
    let a = [Math.random() * 250, Math.random() * 250];
    let b = [Math.random() * 250, Math.random() * 250];
    let color = "rgb(" + [1, 1, 1].map(a => Math.floor(Math.random() * 255)).join(',') + ")"
    stack.push((mk) => {
        mk.use(ctx);
        mk.register("undo");
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
        mk.register('redo');
    })
})