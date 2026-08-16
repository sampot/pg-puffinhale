import { describe, expect, it } from "vitest";
import { PuffinGame, WIDTH, HEIGHT } from "./game.js";

describe("puffinhale", () => {
  it("starts a populated wave", () => {
    const game = new PuffinGame(() => 0.5);
    game.start();
    expect(game.enemies.length).toBeGreaterThan(0);
    expect(game.player.x).toBe(WIDTH / 2);
    expect(game.player.y).toBe(HEIGHT / 2);
  });

  it("inhales a nearby enemy power", () => {
    const game = new PuffinGame(() => 0.5);
    game.start();
    game.enemies = [{ x: game.player.x + 20, y: game.player.y, r: 12, type: "spark" }];
    game.step(1, { inhale: true });
    expect(game.power).toBe("spark");
    expect(game.enemies).toHaveLength(0);
  });

  it("spits the stored power", () => {
    const game = new PuffinGame();
    game.start();
    game.power = "leaf";
    game.step(1, { spit: true });
    expect(game.power).toBeNull();
    expect(game.shots[0].type).toBe("leaf");
  });
});
