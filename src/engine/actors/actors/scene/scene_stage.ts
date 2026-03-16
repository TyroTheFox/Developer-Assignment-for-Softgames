import * as PIXI from "pixi.js";
import { Scene } from "./scene";
import { StageManager } from "./stage_manager";
import { EE } from "../../../screen/game_screen";

export class SceneStage {
    /**
     * @type {State} A reference to the current state of the Context.
     */
    private scene!: Scene;
    private allowUpdate: boolean = false;
    protected stageManager!: StageManager;

    public async init(state: Scene, stageManager: StageManager) {
        this.stageManager = stageManager;
        await this.transitionTo(state);

        EE.on('game_resize', (width, height, scaleWithValue, scaleAgainstValue) => this.scene.resize(width, height, scaleWithValue, scaleAgainstValue));
    }

    /**
     * The Context allows changing the State object at runtime.
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

    public updateCurrentScene(time: PIXI.Ticker) {
        if (this.allowUpdate) {
            this.scene.update(time);
        }
    }
}