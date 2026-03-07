import * as PIXI from "pixi.js";
import { ContainerCreator } from "./factory_creators/container_creator";
import { SpriteCreator } from "./factory_creators/sprite_creator";
import { SceneCreator } from "./factory_creators/scene_creator";

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
    static #instance: ActorFactory;
    
    private actorCreators = new Map([
        ["container", new ContainerCreator()],
        ["sprite", new SpriteCreator()],
        ["scene", new SceneCreator()]
    ]);

    private constructor() {}

    public static get instance(): ActorFactory {
        if (!ActorFactory.#instance) {
            ActorFactory.#instance = new ActorFactory();
        }

        return ActorFactory.#instance;
    }

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