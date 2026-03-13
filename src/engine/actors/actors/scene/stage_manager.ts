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

export class StageManager {
    static #instance: StageManager;
    private stageMap: Map<string, SceneStage> = new Map();
    private sceneMap: Map<string, Scene> = new Map();
    protected gameScreen = GameScreen.instance;

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

    public static instance(): StageManager {
        if (!StageManager.#instance) {
            StageManager.#instance = new StageManager();
        }

        return StageManager.#instance;
    }

    public async changeScene(stage: string, newScene: string) {
        const currentStage = this.stageMap.get(stage);

        if (currentStage) {
            const scene = this.sceneMap.get(newScene);

            if (scene) {
                await currentStage.transitionTo(scene);
            }
        }
    }

    public updateStages(time: PIXI.Ticker) {
        this.stageMap.forEach((stage: SceneStage) => {
            stage.updateCurrentScene(time);
        });
    }
}