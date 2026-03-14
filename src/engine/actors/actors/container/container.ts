import * as PIXI from 'pixi.js';
import { Button } from '@pixi/ui';
import { ContainerCreatorData } from '../../factory_creators/container/container_creator';
import { GameScreen } from '../../../screen/game_screen';

export class Container extends PIXI.Container {
    private gameScreen = GameScreen.instance;
    protected actorData!: ContainerCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    public buttonInstance!: Button;
    
    constructor(options: PIXI.ContainerOptions, data: ContainerCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

        this.on('childAdded', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
        this.on('childRemoved', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
    }

    /**
     * Position of X as a percentage of the Screen
     */
    public set gameX(coord: number) {
        this.gamePosition.x = coord;
        this.x = this.gameScreen.gameScreenDimensions.width * this.gamePosition.x;
    }

    /**
     * Position of Y as a percentage of the Screen
     */
    public set gameY(coord: number) {
        this.gamePosition.y = coord;
        this.y = this.gameScreen.gameScreenDimensions.height * this.gamePosition.y;
    }

    /**
     * Relative Pivot X Position of the Object
     */
    public set pivotX(coord: number) {
        this.pivot.x = coord;
    }

    /**
     * Relative Pivot Y Position of the Object
     */
    public set pivotY(coord: number) {
        this.pivot.y = coord;
    }

    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : width * (this.gamePosition.x ?? 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : height * (this.gamePosition.y ?? 0);

        this.x = caluclatedX;
        this.y = caluclatedY;

        this.emit('scene_resize', width, height);
    }
}