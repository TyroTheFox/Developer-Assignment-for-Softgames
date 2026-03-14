import dialogueExampleData from '../../data/dialogue/dialogue_example.json' assert {type: 'json'};

import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { EE } from "../../engine/screen/game_screen";
import { Sprite } from '../../engine/actors/actors/sprite/sprite';
import { Container } from 'pixi.js';
import { CharacterSprite } from '../../engine/actors/actors/sprite/character_sprite';

export class DialogueExampleScene extends Scene {
    protected hallwayBackground!: Sprite;

    protected puppetSpace!: Container;
    protected leonardPuppet!: CharacterSprite;
    protected pennyPuppet!: CharacterSprite;
    protected sheldonPuppet!: CharacterSprite;

    protected sequenceTween!: gsap.core.Timeline;

    protected puppetMap: Map<string, CharacterSprite> = new Map();

    protected speakerBobbing: boolean = false;

    public override async init(): Promise<void> {
        const { gameScreen, sceneSettingsData } = this;
        const { width, height, scaleAgainstValue } = gameScreen.gameScreenDimensions;
        const { scenePositionCoords, marginBetweenPuppets } = sceneSettingsData;
        const { avatars } = dialogueExampleData;

        this.hallwayBackground = this.getChildByLabel('hallwayBG') as Sprite;
        this.hallwayBackground.width = width * scaleAgainstValue;
        this.hallwayBackground.height = height * scaleAgainstValue;

        this.puppetSpace = this.getChildByLabel('puppetSpace') as Container;

        this.leonardPuppet = this.puppetSpace.getChildByLabel('leonardPuppet') as CharacterSprite;
        this.pennyPuppet = this.puppetSpace.getChildByLabel('pennyPuppet') as CharacterSprite;
        this.sheldonPuppet = this.puppetSpace.getChildByLabel('sheldonPuppet') as CharacterSprite;

        this.puppetMap.set('Leonard', this.leonardPuppet);
        this.puppetMap.set('Penny', this.pennyPuppet);
        this.puppetMap.set('Sheldon', this.sheldonPuppet);

        for (let i = 0; i < avatars.length; i++) {
            const { position, name } = avatars[i];
            const puppet = this.puppetMap.get(name) as CharacterSprite;
            const { right, left } = scenePositionCoords;

            if (position === "right") {
                puppet.position.set(right.x + (i * marginBetweenPuppets), right.y);
            }

            if (position === "left") {
                puppet.position.set(left.x - (i * marginBetweenPuppets), left.y);
            }
        }

        EE.on('char_display_start', (name) => {
            const puppet = this.puppetMap.get(name) as CharacterSprite;

            if (!puppet || this.speakerBobbing) {
                return;
            }

            this.leonardPuppet.zIndex = 0;
            this.pennyPuppet.zIndex = 0;
            this.sheldonPuppet.zIndex = 0;

            puppet.zIndex = 1;

            this.speakerBobbing = true;

            gsap.timeline()
                .to(
                    puppet,
                    {
                        duration: 0.05,
                        pivotY: 50,
                        ease: 'sine.inOut'
                    }
                )
                .to(
                    puppet,
                    {
                        delay: 0.05,
                        duration: 0.05,
                        pivotY: 0,
                        ease: 'sine.inOut',
                        onComplete: () => {
                            this.speakerBobbing = false;
                        }
                    }
                )
        });

        EE.on('dialogue_tag_fired', (tag, name) => { 
            const puppet = this.puppetMap.get(name) as CharacterSprite;

            if (!puppet) {
                return;
            }

            puppet.setSprite(tag);
        });

        EE.on('dialogue_complete', () => {
            this.sequenceTween = gsap.timeline()
                .to(
                    this.puppetSpace,
                    {
                        delay: 3,
                        duration: 0.3,
                        alpha: 0
                    }
                )
                .to(
                    this.hallwayBackground,
                    {
                        duration: 0.5,
                        alpha: 1,
                        onComplete: () => {
                            this.leonardPuppet.setSprite('neutral');
                            this.pennyPuppet.setSprite('neutral');
                            this.sheldonPuppet.setSprite('neutral');
                            
                            this.startDialogueSequence();
                        }
                    }
                );
        });

        this.startDialogueSequence();
    }

    public startDialogueSequence() {
        this.sequenceTween = gsap.timeline()
            .to(
                this.hallwayBackground,
                {
                    delay: 2,
                    duration: 1,
                    alpha: 0.5
                }
            )
            .to(
                this.puppetSpace,
                {
                    duration: 0.5,
                    alpha: 1
                }
            )
            .to(
                this,
                {
                    delay: 1,
                    onComplete: () => {
                        EE.emit('showDialogue');
                    }
                }
            )
    }

    public override resize(width: number, height: number, scale: number) {
        super.resize(width, height, scale);

        const { scaleAgainstValue } = this.gameScreen.gameScreenDimensions;

        if (this.hallwayBackground) {
            this.hallwayBackground.width = width * scaleAgainstValue;
            this.hallwayBackground.height = height * scaleAgainstValue;
        }
    }

    public override async onEnter(): Promise<void> {}

    public override async onExit(): Promise<void> {
        EE.emit('hideDialogue');
        this.sequenceTween.kill();
    }
}