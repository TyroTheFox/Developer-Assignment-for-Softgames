import * as PIXI from 'pixi.js';
import * as PIXIUI from "@pixi/ui";
import { GameScreen } from '../../screen/game_screen';
import { FancyButtonCreatorData } from '../factory_creators/fancy_button_creator';

export class FancyButton extends PIXIUI.FancyButton {
    private gameScreen = GameScreen.instance;
    protected actorData!: FancyButtonCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    
    constructor(options: PIXIUI.ButtonOptions, data: FancyButtonCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x || null, y: data?.y || null };
        this.exactPosition = { x: data?.xExactPos || null, y: data?.yExactPos || null };
        
        if (parent) {
            parent.addChild(this);

            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }
    }

    /**
     * Position of X as a percentage of the Screen
     */
    public set gameX(coord: number) {
        this.gamePosition.x = coord;
        this.x = (this.parent?.width || this.gameScreen.gameScreenDimensions.width) * this.gamePosition.x;
    }

    /**
     * Position of Y as a percentage of the Screen
     */
    public set gameY(coord: number) {
        this.gamePosition.y = coord;
        this.y = (this.parent?.height || this.gameScreen.gameScreenDimensions.height) * this.gamePosition.y;
    }

    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : (this.parent?.width || width) * (this.gamePosition.x || 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : (this.parent?.height || height) * (this.gamePosition.y || 0);

        this.x = caluclatedX;
        this.y = caluclatedY;
    }
}