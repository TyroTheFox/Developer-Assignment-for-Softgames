import * as PIXI from 'pixi.js';

export type SceneContainerOptions = PIXI.ContainerOptions & {
    sceneData: any[]
}

export class Scene extends PIXI.Container {
    constructor(options: SceneContainerOptions) {
        super(options);

        for (let i = 0; i < options.sceneData.length; i++) {
            const sceneActor = options.sceneData[i];

            
        }
    }
}