// Import Dialogue Data
import dialogueExampleData from '../../data/dialogue/dialogue_example.json' assert {type: 'json'};

import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { EE } from "../../engine/screen/game_screen";
import { Sprite } from '../../engine/actors/actors/sprite/sprite';
import { Container } from 'pixi.js';
import { CharacterSprite } from '../../engine/actors/actors/sprite/character_sprite';

/** 
 * @class
 * @extends {Scene}
 * 
 * Dialogue Example Scene
 */
export class DialogueExampleScene extends Scene {
    protected hallwayBackground!: Sprite;

    // 'Puppet Space' is a container that holds just the other on-screen 'Puppets'
    // Puppets being on-screen actors intended to present a character
    protected puppetSpace!: Container;
    protected leonardPuppet!: CharacterSprite;
    protected pennyPuppet!: CharacterSprite;
    protected sheldonPuppet!: CharacterSprite;

    // Tween that handles the overall flow of the dialogue scene
    protected sequenceTween!: gsap.core.Timeline;

    protected puppetMap: Map<string, CharacterSprite> = new Map();

    // Whether or not the current Speaker's Puppet is bobbing up and down
    protected speakerBobbing: boolean = false;

    public override async init(): Promise<void> {
        const { sceneSettingsData } = this;
        const { scenePositionCoords, marginBetweenPuppets } = sceneSettingsData;
        const { avatars } = dialogueExampleData;

        this.hallwayBackground = this.getChildByLabel('hallwayBG') as Sprite;

        this.puppetSpace = this.getChildByLabel('puppetSpace') as Container;

        this.leonardPuppet = this.puppetSpace.getChildByLabel('leonardPuppet') as CharacterSprite;
        this.pennyPuppet = this.puppetSpace.getChildByLabel('pennyPuppet') as CharacterSprite;
        this.sheldonPuppet = this.puppetSpace.getChildByLabel('sheldonPuppet') as CharacterSprite;

        this.puppetMap.set('Leonard', this.leonardPuppet);
        this.puppetMap.set('Penny', this.pennyPuppet);
        this.puppetMap.set('Sheldon', this.sheldonPuppet);

        // Set the relative position of each puppet based on the Avatar data
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

        /**
         * When a character in the Dialogue Box text is being tweened in, this fires to allow Puppets to bob along
         * 
         * @listens DialogueBox#event:char_display_start
         */
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

            // Tween to bob along
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

        /**
         * Allows Puppets to switch shown faces based on Emoji tags
         * 
         * @listens DialogueBox#event:dialogue_tag_fired
         */
        EE.on('dialogue_tag_fired', (tag, name) => { 
            const puppet = this.puppetMap.get(name) as CharacterSprite;

            if (!puppet) {
                return;
            }

            // Flips to a given face
            puppet.setSprite(tag);
        });

        /**
         * Fires when the Dialogue Box has finished displaying all the loaded Dialogue lines
         * 
         * @listens DialogueBox-event:dialogue_complete
         */
        EE.on('dialogue_complete', () => {
            this.sequenceTween = gsap.timeline()
                .to(
                    this.puppetSpace,
                    {
                        delay: 3, // Wait for a bit
                        duration: 0.3,
                        alpha: 0 // Hide the Puppets
                    }
                )
                .to(
                    this.hallwayBackground,
                    {
                        duration: 0.5,
                        alpha: 1, // Return the Backdrop to normal
                        onComplete: () => {
                            // Set all Puppets to Neutral
                            this.leonardPuppet.setSprite('neutral');
                            this.pennyPuppet.setSprite('neutral');
                            this.sheldonPuppet.setSprite('neutral');
                            
                            // Start again
                            this.startDialogueSequence();
                        }
                    }
                );
        });
    }

    /**
     * Starts the Dialogue Loop
     * Works a little like dominos. Once this is called, it kicks the Dialogue Box into loading as well as starting
     * all the other animations
     * 
     * @public
     */
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
                        EE.emit('show_dialogue');
                    }
                }
            )
    }

    /**
     * Resizes the elements of the scene
     * 
     * @public
     * @override
     * @param {number} width - Scaled Screen Width 
     * @param {number} height - Scaled Screen Height 
     * @param {number} scaleWithValue - Scale value that matches that of the Game Screen Space 
     * @param {number} scaleAgainstValue - Scale vale that inverts that of the Game Screen Space
     */
    public override resize(width: number, height: number, scaleWithValue: number, scaleAgainstValue: number) {
        super.resize(width, height, scaleWithValue, scaleAgainstValue);

        if (this.puppetSpace) {
            if (this.puppetSpace.width <= this.sceneSettingsData.minimumPuppetSpaceWidth) {
                this.puppetSpace.width = this.sceneSettingsData.minimumPuppetSpaceWidth;
                this.puppetSpace.scale.y = this.puppetSpace.scale.x;
            }
        }

        if (this.hallwayBackground) {
            this.hallwayBackground.width = width * scaleAgainstValue;
            this.hallwayBackground.scale.y = this.hallwayBackground.scale.x;
        }
    }

    /**
     * Called when the Scene is activated
     * Starts the scene
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onEnter(): Promise<void> {
        this.startDialogueSequence();
    }

    /**
     * Called when the Scene is deactivated
     * Kills all the on-screen tween and resets
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onExit(): Promise<void> {
        EE.emit('hide_dialogue');
        this.sequenceTween.kill();
        this.hallwayBackground.alpha = 1;
        this.puppetSpace.alpha = 0;
    }
}