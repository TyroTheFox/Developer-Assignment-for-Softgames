import * as PIXI from 'pixi.js';
import { Sprite } from './sprite';
import { CharacterSpriteCreatorData } from '../../factory_creators/sprite/character_sprite_creator';

/**
 * Character Sprite
 * A Special Class which allows a player to easily switch between lots of different Sprites as required
 * while remaining in the same position, such as for the Dealer's Hands or perhpas Facial Expressions
 * 
 * @class
 * @extends {PIXI.Container}
 */
export class CharacterSprite extends PIXI.Container {
    protected actorData!: CharacterSpriteCreatorData;
    
    protected spriteMap: Map<string, Sprite> = new Map();
    protected currentSprite!: Sprite;
    
    /**
     * @constructor
     * @param {PIXI.ContainerOptions} options 
     * @param {CharacterSpriteCreatorData} data 
     * @param {Record<string, Sprite>} spriteList - List of Sprites to Add to the Sprite
     */
    constructor(options: PIXI.ContainerOptions, data: CharacterSpriteCreatorData, spriteList: Record<string, Sprite>) {
        super(options);

        this.actorData = data;

        (Object.entries(spriteList) as [string, Sprite][]).forEach(([key, value]) => {
            this.spriteMap.set(key, value);
            this.addChild(value);
            value.visible = false;
        });

        if (data?.initialSprite) {
            this.setSprite(data.initialSprite);
        } else if (this.spriteMap.size > 0) {
            this.setSprite(this.spriteMap.keys().next().value as string);
        }
    }

    /**
     * Relative Pivot X Position of the Object
     * 
     * @set
     * @param {number} coord
     */
    public set pivotX(coord: number) {
        this.pivot.x = coord;
    }

    /**
     * Relative Pivot Y Position of the Object
     * 
     * @set
     * @param {number} coord
     */
    public set pivotY(coord: number) {
        this.pivot.y = coord;
    }

    /**
     * Sets the Sprite to show
     * 
     * @param {string} frameName - Name of the Sprite to show
     */
    public setSprite(frameName: string) {
        if (this.spriteMap.has(frameName)) {
            if (this.currentSprite) {
                this.currentSprite.visible = false;
            }
            this.currentSprite = this.spriteMap.get(frameName) as Sprite;
            this.currentSprite.visible = true;
        }
    }
}