import * as PIXIUI from '@pixi/ui';
import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from '../../engine/actors/actors/container/container';
import { List } from '../../engine/actors/actors/container/list';

export class GameMenuScene extends Scene {
    protected menuPanel!: Container;
    protected menuButton!: PIXIUI.Button;
    protected lowerShutter: boolean = true;

    public override async init(): Promise<void> {
        this.menuPanel = this.getChildByLabel('menuPanel') as Container;
        this.menuPanel.pivot.y = window.innerHeight * 0.5;

        const menuButtonView = this.menuPanel.getChildByLabel('latchButton') as Container;
        this.menuButton = menuButtonView.buttonInstance;

        const buttonList = this.menuPanel.getChildByLabel('buttonList') as List;
        const cardExampleButton = buttonList.getChildByLabel('cardButton') as PIXIUI.FancyButton;
        const dialogueExampleButton = buttonList.getChildByLabel('dialogueExampleButton') as PIXIUI.FancyButton;
        const fireEmitterButton = buttonList.getChildByLabel('fireEmitterButton') as PIXIUI.FancyButton;

        const menuTween = gsap.to(this.menuPanel, { 
            y: 50, 
            duration: 0.5, 
            paused: true,
            onUpdate: () => {
                cardExampleButton.setState('disabled', true);
                dialogueExampleButton.setState('disabled', true);
                fireEmitterButton.setState('disabled', true);
            },
            onComplete: () => {
                cardExampleButton.setState('default');
                dialogueExampleButton.setState('default');
                fireEmitterButton.setState('default');
            }
        });

        cardExampleButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'card_example');
            this.gameScreen.changeScene('hud', 'card_example_ui');
        });

        dialogueExampleButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'fire_emitter');
            this.gameScreen.changeScene('hud', 'empty_ui');
        });

        fireEmitterButton.onPress.connect(() => {
            this.gameScreen.changeScene('main', 'dialogue_example');
            this.gameScreen.changeScene('hud', 'dialogue_example_ui');
        });

        this.menuButton.onPress.connect(() => {
            this.lowerShutter ? menuTween.play() : menuTween.reverse();
            this.lowerShutter = !this.lowerShutter
            menuButtonView.alpha = this.lowerShutter ? 1 : 0.5;
        });

        this.menuButton.onHover.connect(() => {
            menuButtonView.alpha = 1;
        });

        this.menuButton.onOut.connect(() => {
            menuButtonView.alpha = 0.5;
        });
    }

    public override resize(width: number, height: number, scale: number) {
        super.resize(width, height, scale);

        if (this.menuPanel) {
            this.menuPanel.pivot.y = window.innerHeight * 0.5;
        }
    }
}