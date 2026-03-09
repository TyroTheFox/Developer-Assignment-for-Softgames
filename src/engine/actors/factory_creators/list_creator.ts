import * as PIXI from "pixi.js";
import * as PIXIUI from "@pixi/ui";
import { BaseFactoryCreator } from "../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../actor_factory";
import { List } from "../actors/list";

export type ListCreatorData = PositionalActorData & {
    listType?: PIXIUI.ListType,
    options?: PIXIUI.ListOptions,
    children?: any[]
}

export class ListCreator extends BaseFactoryCreator<PIXIUI.List> {
    public build(data: ListCreatorData, parent: PIXI.Container): PIXIUI.List {
        const actorFactory = ActorFactory.instance;
        
        const { id, x, y, xExactPos, yExactPos, scale, visible, alpha, rotation, angle, zIndex, children, options, cullable } = data;

        let caluclatedX = xExactPos ? xExactPos : (x || 0) * parent.width;
        let caluclatedY = yExactPos ? yExactPos : (y || 0) * parent.height;

        const list  = new List({ ...options }, data, parent);

        list.label = id || "list";
        list.position.set( caluclatedX, caluclatedY );
        list.scale.set(scale?.x || 1, scale?.y || 1);
        list.rotation = rotation || list.rotation;
        list.angle = angle || list.angle;
        list.zIndex = zIndex || 0;
        list.visible = visible || list.visible;
        list.alpha = alpha || list.alpha;
        list.cullable = cullable || true;

        // Add children from data
        if (children) {
            for (let i = 0; i < children.length; i++) {
                const sceneDataEntry = children[i];
                
                actorFactory.buildActor(sceneDataEntry, list);
            }
        }

        return list;
    }
}