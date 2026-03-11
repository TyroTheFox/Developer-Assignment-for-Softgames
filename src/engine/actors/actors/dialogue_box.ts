import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { EE, GameScreen } from '../../screen/game_screen';
import { Button } from '@pixi/ui';
import { DialogueBoxCreatorData, DialogueData } from '../factory_creators/dialogue_box_creator';

export class DialogueBox extends PIXI.Container {
    private gameScreen = GameScreen.instance;
    protected actorData!: DialogueBoxCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    public buttonInstance!: Button;

    protected dialogueText!: PIXI.SplitText;
    protected nameText!: PIXI.Text;

    protected dialogueData!: DialogueData[];
    protected dialogueIndex: number = -1;
    
    constructor(options: PIXI.ContainerOptions, data: DialogueBoxCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x || null, y: data?.y || null };
        this.exactPosition = { x: data?.xExactPos || null, y: data?.yExactPos || null };
        
        if (parent) {
            parent.addChild(this);

            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

        const { x: textPosX, y: textPosY } = data?.textPosition || { x: 0, y: 0 };

        const textPosition = { x: (textPosX || 0), y: (textPosY || 0) };

        this.dialogueText = new PIXI.SplitText({
            text: "-",
            position: textPosition,
            style: data.textStyle || {},
            zIndex: 100
        });
        this.addChild(this.dialogueText);

        const { x: namePosX, y: namePosY } = data?.nameTextPosition || { x: 0, y: 0 };

        const nameTextPosition = { x: (namePosX || 0), y: (namePosY || 0) };

        this.nameText = new PIXI.Text({
            text: "-",
            position: nameTextPosition,
            style: data.nameStyle || {},
            zIndex: 100
        });
        this.addChild(this.nameText);

        this.on('childAdded', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
        this.on('childRemoved', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
    }

    /**
     * Position of X as a percentage of the Screen
     */
    public set gameX(coord: number) {
        this.gamePosition.x = coord;
        this.x = this.gameScreen.gameScreenDimensions.width * this.gamePosition.x;
    }

    /**
     * Position of Y as a percentage of the Screen
     */
    public set gameY(coord: number) {
        this.gamePosition.y = coord;
        this.y = this.gameScreen.gameScreenDimensions.height * this.gamePosition.y;
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

    public setDialogueData(data: DialogueData[]) {
        this.dialogueData = data;
    }

    public nextDialogueStep() {
        if (this.dialogueIndex >= this.dialogueData.length) {
            return;
        }
        
        this.dialogueIndex++;

        this.displayNextDialogueStep();
    }

    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : width * (this.gamePosition.x || 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : height * (this.gamePosition.y || 0);

        this.x = caluclatedX;
        this.y = caluclatedY;

        this.emit('scene_resize', width, height);
    }

    protected displayNextDialogueStep() {
        if (this.dialogueIndex >= this.dialogueData.length) {
            return;
        }

        const { name, text } = this.dialogueData[this.dialogueIndex];

        this.nameText.text = "";
        this.dialogueText.text = text;

        gsap.timeline()
        .fromTo(
            this.dialogueText.chars,
            {
                alpha: 0
            },
            {
                delay: 1,
                alpha: 1,
                duration: 0.2,
                stagger: 0.07,
                ease: 'power4.out',
                onStart: () => {
                    this.nameText.text = name;
                }
            }
        )
        .to(
            this.dialogueText.chars,
            {
                duration: 2.5,
                onComplete: () => {
                    EE.emit('dialogue_entry_complete');
                }
            }
        );
    }
}