import * as PIXIUI from '@pixi/ui';
import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from '../../engine/actors/actors/container/container';
import { app } from '../../engine/screen/game_screen';
import { FancyButton } from '../../engine/actors/actors/ui/fancy_button';

/** 
 * @class
 * @extends {Scene}
 * 
 * Scene used to add the Overlay Menu
 */
export class GameMenuScene extends Scene {
    protected menuPanel!: Container;
    protected menuButtonContainer!: Container;
    protected menuButtonView!: Container;
    protected menuButton!: PIXIUI.Button;

    protected buttonList!: Container;

    protected revealMenuState: boolean = false;

    /**
     * Initialise the scene
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async init(): Promise<void> {
        const { gameScreen } = this;

        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        // Grab overlay container from the base container that's not scaled like the rest of the game
        const staticOverlayContainer = app.stage.getChildByLabel('StaticOverlay') as Container;

        this.menuPanel = this.getChildByLabel('menuPanel') as Container;
        this.menuButtonView = this.getChildByLabel('latchButton') as Container;
        this.menuButton = this.menuButtonView.buttonInstance;

        staticOverlayContainer.addChild(this.menuButtonView);
        staticOverlayContainer.addChild(this.menuPanel);

        this.menuButtonContainer = this.menuPanel.getChildByLabel('menuButtonContainer') as Container;
        this.buttonList = this.menuButtonContainer.getChildByLabel('buttonList') as Container;

        const cardExampleButton = this.buttonList.getChildByLabel('cardButton') as FancyButton;
        const dialogueExampleButton = this.buttonList.getChildByLabel('dialogueExampleButton') as FancyButton;
        const fireEmitterButton = this.buttonList.getChildByLabel('fireEmitterButton') as FancyButton;
        const phoenixFlameButton = this.buttonList.getChildByLabel('phoenixButton') as FancyButton;

        this.resize(width, height, scaleWithValue, scaleAgainstValue);

        cardExampleButton.setState('disabled', true);
        dialogueExampleButton.setState('disabled', true);
        fireEmitterButton.setState('disabled', true);
        phoenixFlameButton.setState('disabled', true);

        const menuTween = gsap.to(
            this.menuButtonContainer, 
            { 
                alpha: 1, 
                duration: 0.5, 
                paused: true,
                onComplete: () => {
                    if (this.revealMenuState) {
                        cardExampleButton.setState('default');
                        dialogueExampleButton.setState('default');
                        fireEmitterButton.setState('default');
                        phoenixFlameButton.setState('default');
                    }
                }
            }
        );

        // Hook in All Menu Buttons to change scenes
        /**
         * Card Example 
         * 
         * @listens cardExampleButton#signal:onPress
         */
        cardExampleButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'card_example');
            this.gameScreen.changeScene('hud', 'card_example_ui');
        });

        /**
         * Dialogue Example
         * 
         * @listens dialogueExampleButton#signal:onPress
         */
        dialogueExampleButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'dialogue_example');
            this.gameScreen.changeScene('hud', 'dialogue_example_ui');
        });

        /**
         * Fire Emitter Example
         * 
         * @listens fireEmitterButton#signal:onPress
         */
        fireEmitterButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'fire_emitter');
            this.gameScreen.changeScene('hud', 'empty_ui');
        });

        /**
         * Phoenix Flame Example
         * 
         * @listens phoenixFlameButton#signal:onPress
         */
        phoenixFlameButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'phoenix_flame');
            this.gameScreen.changeScene('hud', 'empty_ui');
        });

        /**
         * Hooks into the Latch Button to reveal the menu
         * 
         * @listens menuButton#signal:onPress
         */
        this.menuButton.onPress.connect(() => {
            cardExampleButton.setState('disabled', true);
            dialogueExampleButton.setState('disabled', true);
            fireEmitterButton.setState('disabled', true);
            phoenixFlameButton.setState('disabled', true);

            this.revealMenuState = !this.revealMenuState
            this.revealMenuState ? menuTween.play() : menuTween.reverse();
            this.menuButtonView.alpha = this.revealMenuState ? 1 : 0.5;
        });

        // Hooks used to add a small amount of reactivity to the Latch Button
        /**
         * @listens menuButton#signal:onHover
         */
        this.menuButton.onHover.connect(() => {
            this.menuButtonView.alpha = 1;
        });
        /**
         * @listens menuButton#signal:onOut
         */
        this.menuButton.onOut.connect(() => {
            this.menuButtonView.alpha = 0.5;
        });
    }

    /**
     * Called when the Scene is activated
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onEnter(): Promise<void> {
        const { gameScreen } = this;
        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;
        this.resize(width, height, scaleWithValue, scaleAgainstValue);
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

        if (this.menuPanel) {
            this.menuButtonView.x = width * 0.5;
            this.menuButtonView.y = height * 0.1;
            this.menuButtonView.scale = scaleAgainstValue;

            this.menuPanel.x = width * 0.5;
            this.menuPanel.y = height * 0.2;
            this.menuPanel.scale = scaleAgainstValue;

            if (this.menuPanel.width > width) {
                this.menuPanel.width = width;
            }

            this.menuPanel.scale.y = this.menuPanel.scale.x;
        }
    }
}