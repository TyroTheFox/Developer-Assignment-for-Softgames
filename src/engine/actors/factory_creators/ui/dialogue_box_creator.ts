import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../../actor_factory";
import { GameScreen } from "../../../screen/game_screen";
import { DialogueBox } from "../../actors/ui/dialogue_box";

export type DialogueData = {
    name: string,
    text: string,
}

export type AvatarDataEntry = {
    name: string,
    texture?: string,
    url?: string,
    position: string
}

export type EmojiDataEntry = {
    name: string,
    texture?: string,
    url?: string
}

export type DialogueBoxCreatorData = PositionalActorData & {
    textStyle?: PIXI.TextStyleOptions,
    textPosition?: {
        x?: number,
        y?: number
    },
    nameStyle?: PIXI.TextStyleOptions,
    nameTextPosition?: {
        x?: number,
        y?: number
    },
    avatarData?: AvatarDataEntry[],
    avatarPosition?: {
        x?: number,
        y?: number
    }, 
    emojiData?: EmojiDataEntry[],
    children?: any[]
}

/**
 * Creates Dialogue Box Actors
 * 
 * @class
 * @extends {BaseFactoryCreator<DialogueBox>}
 */
export class DialogueBoxCreator extends BaseFactoryCreator<DialogueBox> {
    /**
     * Builds the Actor
     * 
     * @public
     * @param {DialogueBoxCreatorData} data - Actor Data used to make the Actor
     * @param {PIXI.Container} parent - The Parent to add the Actor to
     * @returns {DialogueBox}
     */
    public build(data: DialogueBoxCreatorData, parent: PIXI.Container): DialogueBox {
        const actorFactory = ActorFactory.instance;
        const gameScreen = GameScreen.instance;
        const { id, x, y, xExactPos, yExactPos, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, children, cullable} = data;

        let caluclatedX = xExactPos ? xExactPos : (x ?? 0) * gameScreen.gameScreenDimensions.width;
        let caluclatedY = yExactPos ? yExactPos : (y ?? 0) * gameScreen.gameScreenDimensions.height;

        const container = new DialogueBox({
            label: id ?? "dialogueBox",
            position: { x: caluclatedX, y: caluclatedY },
            scale: { x: scale?.x ?? 1, y: scale?.y ?? 1 },
            rotation: rotation ?? undefined,
            angle: angle ?? undefined,
            zIndex: zIndex ?? 0,
            visible: visible ?? true,
            alpha: alpha ?? 1,
            cullable: cullable ?? false,
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