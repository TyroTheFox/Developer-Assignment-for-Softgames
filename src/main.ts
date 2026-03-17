import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { app, GameScreen } from "./engine/screen/game_screen";
import { AssetLoader } from "./engine/assets/asset_loader";

// A blank Scene
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

import { PhoenixFlameScene } from "./game/scenes/phoenix_flame_scene";
import phoenixFlameSceneData from './data/scenes/phoenix_flame_scene.json' assert {type: 'json'};

// Get Game Screen instance
export const mainGameScreen = GameScreen.instance;

// Register the PIXI Plugin for gsap
gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

(async () => {
  // Get Asset Loader instance
  const assetLoader: AssetLoader = AssetLoader.instance;
  // Initialise the game
  await mainGameScreen.initGame();

  // Hook the Full Screen call into the user clicking the screen
  app.canvas.addEventListener ("click", () => { mainGameScreen.setFullScreen(); });

  // Load the Asset Manifest
  await assetLoader.loadAssetManifestBundleData();
  // Load the Asset Bundles
  await assetLoader.loadAssetBundles();

  // Load the game and define all the scenes of the game
  await mainGameScreen.loadGame(
    [
      // Empty Scene that doesn't contain anything
      { key: "empty_ui",              scene: new EmptyUI({"id": "empty scene", "type": "scene", "settings": {}, "actors": []}) },

      // Card Example
      { key: "card_example",          scene: new CardExampleScene(cardExampleSceneData) },
      { key: "card_example_ui",       scene: new CardExampleUI(cardExampleUIData) },

      // Fire Emitter Scenes
      { key: "fire_emitter",          scene: new FireEmitterScene(fireEmitterSceneData) },
      { key: "phoenix_flame",          scene: new PhoenixFlameScene(phoenixFlameSceneData) },

      // Dialogue Example
      { key: "dialogue_example",      scene: new DialogueExampleScene(dialogueExampleScene) },
      { key: "dialogue_example_ui",   scene: new DialogueExampleUI(dialogueExampleUIData) },

      // Game Menu
      { key: "main_menu",             scene: new GameMenuScene(gameMenuSceneData) }
    ], 
    [// Stages
      { key: "main",                  initialStage: "card_example" },
      { key: "hud",                   initialStage: "card_example_ui" },
      { key: "menu",                  initialStage: "main_menu" }
    ]
  );

  // Start updating the game
  mainGameScreen.beginUpdateLoop();
})();
