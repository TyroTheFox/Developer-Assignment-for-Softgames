import * as PIXI from "pixi.js";
import { ContainerCreator } from "./factory_creators/container_creator";
import { SpriteCreator } from "./factory_creators/sprite_creator";

export type BaseActorData = {
    id: string,
    type: string,
    zIndex: number
}

export type PositionalActorData = BaseActorData & {
    x?: number,
    y?: number,
    scale?: { 
        x?: number,
        y?: number
    },
    visible?: boolean,
    anchor?: number,
    alpha?: number,
    angle?: number,
    rotation?: number
}


export class ActorFactory {
    private actorCreators = new Map([
        ["container", new ContainerCreator()],
        ["sprite", new SpriteCreator()]
    ]);

    public buildActor<ActorDataType extends BaseActorData, ReturnType>(data: ActorDataType, parent?: PIXI.Container): ReturnType {
        const {id, type} = data;

        const actorCreator = this.actorCreators.get(type);

        if (!actorCreator) {
            throw new Error(`Cannot build ${id}, missing ${type} Builder`);
        }

        const newActor = actorCreator?.build(data, parent);

        return newActor as ReturnType;
    }
}