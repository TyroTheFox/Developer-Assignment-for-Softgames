import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../base_factory_creator";
import { PositionalActorData } from "../actor_factory";
import { Container } from "../actors/container";

export type DrawStep = {
    functionName: string,
    data: any
}

export type DrawnGraphicsCreatorData = PositionalActorData & {
    drawSteps: DrawStep[]
}

export class DrawnGraphicsCreator extends BaseFactoryCreator<Container> {
    public build(data: DrawnGraphicsCreatorData, parent: PIXI.Container): Container {
        const { id, x, y, xExactPos, yExactPos, scale, visible, alpha, rotation, angle, zIndex, cullable, drawSteps } = data;

        let caluclatedX = xExactPos ? xExactPos : (x || 0) * parent.width;
        let caluclatedY = yExactPos ? yExactPos : (y || 0) * parent.height;

        const container = new Container({
            label: id || "button",
            position: { x: caluclatedX, y: caluclatedY },
            scale: { x: scale?.x || 1, y: scale?.y || 1 },
            rotation: rotation || undefined,
            angle: angle || undefined,
            zIndex: zIndex || 0,
            visible: visible || true,
            alpha: alpha || 1,
            cullable: cullable || true
        }, data, parent);

        const graphics = new PIXI.Graphics();

        container.addChild(graphics);

        for (let i = 0; i < drawSteps.length; i++) {
            // const drawStep = drawSteps[i];

            // graphics[drawStep.functionName](...drawStep.data);
        }

        return container;
    }
}