import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../base_factory_creator";
import { PositionalActorData } from "../actor_factory";
import { Scene } from "../actors/scene";

export type SceneCreatorData = PositionalActorData & {
    sceneData: any[]
}

export class SceneCreator extends BaseFactoryCreator<Scene> {
    public build(data: SceneCreatorData, parent?: PIXI.Container): Scene {
        const { id, x, y, scale, visible, alpha, rotation, angle, zIndex, sceneData} = data;

        const scene = new Scene({
            label: id || "scene",
            position: { x: x || 0, y: y || 0},
            scale: { x: scale?.x || 1, y: scale?.y || 1 },
            rotation: rotation || undefined,
            angle: angle || undefined,
            zIndex: zIndex || 0,
            visible: visible || true,
            alpha: alpha || 1,
            sceneData
            }, 
        );
        
        if (parent) {
            parent.addChild(scene);
        }

        return scene;
    }
}