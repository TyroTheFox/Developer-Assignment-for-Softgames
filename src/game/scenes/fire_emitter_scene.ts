import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from "../../engine/actors/actors/container/container";
import { ParticleContainer } from "../../engine/actors/actors/container/particle_container";
import { Sprite } from "../../engine/actors/actors/sprite/sprite";
import { app } from "../../engine/screen/game_screen";

export class FireEmitterScene extends Scene {
    protected castleBackground!: Sprite;

    protected emitterContainer!: ParticleContainer;

    protected soraHighlightSprite!: Sprite;
    protected flameFloorHighlightSprite!: Sprite;
    protected soraHighlightTween!: gsap.core.Timeline;
    protected flameFloorHighlightTween!: gsap.core.Timeline;

    protected heartlessContainer!: Container;
    protected heartlessSpriteHighlight!: Sprite;
    protected heartlessShakeTween!: gsap.core.Timeline;
    protected heartlessHighlightTween!: gsap.core.Timeline;

    public override async init(): Promise<void> {
        const { gameScreen } = this;
        const { width, height, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.castleBackground = this.getChildByLabel('castleBG') as Sprite;
        this.castleBackground.width = width * scaleAgainstValue;
        this.castleBackground.height = height * scaleAgainstValue;

        const emitterSpace = this.getChildByLabel('emitterSpace') as Container;
        this.emitterContainer = emitterSpace.getChildByLabel('emitterContainer') as ParticleContainer;

        const soraContainer = this.getChildByLabel('soraContainer') as Container;
        this.soraHighlightSprite = soraContainer.getChildByLabel('soraCastHighlight') as Sprite;
        this.flameFloorHighlightSprite = soraContainer.getChildByLabel('flameFloorHighlight') as Sprite;

        this.heartlessContainer = this.getChildByLabel('heartlessSoldierContainer') as Container;
        this.heartlessSpriteHighlight = this.heartlessContainer.getChildByLabel('heartlessSoldierHighlight') as Sprite;
    }

    public override async onEnter(): Promise<void> {
        app.renderer.background.color = this.sceneSettingsData.backgroundColour;
        
        this.createSoraHighlightTween();
        this.createFlameFloorHighlightTween();
        this.createHeartlessShakeTween();
        this.createHeartlessHighlightTween();
    }

    public override async onExit(): Promise<void> {
        this.soraHighlightTween.kill();
        this.flameFloorHighlightTween.kill();
        this.heartlessShakeTween.kill();
        this.heartlessHighlightTween.kill();
    }

    public override update(time: PIXI.Ticker): void {
        this.emitterContainer.onUpdate(time);
    }

    public override resize(width: number, height: number, scaleWithValue: number, scaleAgainstValue: number) {
        super.resize(width, height, scaleWithValue, scaleAgainstValue);

        if (this.castleBackground) {
            this.castleBackground.width = width * scaleAgainstValue;
            this.castleBackground.height = height * scaleAgainstValue;
        }
    }

    private createSoraHighlightTween() {
        this.soraHighlightTween = gsap.timeline({ 
            onComplete: () => this.createSoraHighlightTween()
         })
            .to(
                this.soraHighlightSprite,
                {
                    duration: gsap.utils.random(0.1, 0.3),
                    alpha: 0.2,
                    tint: "white"
                }
            )            
            .to(
                this.soraHighlightSprite,
                {
                    duration: gsap.utils.random(0.1, 0.3),
                    alpha: 0.9,
                    tint: 0xFFFFFC
                }
            );
    }

    private createFlameFloorHighlightTween() {
        this.flameFloorHighlightTween = gsap.timeline({
            onComplete: () => this.createFlameFloorHighlightTween()
        })
            .to(
                this.flameFloorHighlightSprite,
                {
                    duration: gsap.utils.random(0.1, 0.3),
                    alpha: 0.1
                }
            )            
            .to(
                this.flameFloorHighlightSprite,
                {
                    duration: gsap.utils.random(0.1, 0.3),
                    alpha: 0.2
                }
            );
    }

    private createHeartlessShakeTween() {
        this.heartlessShakeTween = gsap.timeline({
            onComplete: () => this.createHeartlessShakeTween()
        })
            .to(
                this.heartlessContainer,
                {
                    delay: 0.1,
                    duration: 0.1,
                    pivotX: gsap.utils.random(-5, 5),
                    pivotY: gsap.utils.random(-5, 5)
                }
            );
    }

    private createHeartlessHighlightTween() {
        this.heartlessHighlightTween = gsap.timeline({
            onComplete: () => this.createHeartlessHighlightTween()
        })
            .to(
                this.heartlessSpriteHighlight,
                {
                    duration: gsap.utils.random(0.1, 0.3),
                    alpha: 0.2
                }
            )            
            .to(
                this.heartlessSpriteHighlight,
                {
                    duration: gsap.utils.random(0.1, 0.3),
                    alpha: 1
                }
            );
    }
}