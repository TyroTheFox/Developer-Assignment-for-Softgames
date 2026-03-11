import { gsap } from 'gsap';
import { List } from "@pixi/ui";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Sprite } from "../../engine/actors/actors/sprite";
import { EE } from "../../engine/screen/game_screen";

export class CardExampleUI extends Scene {
    protected playerHandContainer!: List;

    protected maximumHandSize = 5;

    public override async init(): Promise<void> {
        const { gameScreen } = this;

        const { scaleWithValue } = gameScreen.gameScreenDimensions;

        this.playerHandContainer = this.getChildByLabel('playerHandContainer') as List;
        this.playerHandContainer.scale = scaleWithValue;
        this.playerHandContainer.pivot.y = window.innerHeight * -0.4;

        EE.on('addCardToHand', (card: Sprite) => {
            this.playerHandContainer.addChild(card);            
            card.gameX = 0;
            card.gameY = 0;

            if (this.playerHandContainer.children.length < this.maximumHandSize) {
                EE.emit('dealCard');
            } else {
                const randomCardIndex = Math.floor(Math.random() * this.playerHandContainer.children.length);
                const randomCard = this.playerHandContainer.getChildAt(randomCardIndex);

                gsap.to(this, {
                    delay: 0.5,
                    onComplete: () => {  EE.emit('sendCardToDiscard', randomCard); }
                });
                gsap.to(this, {
                    delay: 0.75,
                    onComplete: () => {  EE.emit('dealCard'); }
                });
            }

            for (let i = 0; i < this.playerHandContainer.children.length; i++) {
                const cardInHand = this.playerHandContainer.children[i] as Sprite;
                
                cardInHand.gameX = i * 0.05;
            }
        });
    }

    public override resize(width: number, height: number, scale: number) {
        super.resize(width, height, scale);

        const { gameScreen } = this;

        const { scaleWithValue } = gameScreen.gameScreenDimensions;

        if (this.playerHandContainer) {
            this.playerHandContainer.scale = scaleWithValue;
            this.playerHandContainer.pivot.y = window.innerHeight * -0.4;
        }
    }
}