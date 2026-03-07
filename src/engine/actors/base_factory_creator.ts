import * as PIXI from "pixi.js";
import { BaseActorData } from "./actor_factory";

export abstract class BaseFactoryCreator<ActorType> {
    public abstract build(data: BaseActorData, parent?: PIXI.Container): ActorType;
}