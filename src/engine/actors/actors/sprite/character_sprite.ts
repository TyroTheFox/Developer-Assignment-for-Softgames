import * as PIXI from 'pixi.js';
import { Sprite } from './sprite';
import { CharacterSpriteCreatorData } from '../../factory_creators/sprite/character_sprite_creator';

export class CharacterSprite extends PIXI.Container {
    protected actorData!: CharacterSpriteCreatorData;
    
    protected spriteMap: Map<string, Sprite> = new Map();
    protected currentSprite!: Sprite;
    
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
     */
    public set pivotX(coord: number) {
        this.pivot.x = coord;
    }

    /**
     * Relative Pivot Y Position of the Object
     */
    public set pivotY(coord: number) {
        this.pivot.y = coord;
    }

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