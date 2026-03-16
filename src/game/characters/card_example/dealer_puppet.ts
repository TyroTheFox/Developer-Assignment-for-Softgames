import * as PIXI from "pixi.js";
import { AnimationDataEntry, Pupetteer } from "../../../engine/actors/actors/animation/puppeteer";
import { Scene } from "../../../engine/actors/actors/scene/scene";
import { CardPoint } from "./card_point";
import { Container } from "../../../engine/actors/actors/container/container";
import { CharacterSprite } from "../../../engine/actors/actors/sprite/character_sprite";
import { Sprite } from "../../../engine/actors/actors/sprite/sprite";
import { EE } from "../../../engine/screen/game_screen";

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

    constructor(scene: Scene, animationData: AnimationDataEntry[], assets?: PIXI.Container[]) {
        super(scene, animationData, assets);

        this.cardSpace = this.assetMap.get('cardSpace') as Container;
        this.leftHand = this.assetMap.get('dealerLeftHand') as CharacterSprite;
        this.rightHand = this.assetMap.get('dealerRightHand') as CharacterSprite;

        this.cardDeck = new CardPoint("deck", new PIXI.Point(-0.25, 0), this.attachedScene, this.cardSpace, true, 200);
        this.discardPile = new CardPoint("discard", new PIXI.Point(0.25, 0), this.attachedScene, this.cardSpace, true, 100);
        this.playerHandPoint = new CardPoint("playerHand", new PIXI.Point(0, 1.5), this.attachedScene, this.cardSpace, false, 300);

        for (let i = 0; i < this.cardSpace.children.length; i++) {
            this.cardDeck.addCardToTop(this.cardSpace.children[i] as Sprite);
        }

        EE.on('cardSentToPoint', (name: string) => {
            if (name === "playerHand") {
                EE.emit('addCardToHand', this.playerHandPoint.getTopCard());
            }
        });

        EE.on('sendCardToDiscard', (randomCard: Sprite) => {
            this.cardSpace.addChild(randomCard);
            this.cardSpace.x = 0;
            this.cardSpace.y = 0;
            this.playerHandPoint.addCardToTop(randomCard);
            this.playerHandPoint.sendTopCardToLocation(this.discardPile, 1, 0);
        });

        EE.on('point_RightHand', () => {
            this.rightHand.setSprite(this.pointHandKey);
        });

        EE.on('point_LeftHand', () => {
            this.leftHand.setSprite(this.pointHandKey);
        });

        EE.on('open_RightHand', () => {
            this.rightHand.setSprite(this.openHandKey);
        });

        EE.on('open_LeftHand', () => {
            this.leftHand.setSprite(this.openHandKey);
        });

        EE.on('end_deal_card', () => {
            EE.emit('cardDealt');
        });

        EE.on('send_Deck_to_Discard', () => {
            this.cardDeck.sendTopCardToLocation(this.discardPile, 1, this.flickStartDelay);
        });

        EE.on('send_Deck_to_Player_Hand', () => {
            this.cardDeck.sendTopCardToLocation(this.playerHandPoint, 1, this.flickStartDelay);
        });

        this.playAnimation('idleLeft');
        this.playAnimation('idleRight');
    }

    public dealCard() {
        if ((this.cardDeck.cardsLeft === 0 && !this.isAnimationPlaying('dealCard')) || this.pauseDealer) {
            return;
        }

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

    public stopDealer() {
        if (this.dealerTween) {
            this.dealerTween.kill();
        }

        this.pauseDealer = true;
        EE.emit('pauseCardTweens', true);
    }

    public restartDealer() {
        EE.emit('pauseCardTweens', false);
        this.pauseDealer = false;
        this.dealCard();
    }
}