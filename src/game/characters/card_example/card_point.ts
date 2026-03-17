import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { Sprite } from "../../../engine/actors/actors/sprite/sprite";
import { EE, GameScreen } from "../../../engine/screen/game_screen";

/** 
 * @class
 * 
 * Card Point
 * Instead of mucking around with nested containers for the card sprites, instead I kept them
 * in one container and used a Card Point to act as a place to move Cards between on-screen.
 * 
 * Able to keep track of cards assigned to it and send them to other Card Points that stand in for
 * different 'piles' of cards.
 */
export class CardPoint {
    private gameScreen = GameScreen.instance;
    
    protected name: string = "";
    protected position!: PIXI.Point;
    protected gamePosition!: PIXI.Point;
    protected attachedCards: Sprite[] = [];
    protected parent!: PIXI.Container;
    
    protected topCardPivotX: number = -60;
    protected baseZIndex: number = 0;
    
    protected animationPaused: boolean = false;

    public slideTopCard!: boolean;
    public topCard!: Sprite;

    /**
     * @constructor
     * @param {string} name 
     * @param {PIXI.Point} position - Relative Position based on the Full Size of the Screen 
     * @param {PIXI.Container} parent
     * @param {boolean=true} slideTopCard 
     * @param {?baseZIndex} baseZIndex - The base Z Index position to order each card so that different Card Points overlay others
     */
    constructor (name: string, position: PIXI.Point, parent: PIXI.Container, slideTopCard: boolean = true, baseZIndex?: number) {
        this.name = name;
        this.slideTopCard = slideTopCard;
        this.gamePosition = position;
        this.parent = parent;
        this.baseZIndex = baseZIndex || 0;

        this.position = new PIXI.Point(
            this.parent.width * this.gamePosition.x,
            this.parent.height * this.gamePosition.y
        );

        /**
         * Whether or not to pause the animations
         * 
         * @listens DealerPuppet#event:pause_card_tweens
         */
        EE.on('pause_card_tweens', (pause: boolean) => {
            this.animationPaused = pause;
        });

        /**
         * Updates the internal position when the scene resizes
         * 
         * @listens this.position#event:scene_resize
         */
        this.parent.on('scene_resize', () => {
            this.position = new PIXI.Point(
                this.parent.width * this.gamePosition.x,
                this.parent.height * this.gamePosition.y
            );
        });
    }

    /**
     * @get
     * @returns {number}
     */
    public get x(): number {
        return this.position.x;
    }

    /**
     * @get
     * @returns {number}
     */
    public get y(): number {
        return this.position.y;
    }

    /**
     * @get
     * @returns {number}
     */
    public get gameX(): number {
        return this.gamePosition.x;
    }

    /**
     * @get
     * @returns {number}
     */
    public get gameY(): number {
        return this.gamePosition.y;
    }

    /**
     * @get
     * @returns {number}
     */
    public get cardsLeft(): number {
        return this.attachedCards.length;
    }

    /**
     * Adds a Card Sprite to the Top of the Point
     * 
     * @param {Sprite} sprite - Card added to the Top
     * @param {boolean=false} easeLanding - Whether or not the top card being shifted over should be tweened 
     */
    public addCardToTop(sprite: Sprite, easeLanding = false) {
        if (this.topCard) {
            this.topCard.pivot.x = 0;
        }

        this.attachedCards.push(sprite);
        sprite.gameX = this.gamePosition.x;
        sprite.gameY = this.gamePosition.y;

        this.topCard = sprite;
        this.topCard.zIndex = this.baseZIndex + this.attachedCards.length;
        if (this.attachedCards.length > 1 && this.slideTopCard) {
            if (easeLanding) {
                gsap.to(this.topCard, {
                    delay: 0.5,
                    duration: 0.5,
                    pivotX: this.topCardPivotX
                });
            } else {
                this.topCard.pivot.x = this.topCardPivotX;
            }
        }
    }

    /**
     * Returns the Top Card of the Point
     * 
     * @returns {Sprite}
     */
    public getTopCard(): Sprite {
        if (this.topCard) {
            this.topCard.pivot.x = 0;
        }

        const returnCard = this.attachedCards.pop() as Sprite;

        if (this.attachedCards.length > 1 && this.slideTopCard) {
            this.topCard = this.attachedCards[this.attachedCards.length - 1];
            this.topCard.pivot.x = this.topCardPivotX;
        }

        return returnCard;
    }

    /**
     * Sends the top card of this Point to a new Card Point
     * 
     * @param {CardPoint} newCardPoint - The new Card Point to send to
     * @param {number} duration - How long the tweened movement takes
     * @param {number=0} delay - Delay before the card is sent 
     * @returns {void}
     */
    public sendTopCardToCardPoint(newCardPoint: CardPoint, duration: number, delay: number = 0) {
        const topCard = this.getTopCard();

        if (!topCard && this.animationPaused) {
            return;
        }

        const { width, height } = this.gameScreen.gameScreenDimensions;

        this.unoffsetTopCard(newCardPoint, true);
        
        const newPointPosition = new PIXI.Point(newCardPoint.gameX * width, newCardPoint.gameY * height);
        
        gsap.fromTo(topCard, 
            {
                x: topCard.x,
                y: topCard.y
            },
            { 
                delay, 
                x: newPointPosition.x, 
                y: newPointPosition.y,
                duration,
                onComplete: () => {
                    if (newCardPoint) {
                        newCardPoint.addCardToTop(topCard, true);
                        /**
                         * @emits CardPoint#event:card_sent_to_point
                         */
                        EE.emit("card_sent_to_point", newCardPoint.name, topCard, newCardPoint);
                    }
                }
            }
        );
    }

    /**
     * Pushes an Offset Top Card back into the Point fully
     * 
     * @param {CardPoint} cardPoint - The Card Point to effect
     * @param {boolean=false} easeLanding - Whether or not shifting the card back is tweened
     */
    public unoffsetTopCard(cardPoint: CardPoint, easeLanding = false) {
        if (cardPoint.attachedCards.length > 1 && cardPoint.slideTopCard) {
            if (easeLanding) {
                gsap.to(cardPoint.topCard, {
                    duration: 1,
                    pivotX: 0
                });
            } else {
                cardPoint.topCard.pivot.x = 0;
            }
        }
    }
}