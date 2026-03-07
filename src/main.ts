import { Application, Assets, Sprite } from "pixi.js";
import { AssetLoader } from "./engine/assets/asset_loader";
import { initDevtools } from '@pixi/devtools';

(async () => {
  const assetLoader = AssetLoader.instance;
  const actorFactory = AssetLoader.instance;

  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  initDevtools({ app });
  
  await assetLoader.loadAssetManifestBundleData();
  await assetLoader.loadAssetBundles();

  // Load the bunny texture
  // const texture = await Assets.load(Assets.get('cards_club_2'));

  // Create a bunny Sprite
  const bunny = new Sprite(Assets.get('cards_club_2'));

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage
  app.stage.addChild(bunny);

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;
  });
})();
