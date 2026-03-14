import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { Sprite } from "../../../engine/actors/actors/sprite/sprite";
import { EE } from "../../../engine/screen/game_screen";

export class CardPoint {
    protected name: string = "CardPoint";
    protected position!: PIXI.Point;
    protected slideTopCard!: boolean;
    protected gamePosition!: PIXI.Point;
    protected attachedCards: Sprite[] = [];
    protected parent!: PIXI.Container;

    protected topCard!: Sprite;

    protected topCardPivotX: number = -60;
    protected baseZIndex: number = 0;

    protected animationPaused: boolean = false;

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

        EE.off('pauseCardTweens', (pause: boolean) => {
            this.animationPaused = pause;
        });
    }

    public get x(): number {
        return this.position.x;
    }

    public get y(): number {
        return this.position.y;
    }

    public get cardsLeft(): number {
        return this.attachedCards.length;
    }

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
                    duration: 0.1,
                    pivotX: this.topCardPivotX
                });
            } else {
                this.topCard.pivot.x = this.topCardPivotX;
            }
        }
    }

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

    public sendTopCardToLocation(x: number, y: number, duration: number, delay: number = 0, newCardPoint?: CardPoint) {
        const topCard = this.getTopCard();

        if (!topCard && this.animationPaused) {
            return;
        }

        gsap.fromTo(topCard, 
            {
                x: topCard.x,
                y: topCard.y
            },
            { 
                delay, 
                x, 
                y, 
                duration,
                onComplete: () => {
                    if (newCardPoint) {
                        newCardPoint.addCardToTop(topCard, true);
                        EE.emit("cardSentToPoint", newCardPoint.name, topCard, newCardPoint);
                    }
                }
            }
        );
    }
}