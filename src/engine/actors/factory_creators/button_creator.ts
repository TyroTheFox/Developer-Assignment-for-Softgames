import * as PIXI from "pixi.js";
import { Button } from "@pixi/ui";
import { BaseFactoryCreator } from "../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../actor_factory";
import { Container } from "../actors/container";

export type ButtonCreatorData = PositionalActorData & {
    children?: any[]
}

export class ButtonCreator extends BaseFactoryCreator<Button> {
    public build(data: ButtonCreatorData, parent: PIXI.Container): Button {
        const actorFactory = ActorFactory.instance;
        const { id, x, y, xExactPos, yExactPos, scale, visible, alpha, rotation, angle, zIndex, children, cullable } = data;

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

        // Add children from data
        if (children) {
            for (let i = 0; i < children.length; i++) {
                const sceneDataEntry = children[i];
                
                actorFactory.buildActor(sceneDataEntry, container);
            }
        }

        const button = new Button(container);

        return button;
    }
}