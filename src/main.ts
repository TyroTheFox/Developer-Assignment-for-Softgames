import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { app, GameScreen } from "./engine/screen/game_screen";
import { AssetLoader } from "./engine/assets/asset_loader";

import { EmptyUI } from "./game/scenes/empty_ui";

// Game Menu
import { GameMenuScene } from "./game/scenes/game_menu_scene";
import gameMenuSceneData from './data/scenes/game_menu_scene.json' assert {type: 'json'};

// "Ace of Shadows" Card Example
import { CardExampleScene } from "./game/scenes/card_example_scene";
import cardExampleSceneData from './data/scenes/card_example_scene.json' assert {type: 'json'};

import { CardExampleUI } from "./game/scenes/card_example_ui";
import cardExampleUIData from './data/scenes/card_example_ui.json' assert {type: 'json'};

// "Magic Words" Dialogue Scene
import { DialogueExampleScene } from "./game/scenes/dialogue_example_scene";
import dialogueExampleScene from './data/scenes/dialogue_example_scene.json' assert {type: 'json'};

import { DialogueExampleUI } from "./game/scenes/dialogue_example_ui";
import dialogueExampleUIData from './data/scenes/dialogue_example_ui.json' assert {type: 'json'};

// "Phoenix Flame" Particle Effect Scene
import { FireEmitterScene } from "./game/scenes/fire_emitter_scene";
import fireEmitterSceneData from './data/scenes/fire_emitter_scene.json' assert {type: 'json'};

export const mainGameScreen = GameScreen.instance;

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

(async () => {
  const assetLoader: AssetLoader = AssetLoader.instance;
  await mainGameScreen.initGame();

  app.canvas.addEventListener ("click", mainGameScreen.setFullScreen);

  await assetLoader.loadAssetManifestBundleData();
  await assetLoader.loadAssetBundles();

  await mainGameScreen.loadGame(
    [
      { key: "empty_ui",              scene: new EmptyUI({"id": "empty scene", "type": "scene", "settings": {}, "actors": []}) },

      { key: "card_example",          scene: new CardExampleScene(cardExampleSceneData) },
      { key: "card_example_ui",       scene: new CardExampleUI(cardExampleUIData) },

      { key: "fire_emitter",          scene: new FireEmitterScene(fireEmitterSceneData) },

      { key: "dialogue_example",      scene: new DialogueExampleScene(dialogueExampleScene) },
      { key: "dialogue_example_ui",   scene: new DialogueExampleUI(dialogueExampleUIData) },

      { key: "main_menu",             scene: new GameMenuScene(gameMenuSceneData) }
    ], 
    [
      { key: "main",                  initialStage: "fire_emitter" },
      { key: "hud",                   initialStage: "empty_ui" },
      { key: "menu",                  initialStage: "main_menu" }
    ]
  );

  mainGameScreen.beginUpdateLoop();
})();
