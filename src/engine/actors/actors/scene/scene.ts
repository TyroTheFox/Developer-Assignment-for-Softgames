import * as PIXI from 'pixi.js';
import { SceneStage } from './scene_stage';
import { ActorFactory, BaseActorData } from '../../actor_factory';
import { StageManager } from './stage_manager';

export type SceneContainerOptions = BaseActorData & PIXI.ContainerOptions & {
    settings?: any,
    actors: any[]
}

export class Scene extends PIXI.Container {
    protected stage!: SceneStage;
    protected stageManager!: StageManager;
    private actorFactory = ActorFactory.instance;

    protected sceneSettingsData: any;
    protected sceneActorData: any[];
    
    constructor(options: SceneContainerOptions) {
        super(options);

        const { actors } = options;

        // Add Child Actors
        for (let i = 0; i < actors.length; i++) {
            const sceneDataEntry = actors[i];
            
            this.actorFactory.buildActor<any, any>(sceneDataEntry, this);
        }

        this.sceneActorData = options.actors;
        this.sceneSettingsData = options?.settings || {};
    }

    public setStage(stage: SceneStage, stageManager: StageManager) {
        this.stage = stage;
        this.stageManager = stageManager;
    }

    public async init() {};
    public async onEnter() {};
    public update(_time: PIXI.Ticker) {};
    public async onExit() {};
}