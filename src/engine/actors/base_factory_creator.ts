import * as PIXI from "pixi.js";
import { BaseActorData } from "./actor_factory";

/**
 * Base Factory Creator that all others are based on
 * 
 * @abstract
 * @class
 */
export abstract class BaseFactoryCreator<ActorType> {
    /**
     * Builds the Actor
     * 
     * @abstract
     * @public
     * @param {BaseActorData} data - Actor Data used to make the Actor
     * @param {PIXI.Container} parent - The Parent to add the Actor to
     * @returns {ActorType}
     */
    public abstract build(data: BaseActorData, parent: PIXI.Container): ActorType;
}