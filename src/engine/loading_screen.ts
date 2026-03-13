import * as PIXI from "pixi.js";
import { GameScreenDimensions } from "./screen/game_screen";

export class LoadingScreen {
    protected loadingScreenContainer: PIXI.Container = new PIXI.Container();
    protected background!: PIXI.Sprite;
    protected loadingText!: PIXI.Text;

    constructor(baseContainer: PIXI.Container, gameScreenDimensions: GameScreenDimensions) {
        baseContainer.addChild(this.loadingScreenContainer);
        this.loadingScreenContainer.zIndex = 20000;

        this.background = new PIXI.Sprite({
            texture: PIXI.Texture.WHITE,
            position: { x: gameScreenDimensions.width * 0.5, y: gameScreenDimensions.width * 0.5 },
            width: gameScreenDimensions.width,
            height: gameScreenDimensions.height,
            anchor: 0.5,
            tint: 'black'
        });
        this.loadingScreenContainer.addChild(this.background);

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

    public hideLoadingScreen() {
        this.loadingScreenContainer.visible = false;
    }

    public resize(width: number, height: number, _scaleWithValue: number, _scaleAgainstValue: number) {
        this.background.x = width * 0.5;
        this.background.y = height * 0.5;
        this.background.width = width;
        this.background.height = height;

        this.loadingText.x = (width * 0.5) - (this.loadingText.width * 0.5);
        this.loadingText.y = (height * 0.5) - (this.loadingText.height * 0.5);
    }
}