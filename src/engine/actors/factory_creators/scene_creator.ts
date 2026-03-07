import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../actor_factory";
import { Scene } from "../actors/scene";

export type SceneCreatorData = PositionalActorData & {
    settings?: any,
    actors: any[]
}

export class SceneCreator extends BaseFactoryCreator<Scene> {
    public build(data: SceneCreatorData, parent?: PIXI.Container): Scene {
        const actorFactory = ActorFactory.instance;

        const { id, x, y, scale, visible, alpha, rotation, angle, zIndex, settings: sceneSettingsData, actors: sceneActorData} = data;

        const scene = new Scene({
            label: id || "scene",
            position: { x: x || 0, y: y || 0},
            scale: { x: scale?.x || 1, y: scale?.y || 1 },
            rotation: rotation || undefined,
            angle: angle || undefined,
            zIndex: zIndex || 0,
            visible: visible || true,
            alpha: alpha || 1,
            sceneSettingsData,
            sceneActorData
            }
        );
        
        if (parent) {
            parent.addChild(scene);
        }

        // Add Child Actors
        for (let i = 0; i < sceneActorData.length; i++) {
            const sceneDataEntry = sceneActorData[i];
            
            actorFactory.buildActor(sceneDataEntry, scene);
        }

        return scene;
    }
}