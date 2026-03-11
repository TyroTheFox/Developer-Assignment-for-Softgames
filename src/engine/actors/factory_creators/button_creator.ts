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
        const { id, x, y, xExactPos, yExactPos, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, children, cullable } = data;

        let caluclatedX = xExactPos ? xExactPos : (x || 0) * parent.width;
        let caluclatedY = yExactPos ? yExactPos : (y || 0) * parent.height;

        const view = new Container({
            label: id || id + "_view"
        }, data, parent);

        // Add children from data
        if (children) {
            for (let i = 0; i < children.length; i++) {
                const sceneDataEntry = children[i];
                
                actorFactory.buildActor(sceneDataEntry, view);
            }
        }

        const button = new Button(view);

        (button.view as Container).position.set( caluclatedX, caluclatedY );
        (button.view as Container).scale.set(scale?.x || 1, scale?.y || 1);
        (button.view as Container).rotation = rotation || view.rotation;
        (button.view as Container).angle = angle || view.angle;
        (button.view as Container).zIndex = zIndex || 0;
        (button.view as Container).visible = visible || view.visible;
        (button.view as Container).alpha = alpha || view.alpha;
        (button.view as Container).cullable = cullable || true;
        (button.view as Container).pivot = { x: pivotX || 0, y: pivotY || 0 };
        (button.view as Container).buttonInstance = button;

        return button;
    }
}