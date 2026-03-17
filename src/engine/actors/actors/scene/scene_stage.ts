import * as PIXI from "pixi.js";
import { Scene } from "./scene";
import { StageManager } from "./stage_manager";
import { EE } from "../../../screen/game_screen";

/** 
 * Scene Stage
 * 
 * Like a theatrical scene, Scenes need a Stage to host them and you require a Stage in order to run a Scene.
 * 
 * The 'Layer' class that hosts a Scene. These can be ordered in order to allow concurrent scenes to run ontop of
 * each other. The order they're loaded into the Stage Manager does matter as that's the order each stage will be in.
 * 
 * This allows for a UI layer to sit on top of a Game layer, running concurrently while communicating between each other
 * using the Event Bus. While Scenes are grouped because they're built to work together, it's not necessary to do this.
 * 
 * @class
 */
export class SceneStage {
    /**
     * @type {State} A reference to the current state of the Context.
     */
    private scene!: Scene;
    private allowUpdate: boolean = false;
    protected stageManager!: StageManager;

    /**
     * Initialises the Stage
     * 
     * @param {Scene} scene - The first scene to add to the Stage, cause you can't leave a Stage empty
     * @param {StageManager} stageManager - Stage Manager Instance 
     */
    public async init(scene: Scene, stageManager: StageManager) {
        this.stageManager = stageManager;
        await this.transitionTo(scene);

        /**
         * @listens GameScreen#event:game_resize
         * @param {number} width
         * @param {number} height
         * @param {number} scaleWithValue
         * @param {number} scaleAgainstValue
         */
        EE.on('game_resize', (width, height, scaleWithValue, scaleAgainstValue) => this.scene.resize(width, height, scaleWithValue, scaleAgainstValue));
    }

    /**
     * Switch the Scene of this Stage with a new one
     * 
     * @async
     * @public
     * @param {Scene} scene - New Scene to switch to
     * @returns {Promise<void>}
     */
    public async transitionTo(scene: Scene): Promise<void> {
        const {width, height, scaleWithValue, scaleAgainstValue} = this.stageManager.gameScreen.gameScreenDimensions;
        
        console.log(`Context: Transition to ${(<any>scene).constructor.name}.`);
        this.allowUpdate = false;

        if (scene === this.scene) {
            return;
        }

        if (this.scene) {
            await this.scene.onExit();
            this.scene.visible = false;
        }

        this.scene = scene;
        this.scene.setStage(this, this.stageManager);

        await this.scene.onEnter();
        this.allowUpdate = true;
        this.scene.visible = true;

        this.scene.resize(width, height, scaleWithValue, scaleAgainstValue);
    }

    /**
     * Update the current scene
     * 
     * @param {PIXI.Ticker} time - PIXI Ticker instance
     */
    public updateCurrentScene(time: PIXI.Ticker) {
        if (this.allowUpdate) {
            this.scene.update(time);
        }
    }
}