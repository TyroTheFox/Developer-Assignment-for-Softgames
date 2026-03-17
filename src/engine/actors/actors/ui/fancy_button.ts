import * as PIXI from 'pixi.js';
import * as PIXIUI from "@pixi/ui";
import { GameScreen } from '../../../screen/game_screen';
import { FancyButtonCreatorData } from '../../factory_creators/ui/fancy_button_creator';

/**
 * Fancy Button
 * A more complex version of the basic PIXI UI Button
 * A little finicky but works
 * 
 * @class
 * @extends {PIXIUI.FancyButton}
 */
export class FancyButton extends PIXIUI.FancyButton {
    private gameScreen = GameScreen.instance;
    protected actorData!: FancyButtonCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    
    /**
     * @constructor
     * @param {PIXIUI.ButtonOption} options 
     * @param {FancyButtonCreatorData} data 
     * @param {?PIXI.Container} parent 
     */
    constructor(options: PIXIUI.ButtonOptions, data: FancyButtonCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            /**
             * Updates the internal position when the scene resizes
             * 
             * @listens this.position#event:scene_resize
             */
            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }
    }

    /**
     * Largely here to fix a bug where buttons were still clickable while Disabled
     * 
     * @override
     * @param {'default' | 'hover' | 'pressed' | 'disabled'} newState - The new state to shift to
     * @param {?boolean} force - Force a new state to happen
     */
    public override setState(newState: 'default' | 'hover' | 'pressed' | 'disabled', force?: boolean): void {
        super.setState(newState, force);

        // Make sure it's turning off interactivity while disabled
        if (newState === 'disabled') {
            this.eventMode = 'none';
            this.cursor = 'default';
        } else {
            this.eventMode = 'static';
            this.cursor = 'pointer';
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

        this.updateAnchor();
    }

    /**
     * To ensure the button's Hit Area is correct
     * 
     * @public 
     */
    public calculateHitArea() {
        const bounds = this.getLocalBounds();
        const shape = new PIXI.Rectangle(bounds.left - (bounds.width * 0.5), bounds.top - (bounds.height * 0.5), bounds.width, bounds.height);
        this.hitArea = shape;

        this.updateAnchor();
    }

    /**
     * Here to fix a bug where the Hit Areas were offset erroneous
     * Otherwise updates the Offset of Views
     * 
     * @override
     * @protected
     * @returns {void}
     */
    protected override updateAnchor()
    {
        if (!this._views) return;

        const anchorX = this.anchor.x ?? 0;
        const anchorY = this.anchor.y ?? 0;
        const views = [
            this._views.defaultView,
            this._views.hoverView,
            this._views.pressedView,
            this._views.disabledView,
        ];

        views.forEach((view) =>
        {
            if (!view) return;

            (view as PIXI.Sprite).anchor?.set(0);

            view.x = -view.width * anchorX;
            view.y = -view.height * anchorY;
        });

        if (this._views.defaultView)
        {
            const { x, y, width, height } = this._views.defaultView;

            this.hitArea = new PIXI.Rectangle(x - (width * 0.5), y - (height * 0.5), width, height);
        }

        this.adjustIconView(this.state);
        this.adjustTextView(this.state);
    }
}