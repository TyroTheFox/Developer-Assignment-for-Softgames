import * as PIXI from "pixi.js";
import { gsap } from 'gsap';
import { Scene } from "../scene/scene";
import { EE } from "../../../screen/game_screen";

export type TweenData = gsap.TweenVars & {
    eventStart?: string,
    eventInterrupt?: string,
    eventComplete?: string,
    eventRepeat?: string,
    eventUpdate?: string,
    eventReverse?: string
}

export type AnimationStep = {
    asset: string,
    to?: TweenData,
    from?: TweenData,
    position?: gsap.Position
};

export type AnimationDataEntry = {
    id: string,
    settings?: gsap.TimelineVars,
    steps: AnimationStep[]
}

/**
 * Puppeteer
 * 
 * Used to create complex Character Puppets by bringing together a collection of animation data
 * and on-screen assets into one place in a manner that allows for easier manipulation and cues
 * for an onscreen character.
 * 
 * Resulted from a refactoring of the original Dealer Class in order to create a system that can
 * create gsap timelines procedurally from external data.
 * 
 * @class
 */
export class Pupetteer {
    protected attachedScene!: Scene;

    protected animationMap: Map<string, AnimationDataEntry> = new Map();
    protected assetMap: Map<string, PIXI.Container> = new Map();

    protected animationsPlaying: string[] = [];
    
    /**
     * @constructor
     * @param {AnimationDataEntry[]} animationData - Animations this character can perform
     * @param {?PIXI.Container[]} assets - The parts of the Character the class manipulates (must be Labeled to be referenced in data)
     */
    constructor(scene: Scene, animationData: AnimationDataEntry[], assets?: PIXI.Container[]) {
        this.attachedScene = scene;

        for (let i = 0; i < animationData.length; i++) {
            this.animationMap.set(animationData[i].id, animationData[i]);
        }

        if (assets) {
            for (let i = 0; i < assets.length; i++) {
                this.assetMap.set(assets[i].label, assets[i]);
            }
        }
    }

    /**
     * Checks if an animation is currently playing
     * 
     * @param {string} id - ID of the Animation 
     * @returns {void}
     */
    public isAnimationPlaying(id: string) {
        return this.animationsPlaying.indexOf(id) !== -1;
    }

    /**
     * Plays a given animation loaded into the character
     * 
     * @param {string} id - Animation ID
     * @param {Record<string, any>} variables - Additional variables that can be fed in and referenced in the Step data for consistency
     * @returns 
     */
    public playAnimation(id: string, variables?: Record<string, any>): gsap.core.Timeline | void {
        const animationData = this.animationMap.get(id);

        if (!animationData && !this.isAnimationPlaying(id)) {
            return;
        }

        const { steps, settings } = animationData as AnimationDataEntry;

        const newTimeline = gsap.timeline(settings);

        for (let i = 0; i < steps.length; i++) {
            const { asset, to, from, position } = steps[i];

            if (this.assetMap.has(asset)) {
                const puppetAsset = this.assetMap.get(asset) as PIXI.Container;
                let toCopy = JSON.parse(JSON.stringify(to ?? {}));
                let fromCopy = JSON.parse(JSON.stringify(from ?? {}));
                let type = 'fromTo';

                if (to) {
                    toCopy = this.addEventCalls(newTimeline, toCopy);
                    this.parseTags(toCopy, variables);
                } else {
                    type = 'from';
                }

                if (from) {
                    fromCopy = this.addEventCalls(newTimeline, fromCopy);
                    this.parseTags(fromCopy, variables);
                } else {
                    type = 'to';
                }

                switch(type) {
                    case 'to':
                        newTimeline.to(puppetAsset, toCopy, position);
                        break;
                    case 'fromTo':
                        newTimeline.fromTo(puppetAsset, fromCopy, toCopy, position);
                        break;
                    case 'from':
                        newTimeline.from(puppetAsset, fromCopy, position);
                        break;
                };
                
            }
        }

        newTimeline.to(this,
            {
                onComplete: () => {
                    const animationIndex = this.animationsPlaying.indexOf(id);
                    this.animationsPlaying.splice(animationIndex, 1);
                }
            }
        );

        this.animationsPlaying.push(id);
    }

