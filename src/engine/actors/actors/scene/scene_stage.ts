import * as PIXI from "pixi.js";
import { Scene } from "./scene";
import { StageManager } from "./stage_manager";

export class SceneStage {
    /**
     * @type {State} A reference to the current state of the Context.
     */
    private scene!: Scene;
    private allowUpdate: boolean = false;
    protected stageManager!: StageManager;

    constructor(state: Scene, stageManager: StageManager) {
        this.stageManager = stageManager;
        this.transitionTo(state);
    }

    /**
     * The Context allows changing the State object at runtime.
     */
    public async transitionTo(scene: Scene): Promise<void> {
        console.log(`Context: Transition to ${(<any>scene).constructor.name}.`);
        this.allowUpdate = false;
        if (this.scene) {
            await this.scene.onExit();
        }

        this.scene = scene;
        this.scene.setStage(this, this.stageManager);

        await this.scene.onEnter();
        this.allowUpdate = true;
    }

    public updateCurrentScene(time: PIXI.Ticker) {
        if (this.allowUpdate) {
            this.scene.update(time);
        }
    }
}