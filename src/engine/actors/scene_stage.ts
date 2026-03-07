import { Scene } from "./actors/scene";

export class SceneStage {
    /**
     * @type {State} A reference to the current state of the Context.
     */
    private scene!: Scene;

    constructor(state: Scene) {
        this.transitionTo(state);
    }

    /**
     * The Context allows changing the State object at runtime.
     */
    public transitionTo(state: Scene): void {
        console.log(`Context: Transition to ${(<any>state).constructor.name}.`);
        this.scene = state;
        this.scene.setStage(this);
    }
}