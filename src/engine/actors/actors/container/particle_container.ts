import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GameScreen } from '../../../screen/game_screen';
import { ParticleContainerCreatorData, ParticleData } from '../../factory_creators/container/particle_container_creator';
import { AnimationDataEntry, AnimationStep, TweenData } from '../animation/puppeteer';

/**
 * Particle Container
 * A cobbled together version of the PIXI.Particle Container, which I learned during
 * the development of this application is currently a WIP. So, I did need to figure out
 * not only how to use it but also what's actually functioning. 
 * 
 * It does appear to do what it sets out to do: be a more performant means of adding 
 * textured sprites to the screen so you can use loads of them, mainly by shoving 
 * calculations to the GPU as much as possible.
 * 
 * This version of the Container wraps it up and manages it so it will work as I
 * would expect it to, effectively being a replacement for the older PIXI Particle
 * Emitter libraries I though this would be an easy replacement for.
 * 
 * Thankfully, hooking it up to GSAP has helped to make the emitter function somewhat
 * cohrently and would even be possible to add 2D physics at a later point. This was
 * done because Particles don't have any inherrent properties other than basic things
 * like position or scale. They don't have anything expected like 'lifetime' or 'acceleration'
 * so I've had to sort of fake it using GSAP tweens. It was the main way to handle it
 * within a reasonable time once I understood the magnatude of my error.
 * 
 * For now, it does what I need it to do.
 * 
 * @class
 * @extends {PIXI.ParticleContainer}
 */
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
    
    /**
     * @constructor
     * @param {PIXI.ParticleContainerOptions} options 
     * @param {ParticleContainerCreatorData} data 
     * @param {?PIXI.Container} parent 
     */
    constructor(options: PIXI.ParticleContainerOptions, data: ParticleContainerCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            /**
             * Updates the internal position when the scene resizes
             * 
             * @listens this.parent#event:scene_resize
             */
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

        /**
         * @listens ParticleContainer#event:childAdded
         */
        this.on('childAdded', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
        /**
         * @listens ParticleContainer#event:childRemoved
         */
        this.on('childRemoved', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
    }

    /**
     * Position of X as a percentage of the Screen
     * 
     * @set
     * @param {number} coord
     */
    public set gameX(coord: number) {
        this.gamePosition.x = coord;
        this.x = this.gameScreen.gameScreenDimensions.width * this.gamePosition.x;
    }

    /**
     * Position of Y as a percentage of the Screen
     * 
     * @set
     * @param {number} coord
     */
    public set gameY(coord: number) {
        this.gamePosition.y = coord;
        this.y = this.gameScreen.gameScreenDimensions.height * this.gamePosition.y;
    }

    /**
     * Relative Pivot X Position of the Object
     * 
     * @set
     * @param {number} coord
     */
    public set pivotX(coord: number) {
        this.pivot.x = coord;
    }

    /**
     * Relative Pivot Y Position of the Object
     * 
     * @set
     * @param {number} coord
     */
    public set pivotY(coord: number) {
        this.pivot.y = coord;
    }

    /**
     * Updates the container, performing checks for how many particles are currently
     * in the container and whether to spawn any more. Or delete old ones;
     * 
     * @param {PIXI.Ticker} time - PIXI Ticker instance 
     * @returns {void}
     */
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

    /**
     * Spawns a Particle and hooks it up to a tween
     * 
     * @param {PIXI.ParticleOptions} options - Data to apply to the Particle
     * @param {AnimationDataEntry} particleTweenAnimation - Tween animation step data (Similar to a Puppeteer step)
     * @returns {PIXI.Particle}
     */
    public spawnParticle(options: PIXI.ParticleOptions, particleTweenAnimation: AnimationDataEntry): PIXI.Particle {
        const { settings, steps } = particleTweenAnimation;
        const particle = new PIXI.Particle(options);
        particle.rotation = (90 * Math.PI) / 180;

        this.addParticle(particle);
        this.particleList.push(particle);

        this.createParticleTweenTimeline(particle, steps, settings);

        return particle;
    }

    /**
     * Deletes a Particle from the Container, killing it's tween
     * 
     * @param {PIXI.Particle} particle - Particle to axe
     */
    public deleteParticle(particle: PIXI.Particle) {
        gsap.killTweensOf(particle);
        this.removeParticle(particle);
        this.particleList.splice(this.particleList.indexOf(particle));
    }

    /**
     * Repositions the Actor
     * 
     * @param {number} width 
     * @param {number} height 
     */
    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : width * (this.gamePosition.x ?? 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : height * (this.gamePosition.y ?? 0);

        this.x = caluclatedX;
        this.y = caluclatedY;

        this.emit('scene_resize', width, height);
    }

    /**
     * Create a Tween Timeline object for the given Particle to govern it's actions during the loop of the emitter
     * 
     * @public
     * @param {PIXI.Particle} particle - The given particle to animate
     * @param {AnimationStep[]} steps - Each animation step a particle can undertake 
     * @param {?gsap.TimelineVars} settings - Variables specifically for the Timeline object itself
     * @param {Record<string, any>} variables - Additional variables that can be fed in and referenced in the Step data for consistency
     */
    public createParticleTweenTimeline(particle: PIXI.Particle, steps: AnimationStep[], settings?: gsap.TimelineVars, variables?: Record<string, any>) {
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
            tweenData.onComplete = (eventName: string) => { 
                /** @listens ParticleContainer#event:eventComplete */
                this.emit(eventName ?? 'eventComplete', timeline) 
            };
            tweenData.onCompleteParams = [JSON.parse(JSON.stringify(tweenData.eventComplete))];
            delete tweenData.eventComplete;
        }

        if(tweenData?.eventInterrupt) {
            tweenData.onInterrupt = (eventName) => { 
                /** @listens ParticleContainer#event:eventInterupt */
                this.emit(eventName ?? 'eventInterupt', timeline);
            };
            tweenData.onInterruptParams = [JSON.parse(JSON.stringify(tweenData.eventInterrupt))];
            delete tweenData.eventInterrupt;
        }

        if(tweenData?.eventRepeat) {
            tweenData.onRepeat = (eventName) => { 
                /** @listens ParticleContainer#event:eventRepeat */
                this.emit(eventName ?? 'eventRepeat', timeline);
            };
            tweenData.onRepeatParams = [JSON.parse(JSON.stringify(tweenData.eventRepeat))];
            delete tweenData.eventRepeat;
        }

        if(tweenData?.eventReverse) {
            tweenData.onReverseComplete = (eventName) => {
                /** @listens ParticleContainer#event:eventReverse */
                this.emit(eventName ?? 'eventReverse', timeline);
            };
            tweenData.onReverseCompleteParams = [JSON.parse(JSON.stringify(tweenData.eventRepeat))];
            delete tweenData.eventReverse;
        }

        if(tweenData?.eventStart) {
            tweenData.onStart = (eventName) => {
                /** @listens ParticleContainer#event:eventStart */
                this.emit(eventName ?? 'eventStart', timeline);
            };
            tweenData.onStartParams = [JSON.parse(JSON.stringify(tweenData.eventStart))];
            delete tweenData.eventStart;
        }

        if(tweenData?.eventUpdate) {
            tweenData.onUpdate = (eventName) => {
                /** @listens ParticleContainer#event:eventUpdate */
                this.emit(eventName ?? 'eventUpdate', timeline);
            };
            tweenData.onUpdateParams = [JSON.parse(JSON.stringify(tweenData.eventUpdate))];
            delete tweenData.eventUpdate;
        }

        return tweenData;
    }
}