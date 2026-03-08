import { Application } from "pixi.js";
import { AssetLoader } from "../assets/asset_loader";
import { sceneListPair, stageListPair, StageManager } from "../actors/actors/scene/stage_manager";

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

export class GameScreen {
    static #instance: GameScreen;
    public assetLoader: AssetLoader = AssetLoader.instance;
    public stageManager!: StageManager;

    public minWidth = 1000;
    public minHeight = 1000;

    private constructor() {}

    public static get instance(): GameScreen {
        if (!GameScreen.#instance) {
            GameScreen.#instance = new GameScreen();
        }

        return GameScreen.#instance;
    }

    public async initGame() {
        await app.init({ 
            background: "#1099bb", 
            resolution: Math.max(window.devicePixelRatio, 2),
        });

        // Append the application canvas to the document body
        document.getElementById("pixi-container")!.appendChild(app.canvas);

        // Set up window resize event listener
        window.addEventListener('resize', this.resize);
        // Trigger the first resize
        this.resize();
    }

    public async loadGame(sceneList: sceneListPair[], stageList: stageListPair[]) {
        this.stageManager = StageManager.instance(sceneList, stageList, app.stage);
    }

    public beginUpdateLoop() {
        // Listen for animate update
        app.ticker.add((time) => {
            this.stageManager.updateStages(time);
        });
    }

    public async changeScene(stageName: string, sceneName: string) {
        await this.stageManager.changeScene(stageName, sceneName);
    }

    protected resize() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate renderer and canvas sizes based on current dimensions
        const scaleX = windowWidth < this.minWidth ? this.minWidth / windowWidth : 1;
        const scaleY = windowHeight < this.minHeight ? this.minHeight / windowHeight : 1;
        const scale = scaleX > scaleY ? scaleX : scaleY;
        const width = windowWidth * scale;
        const height = windowHeight * scale;

        // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
        app.renderer.canvas.style.width = `${windowWidth}px`;
        app.renderer.canvas.style.height = `${windowHeight}px`;
        window.scrollTo(0, 0);

        // Update renderer screen dimensions
        app.renderer.resize(width, height);
    }
}