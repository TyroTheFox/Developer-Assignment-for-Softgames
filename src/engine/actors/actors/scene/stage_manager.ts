import * as PIXI from "pixi.js";
import { Scene } from "./scene";
import { SceneStage } from "./scene_stage";
import { GameScreen } from "../../../screen/game_screen";

export type sceneListPair = {
    key: string,
    scene: Scene
}

export type stageListPair = {
    key: string,
    initialStage: string
}

/**
 * Stage Manager
 * 
 * The engine uses simple state mechanisms switch between different 'Scenes' that are hosted on different 'Stages'.
 * 
 * The Stage Manager swaps the Scenes each Stage can display. The metaphor of Scenes and Stages standing in for
 * layers of screens the engine can display and allowing for the seperation of opperation.
 * 
 * Each Scene is a state that is played out on each Stage. Technically any scene can be placed in any stage but some scenes
 * are intended to work in tandem.
 * 
 * The Stage Manager handles transitions between scenes and allows access to each, while also being the biting point
 * for the engine to update the rest of the game with.
 * 
 * @class
 * @extends {PIXI.Text}
 */
export class StageManager {
    static #instance: StageManager;
    private stageMap: Map<string, SceneStage> = new Map();
    private sceneMap: Map<string, Scene> = new Map();
    public gameScreen = GameScreen.instance;

    /**
     * @constructor
     * @private
     */
    private constructor() {}

    /**
     * @public
     * @static
     * @returns {StageManager}
     */
    public static instance(): StageManager {
        if (!StageManager.#instance) {
            StageManager.#instance = new StageManager();
        }

        return StageManager.#instance;
    }

    /**
     * Initialises the Stage Manager
     * 
     * @param {sceneListPair[]} sceneList - List of Scenes to Add
     * @param {stageListPair[]} stageList - List of Stages to Add
     * @param {PIXI.Container} baseContainer - Base Container from PIXI.App
     */
    public async init(sceneList: sceneListPair[], stageList: stageListPair[], baseContainer: PIXI.Container) {
        const promises = [];
        
        for (let i = 0; i < sceneList.length; i++) {
            const {key, scene} = sceneList[i];
            this.sceneMap.set(key, scene);
            baseContainer.addChild(scene);
            promises.push(scene.init());
        }

        for (let i = 0; i < stageList.length; i++) {
            const {key, initialStage} = stageList[i];
            const newStage = this.sceneMap.get(initialStage);

            if (newStage) {
                const newSceneStage = new SceneStage();
                promises.push(newSceneStage.init(newStage, this));
                this.stageMap.set(key, newSceneStage);
            }
        }

        await Promise.all(promises);
    }

    /**
     * Change to another Scene on a given Stage
     * 
     * @param {string} stage - Stage to swap the Scene of
     * @param {string} newScene - Scene to swap to
     */
    public async changeScene(stage: string, newScene: string) {
        const currentStage = this.stageMap.get(stage);

        if (currentStage) {
            const scene = this.sceneMap.get(newScene);

            if (scene) {
                await currentStage.transitionTo(scene);
            }
        }
    }

    /**
     * Updates each registered Stage
     * Each Stage only updates it's relavent Scene
     * 
     * @param {PIXI.Ticker} time - PIXI Ticker
     */
    public updateStages(time: PIXI.Ticker) {
        this.stageMap.forEach((stage: SceneStage) => {
            stage.updateCurrentScene(time);
        });
    }
}