import { gsap } from 'gsap';
import { List } from "@pixi/ui";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Sprite } from "../../engine/actors/actors/sprite/sprite";
import { EE } from "../../engine/screen/game_screen";
import { Container } from 'pixi.js';

/** 
 * @class
 * @extends {Scene}
 * 
 * Card Example UI Scene
 */
export class CardExampleUI extends Scene {
    protected tableShadow!: Sprite;

    protected playerHandContainer!: Container;
    protected playerHandList!: List;

    protected shadowPlayerContainer!: Container;
    protected shadowPlayerHead!: Sprite;
    protected shadowHeadTween!: gsap.core.Timeline;

    protected maximumHandSize!: number;

    public override async init(): Promise<void> {
        const { gameScreen, sceneSettingsData } = this;

        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.maximumHandSize = sceneSettingsData.maximumHandSize;

        this.tableShadow = this.getChildByLabel('tableShadow') as Sprite;

        this.playerHandContainer = this.getChildByLabel('playerHandContainer') as Container;

        this.shadowPlayerContainer = this.getChildByLabel('shadowPlayerContainer') as Container;
        this.shadowPlayerHead = this.shadowPlayerContainer.getChildByLabel('head') as Sprite;

        this.resize(width, height, scaleWithValue, scaleAgainstValue);

        this.playerHandList = this.playerHandContainer.getChildByLabel('playerHand') as List

        /**
         * When a card is dealt to the player, this fires and adds the dealt card to the Player's Hand
         * 
         * @listens DealerPuppet#event:add_card_to_hand
         * @param {Sprite} Card - The Dealt Card Sprite
         */
        EE.on('add_card_to_hand', (card: Sprite) => {
            this.playerHandList.addChild(card);            
            card.gameX = 0;
            card.gameY = 0;

            // If the Player's Hand contains less than the maximum cards...
            if (this.playerHandList.children.length < this.maximumHandSize) {
                // Call for a new card

                /**
                 * Calls for a Card to be Dealt
                 * 
                 * @emits CardExampleUI#event:deal_card
                 */
                EE.emit('deal_card');
            } else {
                // Otherwise, randomly pick a card to discard and ask for a new one
                const randomCardIndex = Math.floor(Math.random() * this.playerHandList.children.length);
                const randomCard = this.playerHandList.getChildAt(randomCardIndex);

                gsap.to(this, {
                    delay: 0.5,
                    onComplete: () => {  
                        /**
                         * Sents the chosen card to the Discard Pile
                         * 
                         * @emits CardExampleUI#event:send_card_to_discard
                         */  
                        EE.emit('send_card_to_discard', randomCard); 
                    }
                });
                gsap.to(this, {
                    delay: 0.75,
                    onComplete: () => {
                        /**
                         * Calls for a Card to be Dealt
                         * 
                         * @emits CardExampleUI#event:deal_card
                         */  
                        EE.emit('deal_card'); 
                    }
                });
            }

            // Arrange all cards in the Player's Hand
            for (let i = 0; i < this.playerHandList.children.length; i++) {
                const cardInHand = this.playerHandList.children[i] as Sprite;
                
                cardInHand.gameX = i * 0.05;
            }
        });
    }

    /**
     * Called when the Scene is activated
     * Starts the Shadowy Player's head movment
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onEnter(): Promise<void> {
        this.createHeadBobTween();
    }

    /**
     * Called when the Scene is deactivated
     * Stops the Shadowy Player's head movment
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onExit(): Promise<void> {
        this.shadowHeadTween.kill();
    }

    /**
     * Reates the Shadowy Player's Head Bob
     */
    protected createHeadBobTween() {
        this.shadowHeadTween = gsap.timeline({ repeat: -1, yoyo: true })
            .to(
                this.shadowPlayerHead,
                {
                    duration: 3,
                    pivotY: -10,
                    ease: "sine.inOut"
                }
            );
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

        if (this.tableShadow) {
            this.tableShadow.width = window.innerWidth;
            this.tableShadow.height = window.innerHeight;
        }

        if (this.playerHandContainer) {
            this.playerHandContainer.scale = scaleWithValue;
            this.playerHandContainer.x = window.innerWidth * -0.5;
            this.playerHandContainer.y = window.innerHeight * 0.5;
            this.playerHandContainer.pivot.x = -350;
            this.playerHandContainer.pivot.y = 150;
        }

        if (this.shadowPlayerContainer) {
            this.shadowPlayerContainer.x = window.innerWidth * -0.5;
            this.shadowPlayerContainer.y = window.innerHeight * 0.5;
            this.shadowPlayerContainer.pivot.x = this.shadowPlayerContainer.width * -0.15;
            this.shadowPlayerContainer.scale = scaleWithValue;
        }
    }
}