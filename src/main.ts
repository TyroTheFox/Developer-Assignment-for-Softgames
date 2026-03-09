import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";
import { app, GameScreen } from "./engine/screen/game_screen";
import { AssetLoader } from "./engine/assets/asset_loader";

// Game Menu
import { GameMenuScene } from "./game/scenes/game_menu_scene";
import gameMenuSceneData from './data/scenes/game_menu_scene.json' assert {type: 'json'};

// "Ace of Shadows" Card Example
import { CardExampleScene } from "./game/scenes/card_example_scene";
import cardExampleSceneData from './data/scenes/card_example_scene.json' assert {type: 'json'};

export const mainGameScreen = GameScreen.instance;
gsap.registerPlugin(PixiPlugin);

(async () => {
  const assetLoader: AssetLoader = AssetLoader.instance;
  await mainGameScreen.initGame();

  app.canvas.addEventListener ("click", mainGameScreen.setFullScreen);

  await assetLoader.loadAssetManifestBundleData();
  await assetLoader.loadAssetBundles();

  await mainGameScreen.loadGame(
    [
      { key: "card_example", scene: new CardExampleScene(cardExampleSceneData) },
      { key: "main_menu", scene: new GameMenuScene(gameMenuSceneData) }
    ], 
    [
      { key: "main", initialStage: "card_example" },
      { key: "menu", initialStage: "main_menu" }
    ]
  );

  mainGameScreen.beginUpdateLoop();
})();
