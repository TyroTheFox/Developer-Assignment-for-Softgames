import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from "../../engine/actors/actors/container/container";
import { ParticleContainer } from "../../engine/actors/actors/container/particle_container";
import { app } from "../../engine/screen/game_screen";

export class PhoenixFlameScene extends Scene {
    protected emitterContainer!: ParticleContainer;

    public override async init(): Promise<void> {
        const emitterSpace = this.getChildByLabel('emitterSpace') as Container;
        this.emitterContainer = emitterSpace.getChildByLabel('emitterContainer') as ParticleContainer;
    }

    public override update(time: PIXI.Ticker): void {
        this.emitterContainer.onUpdate(time);
    }

    public override async onEnter(): Promise<void> {
        app.renderer.background.color = this.sceneSettingsData.backgroundColour;
    }
}