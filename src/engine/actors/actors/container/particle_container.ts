import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GameScreen } from '../../../screen/game_screen';
import { ParticleContainerCreatorData, ParticleData } from '../../factory_creators/container/particle_container_creator';
import { AnimationDataEntry, AnimationStep, TweenData } from '../animation/puppeteer';

export type ParticleUpdateData = PIXI.ParticleOptions & {
    lifetime: number,
    accelX?: number,
    accelY?: number
}

export class ParticleContainer extends PIXI.ParticleContainer {
    private gameScreen = GameScreen.instance;
    protected actorData!: ParticleContainerCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};

    protected maximumParticles: number = 0;
    protected removeParticlesWhenAtMax: boolean = false;

    protected particleData: ParticleData[] = [];
    protected particleTimings: Record<string, number> = {};

    protected particleList: PIXI.Particle[] = [];

    protected animationMap: Map<string, AnimationDataEntry> = new Map();
    
    constructor(options: PIXI.ParticleContainerOptions, data: ParticleContainerCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }
        
        this.maximumParticles = data.maximumParticles ?? 100;
        this.removeParticlesWhenAtMax = data.removeParticlesWhenAtMax ?? false;

        this.particleData = data.particle;

        for (let i = 0; i < this.particleData.length; i++) {
            const { id, options, animation } = this.particleData[i];

            this.particleTimings[id] = 0;

            if (PIXI.Cache.has(options.texture)) {
                options.texture = PIXI.Cache.get(options.texture);
            }

            const animationDataCopy = JSON.parse(JSON.stringify(animation));
            this.animationMap.set(id, animationDataCopy);
        }

        this.on('childAdded', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
        this.on('childRemoved', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
    }

    /**
     * Position of X as a percentage of the Screen
     */
    public set gameX(coord: number) {
        this.gamePosition.x = coord;
        this.x = this.gameScreen.gameScreenDimensions.width * this.gamePosition.x;
    }

    /**
     * Position of Y as a percentage of the Screen
     */
    public set gameY(coord: number) {
        this.gamePosition.y = coord;
        this.y = this.gameScreen.gameScreenDimensions.height * this.gamePosition.y;
    }

    /**
     * Relative Pivot X Position of the Object
     */
    public set pivotX(coord: number) {
        this.pivot.x = coord;
    }

    /**
     * Relative Pivot Y Position of the Object
     */
    public set pivotY(coord: number) {
        this.pivot.y = coord;
    }

    public onUpdate(time: PIXI.Ticker) {
        if (this.particleChildren.length >= this.maximumParticles) {
            if (this.removeParticlesWhenAtMax) {
                const oldestParticle = this.particleList.sort((a, b) => {
                    const aTween = gsap.getTweensOf(a);
                    const bTween = gsap.getTweensOf(b);
                    const aTime = aTween[0].rawTime();
                    const bTime = bTween[0].rawTime();

                    return aTime - bTime;
                });
                this.deleteParticle(oldestParticle[0]);
            } else {
                return;
            }
        }

        for (let i = 0; i < this.particleData.length; i++) {
            const { id, spawnDelay, options } = this.particleData[i];

            this.particleTimings[id] += time.deltaMS;

            if (this.particleTimings[id] >= spawnDelay) {
                this.particleTimings[id] = 0;
                const particleTweenAnimation = this.animationMap.get(id) as AnimationDataEntry;

                this.spawnParticle(options, particleTweenAnimation);
            }
        }
    }

    public spawnParticle(options: PIXI.ParticleOptions, particleTweenAnimation: AnimationDataEntry): PIXI.Particle {
        const { settings, steps } = particleTweenAnimation;
        const particle = new PIXI.Particle(options);
        particle.rotation = (90 * Math.PI) / 180;

        this.addParticle(particle);
        this.particleList.push(particle);

        this.createParticleTweenTimeline(particle, steps, settings);

        return particle;

    }

    public deleteParticle(particle: PIXI.Particle) {
        gsap.killTweensOf(particle);
        this.removeParticle(particle);
        this.particleList.splice(this.particleList.indexOf(particle));
    }

    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : width * (this.gamePosition.x ?? 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : height * (this.gamePosition.y ?? 0);

        this.x = caluclatedX;
        this.y = caluclatedY;

        this.emit('scene_resize', width, height);
    }

    protected createParticleTweenTimeline(particle: PIXI.Particle, steps: AnimationStep[], settings?: gsap.TimelineVars, variables?: Record<string, any>) {
        if (settings) {
            settings.onComplete = () => this.deleteParticle(particle);
        } else {
            settings = {
                onComplete: () => this.deleteParticle(particle)
            }
        }

        const newTimeline = gsap.timeline(settings);

        for (let i = 0; i < steps.length; i++) {
            const { to, from, position } = steps[i];

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
                    newTimeline.to(particle, toCopy, position);
                    break;
                case 'fromTo':
                    newTimeline.fromTo(particle, fromCopy, toCopy, position);
                    break;
                case 'from':
                    newTimeline.from(particle, fromCopy, position);
                    break;
            };
                
        }
    }

    protected parseTags(tweenData: TweenData, variables?: Record<string, any>) {
        const tweenDataEntires = Object.entries(tweenData);

        for(let i = 0; i < tweenDataEntires.length; i++) {
            const [key, value] = tweenDataEntires[i];

            if (typeof value === 'string') {
                // External Variable Tag
                if (value.startsWith('#') && variables) {
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

    protected addEventCalls(timeline: gsap.core.Timeline, tweenData: TweenData): TweenData {
        if(tweenData?.eventComplete) {
            tweenData.onComplete = (eventName: string) => { this.emit(eventName ?? 'eventComplete', timeline) };
            tweenData.onCompleteParams = [JSON.parse(JSON.stringify(tweenData.eventComplete))];
            delete tweenData.eventComplete;
        }

        if(tweenData?.eventInterrupt) {
            tweenData.onInterrupt = (eventName) => { this.emit(eventName ?? 'eventInterupt', timeline) };
            tweenData.onInterruptParams = [JSON.parse(JSON.stringify(tweenData.eventInterrupt))];
            delete tweenData.eventInterrupt;
        }

        if(tweenData?.eventRepeat) {
            tweenData.onRepeat = (eventName) => { this.emit(eventName ?? 'eventRepeat', timeline) };
            tweenData.onRepeatParams = [JSON.parse(JSON.stringify(tweenData.eventRepeat))];
            delete tweenData.eventRepeat;
        }

        if(tweenData?.eventReverse) {
            tweenData.onReverseComplete = (eventName) => { this.emit(eventName ?? 'eventReverse', timeline) };
            tweenData.onReverseCompleteParams = [JSON.parse(JSON.stringify(tweenData.eventRepeat))];
            delete tweenData.eventReverse;
        }

        if(tweenData?.eventStart) {
            tweenData.onStart = (eventName) => { this.emit(eventName ?? 'eventStart', timeline) };
            tweenData.onStartParams = [JSON.parse(JSON.stringify(tweenData.eventStart))];
            delete tweenData.eventStart;
        }

        if(tweenData?.eventUpdate) {
            tweenData.onUpdate = (eventName) => { this.emit(eventName ?? 'eventUpdate', timeline) };
            tweenData.onUpdateParams = [JSON.parse(JSON.stringify(tweenData.eventUpdate))];
            delete tweenData.eventUpdate;
        }

        return tweenData;
    }
}