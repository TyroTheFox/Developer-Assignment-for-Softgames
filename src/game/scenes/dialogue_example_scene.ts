import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Sprite } from "../../engine/actors/actors/sprite";

export class DialogueExampleScene extends Scene {
    private testSprite!: PIXI.Sprite;

    public override async init(): Promise<void> {
        this.testSprite = this.getChildByLabel('test') as Sprite;
    }

    public override update(time: PIXI.Ticker): void {
        this.testSprite.rotation += 0.1 * time.deltaTime;
    }
}