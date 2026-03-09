import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Sprite } from "../../engine/actors/actors/sprite";
import { SpriteCreatorData } from "../../engine/actors/factory_creators/sprite_creator";
import { Container } from "../../engine/actors/actors/container";

export class CardExampleScene extends Scene {
    private testSprite!: PIXI.Sprite;

    public override async init(): Promise<void> {
        const { actorFactory } = this;
        const { size, cardSpriteData } = this.sceneSettingsData.deck;

        this.testSprite = this.getChildByLabel('test') as Sprite;

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

        const testTimeline = gsap.timeline({
            delay: 1,
            repeat: -1,
            yoyo: true,
            repeatDelay: 1
        });

        testTimeline.to(topCard1, { duration: 2, x: deckContainer2.x - deckContainer1.x, ease: 'expo.inOut' });
    }

    public override update(time: PIXI.Ticker): void {
        this.testSprite.rotation += 0.1 * time.deltaTime;
    }
}