import * as PIXI from "pixi.js";
import { GameScreenDimensions } from "./screen/game_screen";

/** 
 * @class
 * 
 * Loading Screen
 * An Overlay that hides everything while things load
 */
export class LoadingScreen {
    protected loadingScreenContainer: PIXI.Container = new PIXI.Container();
    protected background!: PIXI.Sprite;
    protected loadingText!: PIXI.Text;

    /**
     * 
     * @param {PIXI.Container} baseContainer - Base Container from PIXI.App
     * @param {GameScreenDimensions} gameScreenDimensions
     */
    constructor(baseContainer: PIXI.Container, gameScreenDimensions: GameScreenDimensions) {
        baseContainer.addChild(this.loadingScreenContainer);
        this.loadingScreenContainer.zIndex = 20000;

        // Background Sprite
        this.background = new PIXI.Sprite({
            texture: PIXI.Texture.WHITE,
            position: { x: gameScreenDimensions.width * 0.5, y: gameScreenDimensions.width * 0.5 },
            width: gameScreenDimensions.width,
            height: gameScreenDimensions.height,
            anchor: 0.5,
            tint: 'black'
        });
        this.loadingScreenContainer.addChild(this.background);

        // Loading Text
        this.loadingText = new PIXI.Text({
            text: "Loading...",
            position: { x: gameScreenDimensions.width * 0.5, y: gameScreenDimensions.width * 0.5 },
            style: {
                fontSize: 60,
                fill: "white"
            }
        });
        this.loadingScreenContainer.addChild(this.loadingText);
    }

    /**
     * @get
     * @returns {boolean}
     */
    public get visible(): boolean {
        return this.loadingScreenContainer.visible;
    }

    public hideLoadingScreen() {
        this.loadingScreenContainer.visible = false;
    }


    /**
     * Resizes the Loading Screen elements
     * 
     * @param {number} width 
     * @param {number} height 
     */
    public resize(width: number, height: number) {
        this.background.x = width * 0.5;
        this.background.y = height * 0.5;
        this.background.width = width;
        this.background.height = height;

        this.loadingText.x = (width * 0.5) - (this.loadingText.width * 0.5);
        this.loadingText.y = (height * 0.5) - (this.loadingText.height * 0.5);
    }
}