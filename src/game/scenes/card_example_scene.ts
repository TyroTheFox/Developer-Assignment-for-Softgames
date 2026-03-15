import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Sprite } from "../../engine/actors/actors/sprite/sprite";
import { EE } from "../../engine/screen/game_screen";
import { Container } from "../../engine/actors/actors/container/container";
import { SpriteCreatorData } from "../../engine/actors/factory_creators/sprite/sprite_creator";
import { CharacterSprite } from "../../engine/actors/actors/sprite/character_sprite";
import { DealerPuppet } from "../characters/card_example/dealer_puppet";

import dealerPuppetAnimationData from '../../data/animations/card_example/dealer_puppet.json' assert {type: 'json'};
import { AnimationDataEntry } from "../../engine/actors/actors/animation/puppeteer";

export class CardExampleScene extends Scene {
    protected pokerTableBackground!: Sprite;

    protected dealer!: DealerPuppet;
    protected cardsRequested: number = 0;

    public override async init(): Promise<void> {
        const { actorFactory, gameScreen } = this;
        const { size, cardSpriteData } = this.sceneSettingsData.deck;

        const { width, height, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.pokerTableBackground = this.getChildByLabel('pokerTableBG') as Sprite;
        this.pokerTableBackground.width = width * scaleAgainstValue;
        this.pokerTableBackground.height = height * scaleAgainstValue;

        const cardSpaceContainer = this.getChildByLabel('cardSpace') as Container;

        const cardSpritesheet = PIXI.Assets.get('cards') as PIXI.Spritesheet;

        const cardTextures = cardSpritesheet.textures;
        const cardNameList = Object.keys(cardTextures);

        for (let i = 0; i < size; i++) {
            const newCardSpriteData: SpriteCreatorData = JSON.parse(JSON.stringify(cardSpriteData));

            newCardSpriteData.id = "card_" + i;
            newCardSpriteData.texture = cardNameList[Math.floor(Math.random() * cardNameList.length)];

            actorFactory.buildActor(newCardSpriteData, cardSpaceContainer);
        }

        const dealerSpaceContainer = this.getChildByLabel('dealerSpace') as Container;
        const dealerLeftHand = dealerSpaceContainer.getChildByLabel('dealerLeftHand') as CharacterSprite;
        const dealerRightHand = dealerSpaceContainer.getChildByLabel('dealerRightHand') as CharacterSprite;
        const dealerAnimationData = dealerPuppetAnimationData as unknown as AnimationDataEntry[];

        this.dealer = new DealerPuppet(this, dealerAnimationData, [dealerLeftHand, dealerRightHand, cardSpaceContainer]);

        EE.on('dealCard', (cardsRequested: number = 1) => { 
            this.cardsRequested = cardsRequested;
            this.checkForRequestedCards();
        });
        EE.on('cardDealt', () => {
            this.checkForRequestedCards();
        });
    }

    public checkForRequestedCards() {
        if (this.cardsRequested > 0) {
            this.cardsRequested--;
            this.dealer.dealCard();
        }
    }

    public override resize(width: number, height: number, scale: number) {
        super.resize(width, height, scale);

        const { scaleAgainstValue } = this.gameScreen.gameScreenDimensions;

        if (this.pokerTableBackground) {
            this.pokerTableBackground.width = width * scaleAgainstValue;
            this.pokerTableBackground.height = height * scaleAgainstValue;
        }
    }

    public override async onEnter(): Promise<void> {
        this.dealer.restartDealer();
    }

    public override async onExit(): Promise<void> {
        this.dealer.stopDealer();
        this.cardsRequested = 0;
    }
}