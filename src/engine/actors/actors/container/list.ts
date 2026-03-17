import * as PIXI from 'pixi.js';
import * as PIXIUI from "@pixi/ui";
import { GameScreen } from '../../../screen/game_screen';
import { ListCreatorData } from '../../factory_creators/container/list_creator';

/**
 * List
 * A PIXI UI container that arranges it's children neatly
 * 
 * @class
 * @extends {PIXIUI.List}
 */
export class List extends PIXIUI.List {
    private gameScreen = GameScreen.instance;
    protected actorData!: ListCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    
    /**
     * @constructor
     * @param {PIXIUI.ListOptions} options 
     * @param {ListCreatorData} data 
     * @param {?PIXI.Container} parent 
     */
    constructor(options: PIXIUI.ListOptions, data: ListCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            /**
             * Updates the internal position when the scene resizes
             * 
             * @listens this.parent#event:scene_resize
             */
            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

        /**
         * @listens List#event:childAdded
         */
        this.on('childAdded', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
        /**
         * @listens List#event:childRemoved
         */
        this.on('childRemoved', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
    }
     
    /**
     * Position of X as a percentage of the Screen
     * 
     * @set
     * @param {number} coord
     */
    public set gameX(coord: number) {
        this.gamePosition.x = coord;
        this.x = this.gameScreen.gameScreenDimensions.width * this.gamePosition.x;
    }

    /**
     * Position of Y as a percentage of the Screen
     * 
     * @set
     * @param {number} coord
     */
    public set gameY(coord: number) {
        this.gamePosition.y = coord;
        this.y = this.gameScreen.gameScreenDimensions.height * this.gamePosition.y;
    }

    /**
     * Relative Pivot X Position of the Object
     * 
     * @set
     * @param {number} coord
     */
    public set pivotX(coord: number) {
        this.pivot.x = coord;
    }

    /**
     * Relative Pivot Y Position of the Object
     * 
     * @set
     * @param {number} coord
     */
    public set pivotY(coord: number) {
        this.pivot.y = coord;
    }

    /**
     * Repositions the Actor
     * 
     * @param {number} width 
     * @param {number} height 
     */
    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : width * (this.gamePosition.x ?? 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : height * (this.gamePosition.y ?? 0);

        this.x = caluclatedX;
        this.y = caluclatedY;

        /**
         * Updates the internal position when the scene resizes
         * 
         * @emit List#event:scene_resize
         */
        this.emit('scene_resize', width, height);
    }
}