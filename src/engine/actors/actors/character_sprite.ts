import * as PIXI from 'pixi.js';
import { GameScreen } from '../../screen/game_screen';
import { Sprite } from './sprite';
import { CharacterSpriteCreatorData } from '../factory_creators/character_sprite_creator';

export class CharacterSprite extends PIXI.Container {
    private gameScreen = GameScreen.instance;
    protected actorData!: CharacterSpriteCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    
    protected spriteMap: Map<string, Sprite> = new Map();
    protected currentSprite!: Sprite;
    
    constructor(options: PIXI.ContainerOptions, data: CharacterSpriteCreatorData, spriteList: Record<string, Sprite>, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x || null, y: data?.y || null };
        this.exactPosition = { x: data?.xExactPos || null, y: data?.yExactPos || null };
        
        if (parent) {
            parent.addChild(this);

            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

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
     * Position of X as a percentage of the Screen
     */
    public set gameX(coord: number) {
        this.gamePosition.x = coord;
        this.x = (this.parent?.width || this.gameScreen.gameScreenDimensions.width) * this.gamePosition.x;
    }

    /**
     * Position of Y as a percentage of the Screen
     */
    public set gameY(coord: number) {
        this.gamePosition.y = coord;
        this.y = (this.parent?.height || this.gameScreen.gameScreenDimensions.height) * this.gamePosition.y;
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

    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : (this.parent?.width || width) * (this.gamePosition.x || 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : (this.parent?.height || height) * (this.gamePosition.y || 0);

        this.x = caluclatedX;
        this.y = caluclatedY;
    }
}