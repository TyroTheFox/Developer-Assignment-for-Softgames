import * as PIXI from "pixi.js";
import { AnimationDataEntry, Pupetteer } from "../../../engine/actors/actors/animation/puppeteer";
import { Scene } from "../../../engine/actors/actors/scene/scene";
import { CardPoint } from "./card_point";
import { Container } from "../../../engine/actors/actors/container/container";
import { CharacterSprite } from "../../../engine/actors/actors/sprite/character_sprite";
import { Sprite } from "../../../engine/actors/actors/sprite/sprite";
import { EE } from "../../../engine/screen/game_screen";

/** 
 * @class
 * @extends {Puppeteer}
 * 
 * The Dealer Character Puppet
 * A pair of floating hands that deals out cards
 */
export class DealerPuppet extends Pupetteer {
    protected leftHand!: CharacterSprite;
    protected rightHand!: CharacterSprite;
    protected cardSpace!: Container;
    
    protected cardDeck!: CardPoint;
    protected discardPile!: CardPoint;
    protected playerHandPoint!: CardPoint;

    protected dealerTween!: gsap.core.Timeline;

    protected openHandKey: string = "handOpen";
    protected pointHandKey: string = "handPoint";

    protected pauseDealer: boolean = false;

    public flickStartDelay: number = 0.05;
    public delayBetweenLoops: number = 1;
    public normalDuration: number = 0.25;
    public quickDuration: number = 0.05;
    public delayBetweenEachAction: number = 0.25;

    /**
     * 
     * @constructor
     * @param {Scene} scene 
     * @param {AnimationDataEntry[]} animationData - Animation data used for creating new Tweens 
     * @param {?PIXI.Container[]} assets - The assets used in this Puppet that carry labels matching key elements of the Puppet
     */
    constructor(scene: Scene, animationData: AnimationDataEntry[], assets?: PIXI.Container[]) {
        super(scene, animationData, assets);

        this.cardSpace = this.assetMap.get('cardSpace') as Container;
        this.leftHand = this.assetMap.get('dealerLeftHand') as CharacterSprite;
        this.rightHand = this.assetMap.get('dealerRightHand') as CharacterSprite;

        // Card Point elements
        // Used instead of Containers because moving Sprites between different containers while they're being scaled is
        // needlessly annoying
        this.cardDeck = new CardPoint("deck", new PIXI.Point(-0.25, 0), this.attachedScene, true, 200);
        this.discardPile = new CardPoint("discard", new PIXI.Point(0.25, 0), this.attachedScene, true, 100);
        this.playerHandPoint = new CardPoint("playerHand", new PIXI.Point(0, 1.5), this.attachedScene, false, 300);

        // Add all cards to the Deck Card Point
        for (let i = 0; i < this.cardSpace.children.length; i++) {
            this.cardDeck.addCardToTop(this.cardSpace.children[i] as Sprite);
        }

        /**
         * Fired when a card has been sent to a new Card Point, checking specifically for when something is sent to the Player
         * When it does, the card is passed to the UI Scene
         * 
         * @listens CardPoint#event:card_sent_to_point
         * @param {string} name - Name of the Card Point the card is being sent to
         */
        EE.on('card_sent_to_point', (name: string) => {
            if (name === "playerHand") {
                EE.emit('add_card_to_hand', this.playerHandPoint.getTopCard());
            }
        });

        /**
         * Handles when a card is being sent to the Discard pile from the Player's Hand
         * Returns them to Card Space and then sends it on
         * 
         * @listens CardExampleUI#event:send_card_to_discard
         */  
        EE.on('send_card_to_discard', (randomCard: Sprite) => {
            this.cardSpace.addChild(randomCard);
            this.cardSpace.x = 0;
            this.cardSpace.y = 0;
            this.playerHandPoint.addCardToTop(randomCard);
            this.playerHandPoint.sendTopCardToCardPoint(this.discardPile, 1, 0);
        });

        // Events for handling the Hand Sprites via Tweens
        /**
         * @listens DealerPuppet#event:point_RightHand
         */
        EE.on('point_RightHand', () => {
            this.rightHand.setSprite(this.pointHandKey);
        });
        /**
         * @listens DealerPuppet#event:point_LeftHand
         */
        EE.on('point_LeftHand', () => {
            this.leftHand.setSprite(this.pointHandKey);
        });
        /**
         * @listens DealerPuppet#event:open_RightHand
         */
        EE.on('open_RightHand', () => {
            this.rightHand.setSprite(this.openHandKey);
        });
        /**
         * @listens DealerPuppet#event:open_LeftHand
         */
        EE.on('open_LeftHand', () => {
            this.leftHand.setSprite(this.openHandKey);
        });

        /**
         * When the Deal Animation is finished, the Dealer tells the rest of the Scene
         * @listens DealerPuppet#event:end_deal_card
         */
        EE.on('end_deal_card', () => {
            /**
             * @emits DealerPuppet#event:card_dealt
             */
            EE.emit('card_dealt');
        });

        /**
         * Sends a card to the Discard Pile from the Deck
         * 
         * @listens DealerPuppet#event:send_Deck_to_Discard
         */
        EE.on('send_Deck_to_Discard', () => {
            this.cardDeck.sendTopCardToCardPoint(this.discardPile, 1, this.flickStartDelay);
        });

        /**
         * Sends a card from the Deck to the Player's Hand
         * 
         * @listens DealerPuppet#event:send_Deck_to_Player_Hand
         */
        EE.on('send_Deck_to_Player_Hand', () => {
            this.cardDeck.sendTopCardToCardPoint(this.playerHandPoint, 1, this.flickStartDelay);
        });

        // Plays the Tween animations for the idle floating for the Dealer's hands
        this.playAnimation('idleLeft');
        this.playAnimation('idleRight');
    }

    /**
     * Starts a Deal Card animation
     * 
     * @public
     * @returns {void}
     */
    public dealCard() {
        if ((this.cardDeck.cardsLeft === 0 && !this.isAnimationPlaying('dealCard')) || this.pauseDealer) {
            return;
        }

        // Creates a Tween, passing in pre-defined variables for tweeking the animation
        const tween = this.playAnimation('dealCard', {
            rightHandStartingPositionX: this.rightHand.position.x,
            rightHandStartingPositionY: this.rightHand.position.y,
            leftHandStartingPositionX: this.leftHand.position.x,
            leftHandStartingPositionY: this.leftHand.position.y,
            delayBetweenLoops: this.delayBetweenLoops,
            normalDuration: this.normalDuration,
            quickDuration: this.quickDuration,
            delayBetweenEachAction: this.delayBetweenEachAction
        });

        if (tween) {
            this.dealerTween = tween;
        }
    }

    /**
     * Stops the Dealer animations
     * 
     * @public
     */
    public stopDealer() {
        if (this.dealerTween) {
            this.dealerTween.kill();
        }

        this.pauseDealer = true;
        /**
         * @listens DealerPuppet#event:pause_card_tweens
         */
        EE.emit('pause_card_tweens', true);
    }

    /**
     * Restarts the Dealer loop
     * 
     * @public
     */
    public restartDealer() {
        /**
         * @listens DealerPuppet#event:pause_card_tweens
         */
        EE.emit('pause_card_tweens', false);
        this.pauseDealer = false;
        this.dealCard();
    }
}