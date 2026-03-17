import * as PIXI from "pixi.js";
import { PositionalActorData } from "../../actor_factory";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { GameScreen } from "../../../screen/game_screen";
import { TilingSprite } from "../../actors/sprite/tiling_sprite";

export type TilingSpriteCreatorData = PositionalActorData & {
    texture: string;
}

/**
 * Creates Tiled Sprite Actors
 * 
 * @class
 * @extends {BaseFactoryCreator<TilingSprite>}
 */
export class TilingSpriteCreator extends BaseFactoryCreator<TilingSprite> {
    /**
     * Builds the Actor
     * 
     * @public
     * @param {TilingSpriteCreatorData} data - Actor Data used to make the Actor
     * @param {PIXI.Container} parent - The Parent to add the Actor to
     * @returns {Sprite}
     */
    public build(data: TilingSpriteCreatorData, parent: PIXI.Container): TilingSprite {
        const gameScreen = GameScreen.instance;
        const { id, texture, anchor, x, y, pivotX, pivotY, xExactPos, yExactPos, scale, visible, alpha, rotation, angle, zIndex, cullable, tint } = data;

        let caluclatedX = xExactPos ? xExactPos : (x ?? 0) * gameScreen.gameScreenDimensions.width;
        let caluclatedY = yExactPos ? yExactPos : (y ?? 0) * gameScreen.gameScreenDimensions.height;

        const sprite = new TilingSprite({
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
            cullable: cullable ?? false,
            pivot: { x: pivotX ?? 0, y: pivotY ?? 0 },
            tint: tint ?? undefined
        }, data, parent);

        return sprite;
    }
}