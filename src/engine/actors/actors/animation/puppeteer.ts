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

export class Pupetteer {
    protected attachedScene!: Scene;

    protected animationMap: Map<string, AnimationDataEntry> = new Map();
    protected assetMap: Map<string, PIXI.Container> = new Map();

    protected animationsPlaying: string[] = [];
    
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

    public isAnimationPlaying(id: string) {
        return this.animationsPlaying.indexOf(id) !== -1;
    }

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
                    if (variables) {
                        this.addVariables(toCopy, variables);
                    }
                } else {
                    type = 'from';
                }

                if (from) {
                    fromCopy = this.addEventCalls(newTimeline, fromCopy);
                    if (variables) {
                        this.addVariables(fromCopy, variables);
                    }
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

    protected addVariables(tweenData: TweenData, variables: Record<string, any>) {
        const tweenDataEntires = Object.entries(tweenData);

        for(let i = 0; i < tweenDataEntires.length; i++) {
            const [key, value] = tweenDataEntires[i];

            if (typeof value === 'string' && value.startsWith('#')) {
                const variableTag = value.substring(1);
                const variable = variables[variableTag];

                if (typeof variable !== 'undefined') {
                    tweenData[key] = variable;
                }
            }
        }
    }

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