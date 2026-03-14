import * as PIXI from "pixi.js";
import { PositionalActorData } from "../../actor_factory";
import { Sprite } from "../../actors/sprite/sprite";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { GameScreen } from "../../../screen/game_screen";

export type SpriteCreatorData = PositionalActorData & {
    texture: string;
}

export class SpriteCreator extends BaseFactoryCreator<Sprite> {
    public build(data: SpriteCreatorData, parent: PIXI.Container): Sprite {
        const gameScreen = GameScreen.instance;
        const { id, texture, anchor, x, y, pivotX, pivotY, xExactPos, yExactPos, scale, visible, alpha, rotation, angle, zIndex, cullable } = data;

        let caluclatedX = xExactPos ? xExactPos : (x ?? 0) * gameScreen.gameScreenDimensions.width;
        let caluclatedY = yExactPos ? yExactPos : (y ?? 0) * gameScreen.gameScreenDimensions.height;

        const sprite = new Sprite({
            label: id ?? "container",
            texture: PIXI.Assets.get(texture),
            anchor: anchor ?? 0.5,
            position: { x: caluclatedX, y: caluclatedY },
            scale: { x: scale?.x ?? 1, y: scale?.y ?? 1 },
            rotation: rotation ?? undefined,
            angle: angle ?? undefined,
            zIndex: zIndex ?? 0,
            visible: visible ?? true,
            alpha: alpha ?? 1,
            cullable: cullable ?? true,
            pivot: { x: pivotX ?? 0, y: pivotY ?? 0 }
        }, data, parent);

        return sprite;
    }
}