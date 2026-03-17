import * as PIXI from "pixi.js";
import { Scene } from "../../engine/actors/actors/scene/scene";
import { EE } from "../../engine/screen/game_screen";
import { Container } from "../../engine/actors/actors/container/container";
import { SpriteCreatorData } from "../../engine/actors/factory_creators/sprite/sprite_creator";
import { CharacterSprite } from "../../engine/actors/actors/sprite/character_sprite";
import { DealerPuppet } from "../characters/card_example/dealer_puppet";

import dealerPuppetAnimationData from '../../data/animations/card_example/dealer_puppet.json' assert {type: 'json'};
import { AnimationDataEntry } from "../../engine/actors/actors/animation/puppeteer";
import { TilingSprite } from "../../engine/actors/actors/sprite/tiling_sprite";

/** 
 * @class
 * @extends {Scene}
 * 
 * Card Example Scene
 */
export class CardExampleScene extends Scene {
    protected pokerTableBackground!: TilingSprite;

    protected tableContainer!: Container;
    protected cardSpaceContainer!: Container;

    protected dealer!: DealerPuppet;
    protected cardsRequested: number = 0;

    /**
     * Initialise the scene
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async init(): Promise<void> {
        const { actorFactory, gameScreen } = this;
        const { size, cardSpriteData } = this.sceneSettingsData.deck;

        const { width, height, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.pokerTableBackground = this.getChildByLabel('pokerTableBG') as TilingSprite;
        this.pokerTableBackground.width = width * scaleAgainstValue;
        this.pokerTableBackground.height = height * scaleAgainstValue;

        this.tableContainer = this.getChildByLabel('tableContainer') as Container;
        this.cardSpaceContainer = this.tableContainer.getChildByLabel('cardSpace') as Container;

        const cardSpritesheet = PIXI.Assets.get('cards') as PIXI.Spritesheet;

        const cardTextures = cardSpritesheet.textures;
        const cardNameList = Object.keys(cardTextures);

        for (let i = 0; i < size; i++) {
            const newCardSpriteData: SpriteCreatorData = JSON.parse(JSON.stringify(cardSpriteData));

            newCardSpriteData.id = "card_" + i;
            newCardSpriteData.texture = cardNameList[Math.floor(Math.random() * cardNameList.length)];

            actorFactory.buildActor(newCardSpriteData, this.cardSpaceContainer);
        }

        const dealerSpaceContainer = this.tableContainer.getChildByLabel('dealerSpace') as Container;
        const dealerLeftHand = dealerSpaceContainer.getChildByLabel('dealerLeftHand') as CharacterSprite;
        const dealerRightHand = dealerSpaceContainer.getChildByLabel('dealerRightHand') as CharacterSprite;
        const dealerAnimationData = dealerPuppetAnimationData as unknown as AnimationDataEntry[];

        this.dealer = new DealerPuppet(this, dealerAnimationData, [dealerLeftHand, dealerRightHand, this.cardSpaceContainer]);

        /**
         * Queue up cards to send to the player
         * 
         * @listens CardExampleUI#event:deal_card
         */
        EE.on('deal_card', (cardsRequested: number = 1) => { 
            this.cardsRequested = cardsRequested;
            this.checkForRequestedCards();
        });

        /**
         * The Dealer just dealt a new card, so now check if there's another needed
         * 
         * @listens DealerPuppet#event:card_dealt
         */
        EE.on('card_dealt', () => {
            this.checkForRequestedCards();
        });
    }

    /**
     * Check for any card requests, deal a card if so
     * 
     * @public
     */
    public checkForRequestedCards() {
        if (this.cardsRequested > 0) {
            this.cardsRequested--;
            this.dealer.dealCard();
        }
    }

    /**
     * Resizes the elements of the scene
     * 
     * @public
     * @override
     * @param {number} width - Scaled Screen Width 
     * @param {number} height - Scaled Screen Height 
     * @param {number} scaleWithValue - Scale value that matches that of the Game Screen Space 
     * @param {number} scaleAgainstValue - Scale vale that inverts that of the Game Screen Space
     */
    public override resize(width: number, height: number, scaleWithValue: number, scaleAgainstValue: number) {
        super.resize(width, height, scaleWithValue, scaleAgainstValue);

        if (this.tableContainer) {
            if (height > width) {
            // Portrait
                this.tableContainer.height = width;
                this.tableContainer.scale.x = this.tableContainer.scale.y;
            } else {
                this.tableContainer.scale.x = this.tableContainer.scale.y = 1;
            }
        }

        if (this.pokerTableBackground) {
            this.pokerTableBackground.height = height * scaleAgainstValue;
            this.pokerTableBackground.width = width * scaleAgainstValue;

            if (height > width) {
                // Portrait
                this.tableContainer.height = width;
                this.tableContainer.scale.x = this.tableContainer.scale.y;

                this.pokerTableBackground.tileScale = 10;
            } else {
                this.tableContainer.scale.x = this.tableContainer.scale.y = 1;
                
                this.pokerTableBackground.tileScale = 4;
            }
        }
    }

    /**
     * Called when the Scene is activated
     * Kick-starts the dealer loop
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onEnter(): Promise<void> {
        this.dealer.restartDealer();

        const { gameScreen } = this;
        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;
        this.resize(width, height, scaleWithValue, scaleAgainstValue);
    }

    /**
     * Called when the Scene is deactivated
     * Halts the dealer loop
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onExit(): Promise<void> {
        this.dealer.stopDealer();
        this.cardsRequested = 0;
    }
}