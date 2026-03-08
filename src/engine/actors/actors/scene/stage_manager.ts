import * as PIXI from "pixi.js";
import { Scene } from "./scene";
import { SceneStage } from "./scene_stage";

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

    private constructor(sceneList: sceneListPair[], stageList: stageListPair[], baseContainer: PIXI.Container) {
        for (let i = 0; i < sceneList.length; i++) {
            const {key, scene} = sceneList[i];
            this.sceneMap.set(key, scene);
            baseContainer.addChild(scene);
            scene.init();
        }

        for (let i = 0; i < stageList.length; i++) {
            const {key, initialStage} = stageList[i];
            const newStage = this.sceneMap.get(initialStage);

            if (newStage) {
                this.stageMap.set(key, new SceneStage(newStage, this));
            }
        }
    }

    public static instance(sceneList: sceneListPair[], stageList: stageListPair[], baseContainer: PIXI.Container): StageManager {
        if (!StageManager.#instance) {
            StageManager.#instance = new StageManager(sceneList, stageList, baseContainer);
        }

        return StageManager.#instance;
    }

    public changeScene(stage: string, newScene: string) {
        const currentStage = this.stageMap.get(stage);

        if (currentStage) {
            const scene = this.sceneMap.get(newScene);

            if (scene) {
                currentStage.transitionTo(scene);
            }
        }
    }

    public updateStages(time: PIXI.Ticker) {
        this.stageMap.forEach((stage: SceneStage) => {
            stage.updateCurrentScene(time);
        });
    }
}