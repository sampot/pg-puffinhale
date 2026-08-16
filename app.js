import { PuffinGame, WIDTH, HEIGHT } from "./game.js";

const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const status = document.querySelector("#status");
const stats = document.querySelector("#stats");
const game = new PuffinGame();
const input = {};
const body = new Image();
body.src = "./assets/yellow_body_circle.png";
const face = new Image();
face.src = "./assets/face_a.png";
const keyMap = { ArrowUp: "up", w: "up", ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left", ArrowRight: "right", d: "right", j: "inhale", k: "spit" };
addEventListener("keydown", (event) => { const key = keyMap[event.key]; if (key) { input[key] = true; event.preventDefault(); } });
addEventListener("keyup", (event) => { const key = keyMap[event.key]; if (key) input[key] = false; });
document.querySelector("#start").addEventListener("click", () => game.start());
for (const id of ["inhale", "spit"]) {
  const button = document.querySelector(`#${id}`);
  button.addEventListener("pointerdown", (event) => { input[id] = true; button.setPointerCapture(event.pointerId); });
  button.addEventListener("pointerup", () => { input[id] = false; });
  button.addEventListener("pointercancel", () => { input[id] = false; });
}
for (const button of document.querySelectorAll("[data-key]")) {
  const key = button.dataset.key;
  button.addEventListener("pointerdown", (event) => { input[key] = true; button.setPointerCapture(event.pointerId); });
  button.addEventListener("pointerup", () => { input[key] = false; });
  button.addEventListener("pointercancel", () => { input[key] = false; });
}
const colors = { spark: "#ffdb5d", bubble: "#6ee7f2", leaf: "#80e289" };

function draw() {
  const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gradient.addColorStop(0, "#0f6070"); gradient.addColorStop(1, "#082431");
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, WIDTH, HEIGHT);
  for (let i = 0; i < 30; i += 1) {
    ctx.fillStyle = "#ffffff18"; ctx.beginPath(); ctx.arc((i * 83) % WIDTH, (i * 137) % HEIGHT, 3 + i % 4, 0, Math.PI * 2); ctx.fill();
  }
  for (const enemy of game.enemies) {
    ctx.fillStyle = colors[enemy.type]; ctx.beginPath(); ctx.roundRect(enemy.x - 15, enemy.y - 15, 30, 30, 10); ctx.fill();
    ctx.fillStyle = "#16303a"; ctx.fillRect(enemy.x - 7, enemy.y - 3, 4, 4); ctx.fillRect(enemy.x + 3, enemy.y - 3, 4, 4);
  }
  for (const shot of game.shots) { ctx.fillStyle = colors[shot.type]; ctx.beginPath(); ctx.arc(shot.x, shot.y, shot.r, 0, Math.PI * 2); ctx.fill(); }
  const p = game.player;
  if (input.inhale && !game.power) {
    ctx.fillStyle = "#d9fbff30"; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.arc(p.x, p.y, 120, p.facing - .65, p.facing + .65); ctx.closePath(); ctx.fill();
  }
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.facing);
  if (body.complete) {
    ctx.drawImage(body, -24, -24, 48, 48);
    if (face.complete) ctx.drawImage(face, -19, -19, 38, 38);
  } else {
    ctx.fillStyle = game.power ? colors[game.power] : "#fff4cf"; ctx.beginPath(); ctx.ellipse(0, 0, 22, 19, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = "#ef9364"; ctx.beginPath(); ctx.arc(22, 2, input.inhale ? 9 : 5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  status.textContent = game.message;
  stats.textContent = `第 ${game.wave} 波 · ${game.power ? { spark: "火花", bubble: "泡泡", leaf: "葉旋" }[game.power] : "無屬性"} · ${game.score} 分`;
}
let previous = performance.now();
function frame(now) { const dt = Math.min(2, (now - previous) / 16.667); previous = now; game.step(dt, input); input.spit = false; draw(); requestAnimationFrame(frame); }
draw(); requestAnimationFrame(frame);
