import * as PIXIUI from '@pixi/ui';
import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from '../../engine/actors/actors/container/container';
import { app } from '../../engine/screen/game_screen';

export class GameMenuScene extends Scene {
    protected menuPanel!: Container;
    protected menuButtonContainer!: Container;
    protected menuButtonView!: Container;
    protected menuButton!: PIXIUI.Button;

    protected buttonList!: Container;

    protected lowerShutter: boolean = false;

    public override async init(): Promise<void> {
        const { gameScreen } = this;

        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        const staticOverlayContainer = app.stage.getChildByLabel('StaticOverlay') as Container;

        this.menuPanel = this.getChildByLabel('menuPanel') as Container;
        this.menuButtonView = this.getChildByLabel('latchButton') as Container;
        this.menuButton = this.menuButtonView.buttonInstance;

        staticOverlayContainer.addChild(this.menuButtonView);
        staticOverlayContainer.addChild(this.menuPanel);

        this.menuButtonContainer = this.menuPanel.getChildByLabel('menuButtonContainer') as Container;
        this.buttonList = this.menuButtonContainer.getChildByLabel('buttonList') as Container;
        const cardExampleButton = this.buttonList.getChildByLabel('cardButton') as PIXIUI.FancyButton;
        const dialogueExampleButton = this.buttonList.getChildByLabel('dialogueExampleButton') as PIXIUI.FancyButton;
        const fireEmitterButton = this.buttonList.getChildByLabel('fireEmitterButton') as PIXIUI.FancyButton;
        const phoenixFlameButton = this.buttonList.getChildByLabel('phoenixButton') as PIXIUI.FancyButton;

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
                    if (this.lowerShutter) {
                        cardExampleButton.setState('default');
                        dialogueExampleButton.setState('default');
                        fireEmitterButton.setState('default');
                        phoenixFlameButton.setState('default');
                    }
                }
            }
        );

        cardExampleButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'card_example');
            this.gameScreen.changeScene('hud', 'card_example_ui');
        });

        dialogueExampleButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'dialogue_example');
            this.gameScreen.changeScene('hud', 'dialogue_example_ui');
        });

        fireEmitterButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'fire_emitter');
            this.gameScreen.changeScene('hud', 'empty_ui');
        });

        phoenixFlameButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'phoenix_flame');
            this.gameScreen.changeScene('hud', 'empty_ui');
        });

        this.menuButton.onPress.connect(() => {
            cardExampleButton.setState('disabled', true);
            dialogueExampleButton.setState('disabled', true);
            fireEmitterButton.setState('disabled', true);
            phoenixFlameButton.setState('disabled', true);

            this.lowerShutter = !this.lowerShutter
            this.lowerShutter ? menuTween.play() : menuTween.reverse();
            this.menuButtonView.alpha = this.lowerShutter ? 1 : 0.5;
        });

        this.menuButton.onHover.connect(() => {
            this.menuButtonView.alpha = 1;
        });

        this.menuButton.onOut.connect(() => {
            this.menuButtonView.alpha = 0.5;
        });
    }

    public override resize(width: number, height: number, scaleWithValue: number, scaleAgainstValue: number) {
        super.resize(width, height, scaleWithValue, scaleAgainstValue);

        if (this.menuPanel) {
            this.menuButtonView.x = width * 0.5;
            this.menuButtonView.y = height * 0.1;

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