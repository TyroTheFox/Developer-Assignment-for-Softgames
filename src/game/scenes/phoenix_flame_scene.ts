import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from "../../engine/actors/actors/container/container";
import { ParticleContainer } from "../../engine/actors/actors/container/particle_container";

/** 
 * @class
 * @extends {Scene}
 * 
 * Phoenix Flame Emitter Scene
 */
export class PhoenixFlameScene extends Scene {
    protected emitterContainer!: ParticleContainer;

    /**
     * Initialise the scene
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async init(): Promise<void> {
        const emitterSpace = this.getChildByLabel('emitterSpace') as Container;
        this.emitterContainer = emitterSpace.getChildByLabel('emitterContainer') as ParticleContainer;
    }

    /**
     * Called when the Scene is activated
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onEnter(): Promise<void> {
        const { gameScreen } = this;
        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;
        this.resize(width, height, scaleWithValue, scaleAgainstValue);
    }

    /**
     * Update the Emitter Container
     * 
     * @public
     * @override
     * @param {PIXI.Ticker} time - PIXI Ticker instance
     * @returns {void}
     */
    public override update(time: PIXI.Ticker): void {
        this.emitterContainer.onUpdate(time);
    }
}