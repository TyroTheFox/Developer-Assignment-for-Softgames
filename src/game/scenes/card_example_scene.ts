import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { SpriteCreatorData } from "../../engine/actors/factory_creators/sprite_creator";
import { Container } from "../../engine/actors/actors/container";
import { Sprite } from "../../engine/actors/actors/sprite";
import { CharacterSprite } from "../../engine/actors/actors/character_sprite";
import { Dealer } from "../characters/card_example/dealer";

export class CardExampleScene extends Scene {
    private tweenTimeline!: gsap.core.Timeline;
    protected pokerTableBackground!: Sprite;

    protected dealer!: Dealer;

    public override async init(): Promise<void> {
        const { actorFactory, gameScreen } = this;
        const { size, cardSpriteData } = this.sceneSettingsData.deck;

        const { width, height, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.pokerTableBackground = this.getChildByLabel('pokerTableBG') as Sprite;
        this.pokerTableBackground.width = width * scaleAgainstValue;
        this.pokerTableBackground.height = height * scaleAgainstValue;

        const dealerSpaceContainer = this.getChildByLabel('dealerSpace') as Container;
        const dealerLeftHand = dealerSpaceContainer.getChildByLabel('dealerLeftHand') as CharacterSprite;
        const dealerRightHand = dealerSpaceContainer.getChildByLabel('dealerRightHand') as CharacterSprite;

        this.dealer = new Dealer(dealerLeftHand, dealerRightHand);

        const cardSpaceContainer = this.getChildByLabel('cardSpace') as Container;
        const deckContainer1 = cardSpaceContainer.getChildByLabel('deckContainer1') as Container;
        const deckContainer2 = cardSpaceContainer.getChildByLabel('deckContainer2') as Container;

        const cardSpritesheet = PIXI.Assets.get('cards') as PIXI.Spritesheet;

        const cardTextures = cardSpritesheet.textures;
        const cardNameList = Object.keys(cardTextures);

        let useDeck1 = true;

        for (let i = 0; i < size; i++) {
            const newCardSpriteData: SpriteCreatorData = JSON.parse(JSON.stringify(cardSpriteData));

            newCardSpriteData.id = "card_" + i;
            newCardSpriteData.texture = cardNameList[Math.floor(Math.random() * cardNameList.length)];

            actorFactory.buildActor(newCardSpriteData, useDeck1 ? deckContainer1 : deckContainer2);

            useDeck1 = !useDeck1;
        }

        const topCard1 = deckContainer1.getChildAt(deckContainer1.children.length -1);
        topCard1.x = topCard1.height * 0.3;

        const topCard2 = deckContainer2.getChildAt(deckContainer2.children.length -1);
        topCard2.x = topCard2.height * 0.3;

        this.tweenTimeline = gsap.timeline({
            delay: 1,
            repeat: -1,
            yoyo: true,
            repeatDelay: 1
        });

        this.tweenTimeline.to(topCard1, { duration: 2, x: deckContainer2.x - deckContainer1.x, ease: 'expo.inOut' });
        this.tweenTimeline.pause(0);
    }

    public override update(_time: PIXI.Ticker): void {
        const { width, height, scaleAgainstValue } = this.gameScreen.gameScreenDimensions;

        this.pokerTableBackground.width = width * scaleAgainstValue;
        this.pokerTableBackground.height = height * scaleAgainstValue;
    }

    public override async onEnter(): Promise<void> {
        this.tweenTimeline.resume();
    }

    public override async onExit(): Promise<void> {
        this.tweenTimeline.pause(0);
    }
}