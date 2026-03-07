import * as PIXI from 'pixi.js';
import { SceneStage } from '../scene_stage';

export type SceneContainerOptions = PIXI.ContainerOptions & {
    sceneSettingsData?: any,
    sceneActorData: any[]
}

export class Scene extends PIXI.Container {
    protected stage!: SceneStage;

    protected sceneSettingsData: any;
    protected sceneActorData: any[];
    
    constructor(options: SceneContainerOptions) {
        super(options);

        this.sceneActorData = options.sceneActorData;
        this.sceneSettingsData = options?.sceneSettingsData || {};
    }

    public setStage(stage: SceneStage) {
        this.stage = stage;
    }
}