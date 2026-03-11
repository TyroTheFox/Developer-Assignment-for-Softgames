import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { CharacterSprite } from "../../../engine/actors/actors/character_sprite";
import { Container } from 'pixi.js';
import { CardPoint } from "./card_point";
import { Sprite } from "../../../engine/actors/actors/sprite";
import { Scene } from "../../../engine/actors/actors/scene/scene";
import { EE } from "../../../engine/screen/game_screen";

export class Dealer {
    protected leftHand!: CharacterSprite;
    protected rightHand!: CharacterSprite;
    protected cardSpace!: Container;

    protected tweenMap: Map<string, gsap.core.Timeline> = new Map();

    protected takingAction: boolean = false;

    protected cardDeck!: CardPoint;
    protected discardPile!: CardPoint;
    protected playerHandPoint!: CardPoint;

    protected dealerTween!: gsap.core.Timeline;

    constructor(leftHand: CharacterSprite, rightHand: CharacterSprite, cardSpace: Container, scene: Scene) {
        this.leftHand = leftHand;
        this.rightHand = rightHand;
        this.cardSpace = cardSpace;

        this.cardDeck = new CardPoint("deck", new PIXI.Point(-0.25, 0), scene, true, 200);
        this.discardPile = new CardPoint("discard", new PIXI.Point(0.25, 0), scene, true, 100);
        this.playerHandPoint = new CardPoint("playerHand", new PIXI.Point(0, 1.5), scene, false, 300);

        for (let i = 0; i < cardSpace.children.length; i++) {
            this.cardDeck.addCardToTop(cardSpace.children[i] as Sprite);
        }

        EE.on('cardSentToPoint', (name: string) => {
            if (name === "playerHand") {
                EE.emit('addCardToHand', this.playerHandPoint.getTopCard());
            }
        });

        EE.on('sendCardToDiscard', (randomCard: Sprite) => {
            cardSpace.addChild(randomCard);
            cardSpace.x = 0;
            cardSpace.y = 0;
            this.playerHandPoint.addCardToTop(randomCard);
            this.playerHandPoint.sendTopCardToLocation(this.discardPile.x, this.discardPile.y, 1, 0, this.discardPile);
        });

        EE.on('pauseDealer', () => {
            this.pauseDealer();
        });

        EE.on('resumeDealer', () => {
            this.resumeDealer();
        });

        // Hand floating tweens
        this.tweenMap.set('idleLeft', gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.15 })
            .to(this.leftHand, {
                duration: 1.5,
                pivotY: 25,
                ease: 'sine.inOut'
            })
        );
        this.tweenMap.set('idleRight', gsap.timeline({ repeat: -1, yoyo: true, repeatDelay: 0.15 })
            .to(this.rightHand, {
                duration: 1.5,
                pivotY: 25,
                ease: 'sine.inOut'
            })
        );
    }

    public dealCard() {
        if (this.takingAction && this.cardDeck.cardsLeft === 0) {
            return;
        }

        this.takingAction = true;

        const rightHandStartingPosition = this.rightHand.position;
        const leftHandStartingPosition = this.leftHand.position;

        const delayBetweenLoops = 1;
        const normalDuration = 0.25;
        const quickDuration = 0.05;
        const delayBetweenEachAction = 0.25;
        const flickStartDelay = 0.05;

        this.dealerTween = gsap.timeline({})
            // Move into Position over deck, point hand
            .to(this.rightHand, {
                delay: delayBetweenLoops,
                duration: normalDuration,
                x: -250,
                angle: 75,
                ease: 'sine.inOut',
                onComplete: () => {
                    this.rightHand.setSprite('handPoint');
                }
            })
            // Flick card to the discard
            .to(this.rightHand, {
                delay: delayBetweenEachAction,
                duration: quickDuration,
                angle: 25,
                ease: 'sine.inOut',
                onStart: () => {
                    this.cardDeck.sendTopCardToLocation(this.discardPile.x, this.discardPile.y, 1, flickStartDelay, this.discardPile);
                }
            })
            // Move out of the way
            .to(this.rightHand, {
                delay: delayBetweenEachAction,
                duration: quickDuration,
                angle: 0,
                x: -400,
                y: -50,
                ease: 'sine.inOut',
                onStart: () => {
                    this.rightHand.setSprite('handOpen');
                }
            })
            // Move into position
            .to(this.leftHand, {
                delay: delayBetweenEachAction,
                duration: normalDuration,
                x: -100,
                y: 400,
                angle: 75,
                ease: 'sine.inOut',
                onComplete: () => {
                    this.leftHand.setSprite('handPoint');
                }
            })
            // Flick card to player
            .to(this.leftHand, {
                delay: delayBetweenEachAction,
                duration: quickDuration,
                angle: 0,
                ease: 'sine.inOut',
                onStart: () => {
                    this.cardDeck.sendTopCardToLocation(this.playerHandPoint.x, this.playerHandPoint.y, 1, flickStartDelay, this.playerHandPoint);
                }
            })
            // Move back to start
            .to(this.leftHand, {
                delay: delayBetweenEachAction,
                duration: normalDuration,
                angle: 0,
                x: leftHandStartingPosition.x,
                y: leftHandStartingPosition.y,
                ease: 'sine.inOut',
                onStart: () => {
                    this.leftHand.setSprite('handOpen');
                }
            })
            // Move back to start
            .to(this.rightHand, {
                delay: delayBetweenEachAction,
                duration: normalDuration,
                angle: 0,
                x: rightHandStartingPosition.x,
                y: rightHandStartingPosition.y,
                ease: 'sine.inOut',
                onComplete: () => {
                    this.takingAction = false;
                    EE.emit('cardDealt')
                }
            });
    }

    public pauseDealer() {
        this.dealerTween.pause();
    }

    public resumeDealer() {
        this.dealerTween.resume();
    }
}