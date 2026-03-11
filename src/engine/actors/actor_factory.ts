import * as PIXI from "pixi.js";

import { ContainerCreator } from "./factory_creators/container_creator";
import { SpriteCreator } from "./factory_creators/sprite_creator";
import { BaseFactoryCreator } from "./base_factory_creator";
import { FancyButtonCreator } from "./factory_creators/fancy_button_creator";
import { ButtonCreator } from "./factory_creators/button_creator";
import { ListCreator } from "./factory_creators/list_creator";
import { TextCreator } from "./factory_creators/text_creator";
import { DrawnGraphicsCreator } from "./factory_creators/drawn_graphics_creator";
import { CharacterSpriteCreator } from "./factory_creators/character_sprite_creator";

export type BaseActorData = {
    id: string,
    type: string,
    zIndex?: number,
    cullable?: boolean
}

export type PositionalActorData = BaseActorData & {
    x?: number,
    y?: number,
    xExactPos?: number,
    yExactPos?: number,
    pivotX?: number,
    pivotY?: number,
    scale?: { 
        x?: number,
        y?: number
    },
    width?: number,
    height?: number,
    visible?: boolean,
    anchor?: number,
    alpha?: number,
    angle?: number,
    rotation?: number
}

export class ActorFactory {
    static #instance: ActorFactory;
    
    private actorCreators = new Map<string, BaseFactoryCreator<any>>([
        ["container", new ContainerCreator()],
        ["sprite", new SpriteCreator()],
        ["fancyButton", new FancyButtonCreator()],
        ["button", new ButtonCreator()],
        ["list", new ListCreator()],
        ["text", new TextCreator()],
        ["drawnGraphics", new DrawnGraphicsCreator()],
        ["characterSprite", new CharacterSpriteCreator()]
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

        const newActor = actorCreator.build(data, parent);

        return newActor as ReturnType;
    }
}