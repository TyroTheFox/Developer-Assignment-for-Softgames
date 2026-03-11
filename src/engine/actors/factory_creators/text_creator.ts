import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../base_factory_creator";
import { PositionalActorData } from "../actor_factory";
import { GameText } from "../actors/text";

export type TextCreatorData = PositionalActorData & {
    text?: string,
    style?: PIXI.TextStyleOptions
}

export class TextCreator extends BaseFactoryCreator<GameText> {
    public build(data: TextCreatorData, parent: PIXI.Container): GameText {
        const { id, text, style, anchor, x, y, xExactPos, yExactPos, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, cullable } = data;

        let caluclatedX = xExactPos ? xExactPos : (x || 0) * parent.width;
        let caluclatedY = yExactPos ? yExactPos : (y || 0) * parent.height;

        const gameText = new GameText({
            text: text,
            style: style,
            anchor: anchor || 0.5,
            position: { x: caluclatedX, y: caluclatedY },
            scale: { x: scale?.x || 1, y: scale?.y || 1 },
            rotation: rotation || undefined,
            angle: angle || undefined,
            zIndex: zIndex || 0,
            label: id || "text",
            visible: visible || true,
            alpha: alpha || 1,
            cullable: cullable || true,
            pivot: { x: pivotX || 0, y: pivotY || 0 }
        }, data, parent);
        
        return gameText;
    }
}