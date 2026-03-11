import { gsap } from 'gsap';
import { CharacterSprite } from "../../../engine/actors/actors/character_sprite";

export class Dealer {
    protected leftHand!: CharacterSprite;
    protected rightHand!: CharacterSprite;

    protected tweenMap: Map<string, gsap.core.Timeline> = new Map();

    constructor(leftHand: CharacterSprite, rightHand: CharacterSprite) {
        this.leftHand = leftHand;
        this.rightHand = rightHand;

        const idleLeftTimeLine = gsap.timeline({ repeat: -1, repeatDelay: 0.15 })
            .to(this.leftHand, {
                duration: 1.5,
                y: 15,
                ease: 'sine.inOut'
            })
            .to(this.leftHand, {
                delay: 0.15,
                duration: 1.5,
                y: 0,
                ease: 'sine.inOut'
            });

        const idleRightTimeLine = gsap.timeline({ repeat: -1, repeatDelay: 0.15 })
            .to(this.rightHand, {
                duration: 1.5,
                y: 15,
                ease: 'sine.inOut'
            })
            .to(this.rightHand, {
                delay: 0.15,
                duration: 1.5,
                y: 0,
                ease: 'sine.inOut'
            });

        this.tweenMap.set('idleLeft', idleLeftTimeLine);
        this.tweenMap.set('idleRight', idleRightTimeLine);
    }
}