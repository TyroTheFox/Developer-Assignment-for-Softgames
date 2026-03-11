import * as PIXI from 'pixi.js';
import { SceneStage } from './scene_stage';
import { ActorFactory, BaseActorData } from '../../actor_factory';
import { StageManager } from './stage_manager';
import { AssetLoader } from '../../../assets/asset_loader';
import { EE, GameScreen } from '../../../screen/game_screen';

export type SceneContainerOptions = BaseActorData & PIXI.ContainerOptions & {
    settings?: any,
    actors: any[]
}

export class Scene extends PIXI.Container {
    protected stage!: SceneStage;
    protected stageManager!: StageManager;
    protected actorFactory = ActorFactory.instance;
    protected assetLoader = AssetLoader.instance;
    protected gameScreen = GameScreen.instance;

    protected actorMap: Map<string, any> = new Map();

    protected sceneSettingsData: any;
    protected sceneActorData: any[];
    
    constructor(options: SceneContainerOptions) {
        super(options);

        this.visible = false;

        this.sceneActorData = options.actors;
        this.sceneSettingsData = options?.settings || {};

        const { actors } = options;
        const scaleWithScreen = 'scaleWithScreen' in this.sceneSettingsData ? this.sceneSettingsData.scaleWithScreen : true;

        const { width: gameWidth, height: gameHeight, scaleWithValue, scaleAgainstValue } = this.gameScreen.gameScreenDimensions;

        EE.on('game_resize', (width, height, scaleWithValue, scaleAgainstValue) => this.resize(width, height, scaleWithScreen ? scaleWithValue : scaleAgainstValue));

        this.resize(gameWidth, gameHeight, scaleWithScreen ? scaleWithValue : scaleAgainstValue);

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

    public resize(width: number, height: number, scale: number) {
        this.x = width * 0.5;
        this.y = height * 0.5;
        this.scale = scale;

        this.actorMap.forEach(() => {
            this.emit('scene_resize', width, height, scale);
        });
    }

    public async init() {};
    public async onEnter() {};
    public update(_time: PIXI.Ticker) {};
    public async onExit() {};
}