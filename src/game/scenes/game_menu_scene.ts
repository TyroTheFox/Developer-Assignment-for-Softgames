import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { List } from "../../engine/actors/actors/list";

export class GameMenuScene extends Scene {
    public override async init(): Promise<void> {
        const list = this.getChildByLabel('menuPanel') as List;
        list.x = 0;
        list.y = window.innerHeight * -0.5;

        const panel = new PIXI.Graphics()
            .rect(-250, 0, 500, 100)
            .fill({ texture: PIXI.Texture.WHITE });

        list.addChild(panel);
    }

    public override update(_time: PIXI.Ticker): void {
        const list = this.getChildByLabel('menuPanel') as List;
        list.y = window.innerHeight * -0.5;
    }
}