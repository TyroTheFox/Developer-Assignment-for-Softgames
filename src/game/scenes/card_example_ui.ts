import { gsap } from 'gsap';
import { List } from "@pixi/ui";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Sprite } from "../../engine/actors/actors/sprite/sprite";
import { EE } from "../../engine/screen/game_screen";
import { Container } from 'pixi.js';

export class CardExampleUI extends Scene {
    protected tableShadow!: Sprite;

    protected playerHandContainer!: Container;
    protected playerHandList!: List;

    protected shadowPlayerContainer!: Container;
    protected shadowPlayerHead!: Sprite;
    protected shadowHeadTween!: gsap.core.Timeline;

    protected maximumHandSize = 5;

    public override async init(): Promise<void> {
        const { gameScreen } = this;

        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.tableShadow = this.getChildByLabel('tableShadow') as Sprite;

        this.playerHandContainer = this.getChildByLabel('playerHandContainer') as Container;

        this.shadowPlayerContainer = this.getChildByLabel('shadowPlayerContainer') as Container;
        this.shadowPlayerHead = this.shadowPlayerContainer.getChildByLabel('head') as Sprite;

        this.resize(width, height, scaleWithValue, scaleAgainstValue);

        this.playerHandList = this.playerHandContainer.getChildByLabel('playerHand') as List

        EE.on('addCardToHand', (card: Sprite) => {
            this.playerHandList.addChild(card);            
            card.gameX = 0;
            card.gameY = 0;

            if (this.playerHandList.children.length < this.maximumHandSize) {
                EE.emit('dealCard');
            } else {
                const randomCardIndex = Math.floor(Math.random() * this.playerHandList.children.length);
                const randomCard = this.playerHandList.getChildAt(randomCardIndex);

                gsap.to(this, {
                    delay: 0.5,
                    onComplete: () => {  EE.emit('sendCardToDiscard', randomCard); }
                });
                gsap.to(this, {
                    delay: 0.75,
                    onComplete: () => {  EE.emit('dealCard'); }
                });
            }

            for (let i = 0; i < this.playerHandList.children.length; i++) {
                const cardInHand = this.playerHandList.children[i] as Sprite;
                
                cardInHand.gameX = i * 0.05;
            }
        });
    }

    public override async onEnter(): Promise<void> {
        this.createHeadBobTween();
    }

    public override async onExit(): Promise<void> {
        this.shadowHeadTween.kill();
    }

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