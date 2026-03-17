import * as PIXI from "pixi.js";
import { Application } from "pixi.js";
import { AssetLoader } from "../assets/asset_loader";
import EventEmitter from 'eventemitter3';
import { sceneListPair, stageListPair, StageManager } from "../actors/actors/scene/stage_manager";
import { initDevtools } from '@pixi/devtools';
import { LoadingScreen } from "../loading_screen";

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();
export const EE: EventEmitter = new EventEmitter();

export type GameScreenDimensions = {
    width: number,
    height: number,
    scaleWithValue: number,
    scaleAgainstValue: number
}

/** 
 * @class
 * 
 * Game Screen
 * Handles Scaling and the general On-Screen Elements, as well as initalises the App
 */
export class GameScreen {
    static #instance: GameScreen;

    public assetLoader: AssetLoader = AssetLoader.instance;
    public stageManager!: StageManager;
    public fpsCounter!: PIXI.Text;
    public clickScreenNotice!: PIXI.Text;
    public clickScreenOverlayGraphic!: PIXI.Graphics;
    public loadingScreen!: LoadingScreen;
    public staticOverlayContainer!: PIXI.Container;

    // Minimum Expected Size of the In-Game Screen
    public minWidth = 1500;
    public minHeight = 800;

    // Dimentions of the In-Game Screen
    public gameScreenDimensions: GameScreenDimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
        scaleWithValue: 1,
        scaleAgainstValue: 1
    }

    /**
     * @private
     * @constructor
     */
    private constructor() {
        initDevtools({ app });
    }

    /**
     * @get
     * @static
     * @public
     */
    public static get instance(): GameScreen {
        if (!GameScreen.#instance) {
            GameScreen.#instance = new GameScreen();
        }

        return GameScreen.#instance;
    }

    /**
     * Initialises the whole game
     * 
     * @async
     */
    public async initGame() {
        // Check if on mobile phone
        const isMobile = this.assetLoader.isMobile();

        //Initialise app
        await app.init({ 
            background: "#000000", 
            resolution: window.devicePixelRatio * (isMobile ? 0.5 : 1),
            antialias: false,
        });

        // Append the application canvas to the document body
        document.getElementById("pixi-container")!.appendChild(app.canvas);
        app.canvas.setAttribute('allow', 'fullscreen');

        this.loadingScreen = new LoadingScreen(app.stage, this.gameScreenDimensions);

        // Set up window resize event listener
        window.addEventListener('resize', () => {
            this.resize();
        });
        // Trigger the first resize
        this.resize();

        app.stage.sortableChildren = true;

        // FPS Counter
        this.fpsCounter = new PIXI.Text({
            x: this.gameScreenDimensions.width * 0.05,
            y: this.gameScreenDimensions.height * 0.05,
            text: "0",
            style: {
                fontSize: 20,
                fill: 'white',
                stroke: 'black',
                align: 'center'
            },
        });

        this.fpsCounter.zIndex = 1000;
        app.stage.addChild(this.fpsCounter);

        // Static UI Element Contaiiner
        this.staticOverlayContainer = new PIXI.Container({ label: "StaticOverlay", zIndex: 999 });
        app.stage.addChild(this.staticOverlayContainer);

        this.clickScreenNotice = new PIXI.Text({
            x: this.gameScreenDimensions.width * 0.5,
            y: this.gameScreenDimensions.height * 0.5,
            text: "Click to Go Full Screen",
            style: {
                fontSize: 80,
                fill: 'white',
                stroke: 'black',
                align: 'center'
            }
        });

        // Full Screen Click Notice elements
        this.clickScreenNotice.pivot.x = this.clickScreenNotice.width * 0.5;

        this.clickScreenNotice.zIndex = 1000;

        app.stage.addChild(this.clickScreenNotice);

        this.clickScreenOverlayGraphic = new PIXI.Graphics({alpha: 0.7})
            .rect(-100, -100, 200, 200)
            .fill({
                color: 'black'
            });
        app.stage.addChild(this.clickScreenOverlayGraphic);
        this.clickScreenOverlayGraphic.x = this.gameScreenDimensions.width * 0.5;
        this.clickScreenOverlayGraphic.y = this.gameScreenDimensions.height * 0.5;
        this.clickScreenOverlayGraphic.zIndex = 999;
    }

    /**
     * Requests the Game to go to Full Screen
     * 
     * @returns {void}
     * @public
     */
    public setFullScreen() {        
        if(this.isFullScreen()) {
            return;
        }

        app.canvas.requestFullscreen().then(() => {
            this.clickScreenNotice.visible = false;
            this.clickScreenOverlayGraphic.visible = false;
            this.resize();
        })
        .catch((err) => {
            console.error(`Error enabling fullscreen: ${err.message}`);
        });

        this.clickScreenNotice.visible = true;
        this.clickScreenOverlayGraphic.visible = true;

        this.resize();
    }

    /**
     * Checks if currently in Full Screen mode
     * 
     * @returns {boolean}
     * @public 
     */
    public isFullScreen(): boolean {
        // Check for programmatic full screen (Fullscreen API)
        const programmaticFullScreen = !!document.fullscreenElement;
        
        // Check for user-triggered full screen (DOM measurements)
        const viewportHeight = window.innerHeight;
        const availableScreenHeight = screen.availHeight;
        const tolerance = 50;
        const userTriggeredFullScreen = Math.abs(viewportHeight - availableScreenHeight) < tolerance;
        
        // Return true if either condition is met
        return programmaticFullScreen || userTriggeredFullScreen;
    }

    /**
     * Loads all the Game Scenes and starts the game proper
     * 
     * @public
     * @async
     * @param {sceneListPair[]} sceneList 
     * @param {stageListPair[]} stageList 
     */
    public async loadGame(sceneList: sceneListPair[], stageList: stageListPair[]) {
        this.stageManager = StageManager.instance();
        await this.stageManager.init(sceneList, stageList, app.stage);
        this.resize();
        this.loadingScreen.hideLoadingScreen();
    }

    /**
     * Begins updating Scenes
     * 
     * @public
     */
    public beginUpdateLoop() {
        // Listen for animate update
        app.ticker.add((time) => {
            this.stageManager.updateStages(time);
            this.fpsCounter.text = `${time.FPS.toFixed(2)}`;
        });
    }

    /**
     * Changes a Staged Scene for a new Registered One
     * 
     * @param {string} stageName 
     * @param {string} sceneName 
     */
    public async changeScene(stageName: string, sceneName: string) {
        await this.stageManager.changeScene(stageName, sceneName);
    }

    /**
     * Resizes the In-Game Screen and rearranges the assets for everything else
     * 
     * @returns {{ width: number, height: number, scaleWithValue: number, scaleAgainstValue: number }}
     */
    public resize(): { width: number, height: number, scaleWithValue: number, scaleAgainstValue: number } {
        // Check for Full Screen to see if the Notice can come down
        if (this.clickScreenNotice) {
            this.clickScreenNotice.visible = !this.isFullScreen();
            this.clickScreenOverlayGraphic.visible = !this.isFullScreen();
        }

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

        /**
         * @emits GameScreen#event:game_resize
         * @param {number} width
         * @param {number} height
         * @param {number} scaleWithValue
         * @param {number} scaleAgainstValue
         */
        EE.emit('game_resize', width, height, inverseScale, scale);

        if (this.loadingScreen.visible) {
            this.loadingScreen.resize(width, height);
        }

        if (this.clickScreenNotice) {
            this.clickScreenNotice.position.set(width * 0.5, height * 0.5);
            this.clickScreenNotice.pivot.x = this.clickScreenNotice.width * 0.5;

            this.clickScreenOverlayGraphic.x = this.gameScreenDimensions.width * 0.5;
            this.clickScreenOverlayGraphic.y = this.gameScreenDimensions.height * 0.5;
            this.clickScreenOverlayGraphic.width = width;
            this.clickScreenOverlayGraphic.height = height;
        }

        return { width, height, scaleWithValue: inverseScale, scaleAgainstValue: scale };
    }
}