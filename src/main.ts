import { Application } from "pixi.js";
import { AssetLoader } from "./engine/assets/asset_loader";
import { initDevtools } from '@pixi/devtools';
import { StageManager } from "./engine/actors/actors/scene/stage_manager";

import cardExampleSceneData from './data/scenes/card_example_scene.json' assert {type: 'json'};
import { CardExampleScene } from "./game/scenes/card_example_scene";

(async () => {
  // Create a new application
  const app = new Application();

  const assetLoader = AssetLoader.instance;

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  initDevtools({ app });
  
  await assetLoader.loadAssetManifestBundleData();
  await assetLoader.loadAssetBundles();

  const mainStageManager = StageManager.instance(
    [
      { key: "card_example", scene: new CardExampleScene(cardExampleSceneData) }
    ], 
    [
      { key: "main", initialStage: "card_example"}
    ], 
    app.stage
  );

  mainStageManager.changeScene("main", "card_example");

  // Listen for animate update
  app.ticker.add((time) => {
    mainStageManager.updateStages(time);
  });
})();
