import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../../actor_factory";
import { GameScreen } from "../../../screen/game_screen";
import { Container } from "../../actors/container/container";

export type ContainerCreatorData = PositionalActorData & {
    children?: any[]
}

export class ContainerCreator extends BaseFactoryCreator<Container> {
    public build(data: ContainerCreatorData, parent: PIXI.Container): Container {
        const actorFactory = ActorFactory.instance;
        const gameScreen = GameScreen.instance;
        const { id, x, y, xExactPos, yExactPos, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, children, cullable} = data;

        let caluclatedX = xExactPos ? xExactPos : (x ?? 0) * gameScreen.gameScreenDimensions.width;
        let caluclatedY = yExactPos ? yExactPos : (y ?? 0) * gameScreen.gameScreenDimensions.height;

        const container = new Container({
            label: id ?? "container",
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

        // Add children from data
        if (children) {
            for (let i = 0; i < children.length; i++) {
                const sceneDataEntry = children[i];
                
                const newActor = actorFactory.buildActor<any, any>(sceneDataEntry, container);

                newActor.x = sceneDataEntry.x ?? 0;
                newActor.y = sceneDataEntry.y ?? 0;
            }
        }

        container.resize(gameScreen.gameScreenDimensions.width, gameScreen.gameScreenDimensions.height);

        return container;
    }
}