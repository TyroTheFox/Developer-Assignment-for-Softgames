import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GameScreen } from '../../../screen/game_screen';
import { ParticleContainerCreatorData, ParticleData } from '../../factory_creators/container/particle_container_creator';

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
            const { id, options } = this.particleData[i];

            this.particleTimings[id] = 0;

            if (PIXI.Cache.has(options.texture)) {
                options.texture = PIXI.Cache.get(options.texture);
            }
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
        console.log(this.particleChildren.length);

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

                this.spawnParticle(options);
            }
        }
    }

    public spawnParticle(options: PIXI.ParticleOptions): PIXI.Particle {
        const particle = new PIXI.Particle(options);
        particle.rotation = (90 * Math.PI) / 180;

        this.addParticle(particle);
        this.particleList.push(particle);

        gsap.timeline({
            onComplete: () => this.deleteParticle(particle)
        })
        .to(
            particle,
            {
                duration: 0.1,
                x: 10,
                scaleX: 0.75,
                scaleY: 0.75,
                tint: 'red'
            }
        )
        .to(
            particle,
            {
                duration: 0.6,
                x: 300,
                y: gsap.utils.random(-75, 75),
                scaleX: 1.25,
                scaleY: 1.25,
                tint: 'yellow',
            }
        )
        .to(
            particle,
            {
                duration: 0.5,
                x: 350,
                y: gsap.utils.random(-100, 100),
                scaleX: 1.5,
                scaleY: 1.5,
                alpha: 0,
                ease: 'sine.out'
            }
        );

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
}