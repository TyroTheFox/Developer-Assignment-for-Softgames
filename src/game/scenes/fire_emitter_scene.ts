import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from "../../engine/actors/actors/container/container";
import { ParticleContainer } from "../../engine/actors/actors/container/particle_container";
import { Sprite } from "../../engine/actors/actors/sprite/sprite";

export class FireEmitterScene extends Scene {
    protected castleBackground!: Sprite;

    private emitterContainer!: ParticleContainer;

    public override async init(): Promise<void> {
        const { gameScreen } = this;
        const { width, height, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.castleBackground = this.getChildByLabel('castleBG') as Sprite;
        this.castleBackground.width = width * scaleAgainstValue;
        this.castleBackground.height = height * scaleAgainstValue;

        const emitterSpace = this.getChildByLabel('emitterSpace') as Container;
        this.emitterContainer = emitterSpace.getChildByLabel('emitterContainer') as ParticleContainer;
    }

    public override update(time: PIXI.Ticker): void {
        this.emitterContainer.onUpdate(time);
    }

    public override resize(width: number, height: number, scale: number) {
        super.resize(width, height, scale);

        const { scaleAgainstValue } = this.gameScreen.gameScreenDimensions;

        if (this.castleBackground) {
            this.castleBackground.width = width * scaleAgainstValue;
            this.castleBackground.height = height * scaleAgainstValue;
        }
    }
}