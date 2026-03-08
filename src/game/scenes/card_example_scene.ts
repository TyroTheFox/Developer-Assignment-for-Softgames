import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";

export class CardExampleScene extends Scene {
    private testSprite!: PIXI.Sprite;

    public override async init(): Promise<void> {
        this.testSprite = this.getChildByLabel('test') as PIXI.Sprite;
    }

    public override update(time: PIXI.Ticker): void {
        this.testSprite.rotation += 0.1 * time.deltaTime;
    }
}