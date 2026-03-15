import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { PositionalActorData } from "../../actor_factory";
import { GameScreen } from "../../../screen/game_screen";
import { ParticleContainer } from "../../actors/container/particle_container";

export type ParticleData = {
    id: string,
    spawnDelay: number,
    options: PIXI.ParticleOptions
}

export type ParticleContainerCreatorData = PositionalActorData & {
    particle: ParticleData[],
    maximumParticles: number,
    removeParticlesWhenAtMax: boolean
}

export class ParticleContainerCreator extends BaseFactoryCreator<ParticleContainer> {
    public build(data: ParticleContainerCreatorData, parent: PIXI.Container): ParticleContainer {
        const gameScreen = GameScreen.instance;
        const { id, x, y, xExactPos, yExactPos, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, cullable} = data;

        let caluclatedX = xExactPos ? xExactPos : (x ?? 0) * gameScreen.gameScreenDimensions.width;
        let caluclatedY = yExactPos ? yExactPos : (y ?? 0) * gameScreen.gameScreenDimensions.height;

        const particleContainer = new ParticleContainer({
            label: id ?? "particleContainer",
            position: { x: caluclatedX, y: caluclatedY },
            scale: { x: scale?.x ?? 1, y: scale?.y ?? 1 },
            rotation: rotation ?? undefined,
            angle: angle ?? undefined,
            zIndex: zIndex ?? 0,
            visible: visible ?? true,
            alpha: alpha ?? 1,
            cullable: cullable ?? true,
            pivot: { x: pivotX ?? 0, y: pivotY ?? 0 }
        }, data, parent);

        particleContainer.resize(gameScreen.gameScreenDimensions.width, gameScreen.gameScreenDimensions.height);

        return particleContainer;
    }
}