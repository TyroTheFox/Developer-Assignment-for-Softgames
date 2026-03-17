import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { Scene } from "../../engine/actors/actors/scene/scene";
import { Container } from "../../engine/actors/actors/container/container";
import { ParticleContainer } from "../../engine/actors/actors/container/particle_container";
import { Sprite } from "../../engine/actors/actors/sprite/sprite";

/** 
 * @class
 * @extends {Scene}
 * 
 * Fire Emitter Scene
 */
export class FireEmitterScene extends Scene {
    protected castleBackground!: Sprite;

    protected sceneContainer!: Container;

    protected emitterContainer!: ParticleContainer;

    protected soraHighlightSprite!: Sprite;
    protected flameFloorHighlightSprite!: Sprite;
    protected soraHighlightTween!: gsap.core.Timeline;
    protected flameFloorHighlightTween!: gsap.core.Timeline;

    protected heartlessContainer!: Container;
    protected heartlessSpriteHighlight!: Sprite;
    protected heartlessShakeTween!: gsap.core.Timeline;
    protected heartlessHighlightTween!: gsap.core.Timeline;

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
        const { width, height, scaleAgainstValue } = gameScreen.gameScreenDimensions;

        this.castleBackground = this.getChildByLabel('castleBG') as Sprite;
        this.castleBackground.width = width * scaleAgainstValue;
        this.castleBackground.height = height * scaleAgainstValue;

        this.sceneContainer = this.getChildByLabel('sceneContainer') as Container;

        const emitterSpace = this.sceneContainer.getChildByLabel('emitterSpace') as Container;
        this.emitterContainer = emitterSpace.getChildByLabel('emitterContainer') as ParticleContainer;

        const soraContainer = this.sceneContainer.getChildByLabel('soraContainer') as Container;
        this.soraHighlightSprite = soraContainer.getChildByLabel('soraCastHighlight') as Sprite;
        this.flameFloorHighlightSprite = soraContainer.getChildByLabel('flameFloorHighlight') as Sprite;

        this.heartlessContainer = this.sceneContainer.getChildByLabel('heartlessSoldierContainer') as Container;
        this.heartlessSpriteHighlight = this.heartlessContainer.getChildByLabel('heartlessSoldierHighlight') as Sprite;
    }

    /**
     * Called when the Scene is activated
     * Starts all the on-screen tweens
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onEnter(): Promise<void> {        
        this.createSoraHighlightTween();
        this.createFlameFloorHighlightTween();
        this.createHeartlessShakeTween();
        this.createHeartlessHighlightTween();

        const { gameScreen } = this;
        const { width, height, scaleWithValue, scaleAgainstValue } = gameScreen.gameScreenDimensions;
        this.resize(width, height, scaleWithValue, scaleAgainstValue);
    }

    /**
     * Called when the Scene is deactivated
     * Kills all the on-screen tweens
     * 
     * @public
     * @override
     * @async
     * @returns {Promise<void>}
     */
    public override async onExit(): Promise<void> {
        this.soraHighlightTween.kill();
        this.flameFloorHighlightTween.kill();
        this.heartlessShakeTween.kill();
        this.heartlessHighlightTween.kill();
    }

    /**
     * Update the Emitter Container
     * 
     * @public
     * @override
     * @param {PIXI.Ticker} time - PIXI Ticker instance
     * @returns {void}
     */
    public override update(time: PIXI.Ticker): void {
        this.emitterContainer.onUpdate(time);
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

        if (this.castleBackground) {
            this.castleBackground.width = width * scaleAgainstValue;
            this.castleBackground.height = height * scaleAgainstValue;
        }

        if (this.sceneContainer) {
            this.sceneContainer.scale = scaleAgainstValue * 0.65;
            this.sceneContainer.x = 0;
        }
    }

    /**
     * Creates the Tweens that flash the Sora Highlight tween
     * 
     * @private
     */
    private createSoraHighlightTween() {
        this.soraHighlightTween = gsap.timeline({ 
            // When complete, loop again
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

    /**
     * Creates the Tween for the Flame highlight on the floor
     * 
     * @private
     */
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

    /**
     * Creates tweens for the Heartless where it shakes about
     * 
     * @private
     */
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

    /**
     * Create tweens that blink the flame highlight sprite
     * 
     * @private
     */
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