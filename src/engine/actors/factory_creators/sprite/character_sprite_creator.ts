import * as PIXI from "pixi.js";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { PositionalActorData } from "../../actor_factory";
import { Sprite } from "../../actors/sprite/sprite";
import { CharacterSprite } from "../../actors/sprite/character_sprite";

export type SpriteFrame = {
    id: string,
    frame: string,
    scale?: {
        x?: number,
        y?: number
    }
}

export type CharacterSpriteCreatorData = PositionalActorData & {
    spriteFrames?: SpriteFrame[],
    initialSprite?: string
}

/**
 * Creates Character Sprite Actors
 * 
 * @class
 * @extends {BaseFactoryCreator<CharacterSprite>}
 */
export class CharacterSpriteCreator extends BaseFactoryCreator<CharacterSprite> {
    /**
     * Builds the Actor
     * 
     * @public
     * @param {CharacterSpriteCreatorData} data - Actor Data used to make the Actor
     * @param {PIXI.Container} parent - The Parent to add the Actor to
     * @returns {CharacterSprite}
     */
    public build(data: CharacterSpriteCreatorData, parent: PIXI.Container): CharacterSprite {
        const { id, x, y, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, spriteFrames, cullable} = data;

        let frames: Record<string, Sprite> = {};

        // Add children from data
        if (spriteFrames) {
            for (let i = 0; i < spriteFrames.length; i++) {
                const spriteFrame = spriteFrames[i];

                const newSprite = new Sprite(
                    { 
                        label: spriteFrame.id, 
                        texture: PIXI.Assets.get(spriteFrame.frame)
                    }, 
                    {
                        id: spriteFrame.id,
                        type: "sprite",
                        texture: spriteFrame.frame
                    }
                );

                if (spriteFrame.scale) {
                    newSprite.scale.set(spriteFrame.scale.x ?? 1, spriteFrame.scale.y ?? 1);
                }

                frames[spriteFrame.id] = newSprite;
            }
        }

        const characterSprite = new CharacterSprite({
            label: id ?? "characterSprite",
            position: { x: (x ?? 0), y: (y ?? 0) },
            scale: { x: scale?.x ?? 1, y: scale?.y ?? 1 },
            rotation: rotation ?? undefined,
            angle: angle ?? undefined,
            zIndex: zIndex ?? 0,
            visible: visible ?? true,
            alpha: alpha ?? 1,
            cullable: cullable ?? false,
            pivot: { x: pivotX ?? 0, y: pivotY ?? 0 }
        }, data, frames);

        if (parent) {
            parent.addChild(characterSprite);
        }

        return characterSprite;
    }
}