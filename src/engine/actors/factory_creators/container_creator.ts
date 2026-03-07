import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../actor_factory";

export type ContainerCreatorData = PositionalActorData & {
    children?: any[]
}

export class ContainerCreator extends BaseFactoryCreator<PIXI.Container> {
    public build(data: ContainerCreatorData, parent?: PIXI.Container): PIXI.Container {
        const actorFactory = ActorFactory.instance;

        const { id, x, y, scale, visible, alpha, rotation, angle, zIndex, children} = data;

        const container = new PIXI.Container({
            label: id || "container",
            position: { x: x || 0, y: y || 0},
            scale: { x: scale?.x || 1, y: scale?.y || 1 },
            rotation: rotation || undefined,
            angle: angle || undefined,
            zIndex: zIndex || 0,
            visible: visible || true,
            alpha: alpha || 1
        });

        container.position.set(x || 0, y || 0);
        
        if (parent) {
            parent.addChild(container);
        }

        // Add children from data
        if (children) {
            for (let i = 0; i < children.length; i++) {
                const sceneDataEntry = children[i];
                
                actorFactory.buildActor(sceneDataEntry, container);
            }
        }

        return container;
    }
}