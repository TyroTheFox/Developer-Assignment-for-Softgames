import * as PIXI from 'pixi.js';
import * as PIXIUI from "@pixi/ui";
import { GameScreen } from '../../../screen/game_screen';
import { FancyButtonCreatorData } from '../../factory_creators/ui/fancy_button_creator';

export class FancyButton extends PIXIUI.FancyButton {
    private gameScreen = GameScreen.instance;
    protected actorData!: FancyButtonCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    
    constructor(options: PIXIUI.ButtonOptions, data: FancyButtonCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

        this.calculateHitArea();

        this.onPress.connect(() => this.calculateHitArea());
        this.onDown.connect(() => this.calculateHitArea());
        this.onUp.connect(() => this.calculateHitArea());
        this.onHover.connect(() => this.calculateHitArea());
        this.onOut.connect(() => this.calculateHitArea());
        this.onUpOut.connect(() => this.calculateHitArea());
    }

    public override setState(newState: 'default' | 'hover' | 'pressed' | 'disabled', force?: boolean): void {
        super.setState(newState, force);

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

        this.calculateHitArea();
    }

    private calculateHitArea() {
        const bounds = this.getLocalBounds();
        const shape = new PIXI.Rectangle(bounds.left, bounds.top, bounds.width, bounds.height);
        this.hitArea = shape;
    }
}