    /**
     * Parse tags included in the Step Data
     * 
     * @protected
     * @param {TweenData} tweenData - Raw data for this step
     * @param {?Record<string, any>} variables - Additional variables that can be fed in and referenced in the Step data for consistency
     */
    protected parseTags(tweenData: TweenData, variables?: Record<string, any>) {
        const tweenDataEntires = Object.entries(tweenData);

        for(let i = 0; i < tweenDataEntires.length; i++) {
            const [key, value] = tweenDataEntires[i];

            if (typeof value === 'string') {
                // External Variable Tag
                if (value.startsWith('#') && variables) {
                    // Get the variable key from the tag
                    const variableTag = value.substring(1);
                    const variable = variables[variableTag];

                    if (typeof variable !== 'undefined') {
                        tweenData[key] = variable;
                    }
                }
                
                // Random Tag
                if (value.startsWith('~')) {
                    // Start at 2 to avoid the brackets (for example; '~(-50, 50)')
                    const randomTag = value.substring(2, value.length - 1);
                    const randomVariables: string[] = randomTag.split(", ");

                    if (randomVariables.length > 0) {
                        tweenData[key] = gsap.utils.random(
                            Number(randomVariables[0]),
                            Number(randomVariables[1]),
                            Number(randomVariables[2]) ?? undefined    
                        );
                    }
                }
            }
        }
    }

    /**
     * Replaces a given Event variable in raw Tween data with a given event emission
     * It removes the original variable from the object because otherwise gsap complains
     * 
     * @param {gsap.core.Timeline} timeline - Tween Timeline
     * @param {TweenData} tweenData - Tween data
     * @returns {TweenData} - Conditioned tween data
     */
    protected addEventCalls(timeline: gsap.core.Timeline, tweenData: TweenData): TweenData {
        if(tweenData?.eventComplete) {
            tweenData.onComplete = (eventName: string) => { EE.emit(eventName ?? 'eventComplete', timeline) };
            tweenData.onCompleteParams = [JSON.parse(JSON.stringify(tweenData.eventComplete))];
            delete tweenData.eventComplete;
        }

        if(tweenData?.eventInterrupt) {
            tweenData.onInterrupt = (eventName) => { EE.emit(eventName ?? 'eventInterupt', timeline) };
            tweenData.onInterruptParams = [JSON.parse(JSON.stringify(tweenData.eventInterrupt))];
            delete tweenData.eventInterrupt;
        }

        if(tweenData?.eventRepeat) {
            tweenData.onRepeat = (eventName) => { EE.emit(eventName ?? 'eventRepeat', timeline) };
            tweenData.onRepeatParams = [JSON.parse(JSON.stringify(tweenData.eventRepeat))];
            delete tweenData.eventRepeat;
        }

        if(tweenData?.eventReverse) {
            tweenData.onReverseComplete = (eventName) => { EE.emit(eventName ?? 'eventReverse', timeline) };
            tweenData.onReverseCompleteParams = [JSON.parse(JSON.stringify(tweenData.eventRepeat))];
            delete tweenData.eventReverse;
        }

        if(tweenData?.eventStart) {
            tweenData.onStart = (eventName) => { EE.emit(eventName ?? 'eventStart', timeline) };
            tweenData.onStartParams = [JSON.parse(JSON.stringify(tweenData.eventStart))];
            delete tweenData.eventStart;
        }

        if(tweenData?.eventUpdate) {
            tweenData.onUpdate = (eventName) => { EE.emit(eventName ?? 'eventUpdate', timeline) };
            tweenData.onUpdateParams = [JSON.parse(JSON.stringify(tweenData.eventUpdate))];
            delete tweenData.eventUpdate;
        }

        return tweenData;
    }
}