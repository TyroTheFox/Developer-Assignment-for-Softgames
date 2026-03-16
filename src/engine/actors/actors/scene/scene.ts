import * as PIXI from 'pixi.js';
import { SceneStage } from './scene_stage';
import { ActorFactory, BaseActorData } from '../../actor_factory';
import { StageManager } from './stage_manager';
import { AssetLoader } from '../../../assets/asset_loader';
import { GameScreen } from '../../../screen/game_screen';

export type SceneContainerOptions = BaseActorData & PIXI.ContainerOptions & {
    settings?: any,
    actors: any[]
}

export class Scene extends PIXI.Container {
    public stage!: SceneStage;
    public stageManager!: StageManager;
    public actorFactory = ActorFactory.instance;
    public assetLoader = AssetLoader.instance;
    public gameScreen = GameScreen.instance;

    protected actorMap: Map<string, any> = new Map();

    protected sceneSettingsData: any;
    protected sceneActorData: any[];
    
    constructor(options: SceneContainerOptions) {
        super(options);

        this.visible = false;

        this.sceneActorData = options.actors;
        this.sceneSettingsData = options?.settings || {};

        const { actors } = options;

        const { width: gameWidth, height: gameHeight, scaleWithValue, scaleAgainstValue } = this.gameScreen.gameScreenDimensions;

        this.resize(gameWidth, gameHeight, scaleWithValue, scaleAgainstValue);

        // Add Child Actors
        for (let i = 0; i < actors.length; i++) {
            const sceneDataEntry = actors[i];
            
            const newActor = this.actorFactory.buildActor<any, any>(sceneDataEntry, this);

            this.actorMap.set(sceneDataEntry.id, newActor);
        }
    }

    public setStage(stage: SceneStage, stageManager: StageManager) {
        this.stage = stage;
        this.stageManager = stageManager;
    }

    public resize(width: number, height: number, scaleWithValue: number, scaleAgainstValue: number) {
        const scaleWithScreen = 'scaleWithScreen' in this.sceneSettingsData ? this.sceneSettingsData.scaleWithScreen : true;
        const { minimumWidth } = this.sceneSettingsData;
        const usedScale = scaleWithScreen ? scaleWithValue : scaleAgainstValue

        this.x = width * 0.5;
        this.y = height * 0.5;
        this.scale = usedScale;

        this.actorMap.forEach(() => {
            this.emit('scene_resize', width, height, usedScale);
        });

        if (this.width < (minimumWidth ? minimumWidth : 1000)) {
            this.width = minimumWidth ? minimumWidth : 1000;
            this.scale.y = this.scale.x;
        }
    }

    public async init() {};
    public async onEnter() {};
    public update(_time: PIXI.Ticker) {};
    public async onExit() {};
}