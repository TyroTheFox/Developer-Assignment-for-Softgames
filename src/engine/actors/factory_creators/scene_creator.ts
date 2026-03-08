import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../actor_factory";
import { Scene } from "../actors/scene/scene";

export type SceneCreatorData = PositionalActorData & {
    settings?: any,
    actors: any[]
}

export class SceneCreator extends BaseFactoryCreator<Scene> {
    public build(data: SceneCreatorData, parent?: PIXI.Container): Scene {
        const actorFactory = ActorFactory.instance;

        const { id, x, y, scale, visible, alpha, rotation, angle, zIndex, settings, actors} = data;

        const scene = new Scene({
                id, 
                type: "scene",
                label: id || "scene",
                position: { x: x || 0, y: y || 0},
                scale: { x: scale?.x || 1, y: scale?.y || 1 },
                rotation: rotation || undefined,
                angle: angle || undefined,
                zIndex: zIndex || 0,
                visible: visible || true,
                alpha: alpha || 1,
                settings,
                actors
            }
        );
        
        if (parent) {
            parent.addChild(scene);
        }

        // Add Child Actors
        for (let i = 0; i < actors.length; i++) {
            const sceneDataEntry = actors[i];
            
            const newActor = actorFactory.buildActor<any, any>(sceneDataEntry, scene);
            scene.addChild(newActor);
        }

        return scene;
    }
}