import * as PIXI from 'pixi.js';
import { GameScreen } from '../../../screen/game_screen';
import { TextCreatorData } from '../../factory_creators/ui/text_creator';

/**
 * Game Text
 * Displays Text to the Screen
 * 
 * @class
 * @extends {PIXI.Text}
 */
export class GameText extends PIXI.Text {
    private gameScreen = GameScreen.instance;
    protected actorData!: TextCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    
    /**
     * @constructor
     * @param {PIXI.CanvasTextOptions} options 
     * @param {TextCreatorData} data 
     * @param {?PIXI.Container} parent 
     */
    constructor(options: PIXI.CanvasTextOptions, data: TextCreatorData, parent?: PIXI.Container) {
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
    }
}