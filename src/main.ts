import "./styles.css";
import { Game, gameRef } from "@/core/Game";

const game = new Game();
gameRef.g = game;
game.start();

(window as unknown as { Emberroot: Game }).Emberroot = game;
