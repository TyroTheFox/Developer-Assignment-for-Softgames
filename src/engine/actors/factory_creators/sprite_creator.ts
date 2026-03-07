import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../base_factory_creator";
import { PositionalActorData } from "../actor_factory";

export type SpriteCreatorData = PositionalActorData & {
    texture: string;
}

export class SpriteCreator extends BaseFactoryCreator<PIXI.Sprite> {
    public build(data: SpriteCreatorData, parent?: PIXI.Container): PIXI.Sprite {
        const { id, texture, anchor, x, y, scale, visible, alpha, rotation, angle, zIndex } = data;

        const sprite = new PIXI.Sprite({
            texture: PIXI.Assets.get(texture),
            anchor: anchor || 0.5,
            position: { x: x || 0, y: y || 0},
            scale: { x: scale?.x || 1, y: scale?.y || 1 },
            rotation: rotation || undefined,
            angle: angle || undefined,
            zIndex: zIndex || 0,
            label: id || "container",
            visible: visible || true,
            alpha: alpha || 1
        });
        
        if (parent) {
            parent.addChild(sprite);
        }

        return sprite;
    }
}