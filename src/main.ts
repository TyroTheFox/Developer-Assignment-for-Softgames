import { GameScreen } from "./engine/screen/game_screen";

// "Ace of Shadows" Card Example
import { CardExampleScene } from "./game/scenes/card_example_scene";
import cardExampleSceneData from './data/scenes/card_example_scene.json' assert {type: 'json'};
import { AssetLoader } from "./engine/assets/asset_loader";

export const mainGameScreen = GameScreen.instance;

(async () => {
  const assetLoader: AssetLoader = AssetLoader.instance;
  await mainGameScreen.initGame();

  await assetLoader.loadAssetManifestBundleData();
  await assetLoader.loadAssetBundles();

  await mainGameScreen.loadGame(
    [
      { key: "card_example", scene: new CardExampleScene(cardExampleSceneData) }
    ], 
    [
      { key: "main", initialStage: "card_example"}
    ]
  );

  mainGameScreen.beginUpdateLoop();
})();
