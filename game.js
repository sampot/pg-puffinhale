export const WIDTH = 480;
export const HEIGHT = 320;
const TYPES = ["spark", "bubble", "leaf"];
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export class PuffinGame {
  constructor(random = Math.random) {
    this.random = random;
    this.player = { x: WIDTH / 2, y: HEIGHT / 2, r: 20, facing: 0 };
    this.enemies = [];
    this.shots = [];
    this.power = null;
    this.wave = 0;
    this.score = 0;
    this.running = false;
    this.message = "按開始迎接浪潮";
    this.spitLatch = false;
  }

  start() {
    this.player = { x: WIDTH / 2, y: HEIGHT / 2, r: 20, facing: 0 };
    this.enemies = [];
    this.shots = [];
    this.power = null;
    this.wave = 1;
    this.score = 0;
    this.running = true;
    this.spitLatch = false;
    this.spawnWave();
    this.message = "按住吸氣取得屬性，再吐出反擊";
  }

  spawnWave() {
    const count = 3 + this.wave;
    this.enemies = Array.from({ length: count }, (_, index) => {
      const edge = index % 4;
      return {
        x: edge === 0 ? 25 : edge === 1 ? WIDTH - 25 : 45 + this.random() * (WIDTH - 90),
        y: edge === 2 ? 25 : edge === 3 ? HEIGHT - 25 : 45 + this.random() * (HEIGHT - 90),
        r: 13,
        type: TYPES[index % TYPES.length],
      };
    });
  }

  step(dt = 1, input = {}) {
    if (!this.running) return;
    const p = this.player;
    const dx = Number(Boolean(input.right)) - Number(Boolean(input.left));
    const dy = Number(Boolean(input.down)) - Number(Boolean(input.up));
    if (dx || dy) {
      const length = Math.hypot(dx, dy);
      p.x = clamp(p.x + dx / length * 2.8 * dt, p.r, WIDTH - p.r);
      p.y = clamp(p.y + dy / length * 2.8 * dt, p.r, HEIGHT - p.r);
      p.facing = Math.atan2(dy, dx);
    }

    if (input.inhale && !this.power) {
      for (const enemy of this.enemies) {
        const angle = Math.atan2(enemy.y - p.y, enemy.x - p.x);
        const difference = Math.atan2(Math.sin(angle - p.facing), Math.cos(angle - p.facing));
        if (distance(p, enemy) < 125 && Math.abs(difference) < 0.8) {
          enemy.x += Math.cos(angle + Math.PI) * 5 * dt;
          enemy.y += Math.sin(angle + Math.PI) * 5 * dt;
          if (distance(p, enemy) < p.r + enemy.r + 8) {
            this.power = enemy.type;
            enemy.eaten = true;
            this.score += 15;
            this.message = "吸到了！按吐出發射";
          }
        }
      }
      this.enemies = this.enemies.filter((enemy) => !enemy.eaten);
    }

    if (input.spit && !this.spitLatch && this.power) {
      this.shots.push({
        x: p.x, y: p.y, r: 8, type: this.power,
        vx: Math.cos(p.facing) * 7, vy: Math.sin(p.facing) * 7,
      });
      this.power = null;
      this.spitLatch = true;
    }
    if (!input.spit) this.spitLatch = false;

    for (const enemy of this.enemies) {
      const angle = Math.atan2(p.y - enemy.y, p.x - enemy.x);
      enemy.x += Math.cos(angle) * 0.42 * dt;
      enemy.y += Math.sin(angle) * 0.42 * dt;
    }
    for (const shot of this.shots) {
      shot.x += shot.vx * dt;
      shot.y += shot.vy * dt;
      for (const enemy of this.enemies) {
        if (distance(shot, enemy) < shot.r + enemy.r) {
          shot.dead = true;
          enemy.dead = true;
          this.score += 25;
        }
      }
    }
    this.shots = this.shots.filter((shot) => !shot.dead && shot.x > 0 && shot.x < WIDTH && shot.y > 0 && shot.y < HEIGHT);
    this.enemies = this.enemies.filter((enemy) => !enemy.dead);
    if (this.enemies.length === 0 && !this.power) {
      this.wave += 1;
      this.score += 50;
      this.spawnWave();
      this.message = "清波！下一波";
    }
  }
}
