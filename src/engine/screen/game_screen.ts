import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { AssetLoader } from "../assets/asset_loader";
import EventEmitter from 'eventemitter3';
import { sceneListPair, stageListPair, StageManager } from "../actors/actors/scene/stage_manager";
import { initDevtools } from '@pixi/devtools';

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();
export const EE: EventEmitter = new EventEmitter();

export class GameScreen {
    static #instance: GameScreen;
    public assetLoader: AssetLoader = AssetLoader.instance;
    public stageManager!: StageManager;
    public fpsCounter!: PIXI.Text;

    public minWidth = 1000;
    public minHeight = 1000;

    public gameScreenDimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
        scaleWithValue: 1,
        scaleAgainstValue: 1
    }

    private constructor() {
        initDevtools({ app });
    }

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
        app.canvas.setAttribute('allow', 'fullscreen');
        // Set up window resize event listener
        window.addEventListener('resize', () => {
            this.resize();
        });
        // Trigger the first resize
        this.resize();

        this.fpsCounter = new PIXI.Text({
            x: this.gameScreenDimensions.width * 0.05,
            y: this.gameScreenDimensions.height * 0.05,
            text: "0"
        }); 

        app.stage.addChild(this.fpsCounter);
    }

    public setFullScreen() {
        if(window.innerWidth == screen.width && window.innerHeight == screen.height) {
            return;
        }

        app.canvas.requestFullscreen().then(() => {})
        .catch((err) => {
            console.error(`Error enabling fullscreen: ${err.message}`);
        });
    }

    public async loadGame(sceneList: sceneListPair[], stageList: stageListPair[]) {
        this.stageManager = StageManager.instance(sceneList, stageList, app.stage);
        this.resize();
    }

    public beginUpdateLoop() {
        // Listen for animate update
        app.ticker.add((time) => {
            this.stageManager.updateStages(time);
            this.fpsCounter.text = `${time.FPS.toFixed(2)}`;
        });
    }

    public async changeScene(stageName: string, sceneName: string) {
        await this.stageManager.changeScene(stageName, sceneName);
    }

    public resize(): { width: number, height: number, scaleWithValue: number, scaleAgainstValue: number} {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate renderer and canvas sizes based on current dimensions
        const scaleX = windowWidth < this.minWidth ? this.minWidth / windowWidth : 1;
        const scaleY = windowHeight < this.minHeight ? this.minHeight / windowHeight : 1;
        const scale = scaleX > scaleY ? scaleX : scaleY;
        const width = windowWidth * scale;
        const height = windowHeight * scale;
        const inverseScale = 1 / scale;

        if (this.fpsCounter) {
            this.fpsCounter.scale = scale;
        }

        // Update canvas style dimensions and scroll window up to avoid issues on mobile resize
        app.renderer.canvas.style.width = `${windowWidth}px`;
        app.renderer.canvas.style.height = `${windowHeight}px`;
        window.scrollTo(0, 0);

        // Update renderer screen dimensions
        app.renderer.resize(width, height);

        this.gameScreenDimensions = {width, height, scaleWithValue: inverseScale, scaleAgainstValue: scale};

        EE.emit('game_resize', width, height, inverseScale, scale);

        return { width, height, scaleWithValue: inverseScale, scaleAgainstValue: scale };
    }
}