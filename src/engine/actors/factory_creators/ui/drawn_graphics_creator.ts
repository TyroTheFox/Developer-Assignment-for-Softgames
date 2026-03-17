import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { PositionalActorData } from "../../actor_factory";
import { GameScreen } from "../../../screen/game_screen";
import { DrawnGraphics } from "../../actors/ui/drawn_graphics";

export type DrawStep = {
    functionName: string,
    data: any
}

export type DrawnGraphicsCreatorData = PositionalActorData & {
    drawSteps: DrawStep[]
}

/**
 * Creates DrawnGraphics Actors
 * 
 * @class
 * @extends {BaseFactoryCreator<DrawnGraphics>}
 */
export class DrawnGraphicsCreator extends BaseFactoryCreator<DrawnGraphics> {
    /**
     * Builds the Actor
     * 
     * @public
     * @param {DrawnGraphicsCreatorData} data - Actor Data used to make the Actor
     * @param {PIXI.Container} parent - The Parent to add the Actor to
     * @returns {DrawnGraphics}
     */
    public build(data: DrawnGraphicsCreatorData, parent: PIXI.Container): DrawnGraphics {
        const gameScreen = GameScreen.instance;
        const { id, x, y, xExactPos, yExactPos, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, cullable } = data;

        let caluclatedX = xExactPos ? xExactPos : (x ?? 0) * gameScreen.gameScreenDimensions.width;
        let caluclatedY = yExactPos ? yExactPos : (y ?? 0) * gameScreen.gameScreenDimensions.height;

        const drawGraphics = new DrawnGraphics({
            label: id ?? "drawnGraphics",
            position: { x: caluclatedX, y: caluclatedY },
            scale: { x: scale?.x ?? 1, y: scale?.y ?? 1 },
            rotation: rotation ?? undefined,
            angle: angle ?? undefined,
            zIndex: zIndex ?? 0,
            visible: visible ?? true,
            alpha: alpha ?? 1,
            cullable: cullable ?? false,
            pivot: { x: pivotX ?? 0, y: pivotY ?? 0 }
        }, data, parent);

        return drawGraphics;
    }
}