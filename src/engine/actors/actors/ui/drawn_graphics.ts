import * as PIXI from "pixi.js";
import { GameScreen } from "../../../screen/game_screen";
import { DrawnGraphicsCreatorData } from "../../factory_creators/ui/drawn_graphics_creator";

/**
 * Drawn Graphics
 * Draws Primatives (or 'Shapes') to the Screen
 * 
 * @class
 * @extends {PIXI.Container}
 */
export class DrawnGraphics extends PIXI.Container {
    private gameScreen = GameScreen.instance;
    protected actorData!: DrawnGraphicsCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};

    public graphicsInstance: PIXI.Graphics = new PIXI.Graphics();

    // Draw Step Functions
    // Contains all the means of drawing to the screen
    protected drawStepFunctions: Record<string, Function> = {
        chamferRect: (graphics: PIXI.Graphics, data: any) => { graphics.chamferRect(data.x, data.y, data.width, data.height, data.chamfter, data?.transform); },
        circle: (graphics: PIXI.Graphics, data: any) => { graphics.circle(data.x, data.y, data.radius); },
        ellipse: (graphics: PIXI.Graphics, data: any) => { graphics.ellipse(data.x, data.y, data.radiusX, data.radiusY); },
        filletRect: (graphics: PIXI.Graphics, data: any) => { graphics.filletRect(data.x, data.y, data.width, data.height, data.fillet); },
        poly: (graphics: PIXI.Graphics, data: any) => { graphics.poly(data.points, data?.close); },
        rect: (graphics: PIXI.Graphics, data: any) => { graphics.rect(data.x, data.y, data.width, data.height); },
        regularPoly: (graphics: PIXI.Graphics, data: any) => { graphics.regularPoly(data.x, data.y, data.radius, data.sides, data?.rotation, data?.transform); },
        roundPoly: (graphics: PIXI.Graphics, data: any) => { graphics.roundPoly(data.x, data.y, data.radius, data.sides, data.corner, data?.rotation); },
        roundShape: (graphics: PIXI.Graphics, data: any) => { graphics.roundShape(data.points, data.radius, data?.useQuadratic, data?.smoothness); },
        star: (graphics: PIXI.Graphics, data: any) => { graphics.star(data.x, data.y, data.points, data.radius, data?.innerRadius, data?.rotation); },
        fill: (graphics: PIXI.Graphics, data: any) => { graphics.fill(data?.style); },
        stroke: (graphics: PIXI.Graphics, data: any) => { graphics.stroke(data?.style); },
        cut: (graphics: PIXI.Graphics, _data: any) => { graphics.cut(); }
    };
    
    /**
     * @constructor
     * @param {PIXI.ContainerOptions} options 
     * @param {DrawnGraphicsCreatorData} data 
     * @param {?PIXI.Container} parent 
     */
    constructor(options: PIXI.ContainerOptions, data: DrawnGraphicsCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            /**
             * Updates the internal position when the scene resizes
             * 
             * @listens this.position#event:scene_resize
             */
            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

        this.addChild(this.graphicsInstance);

        for (let i = 0; i < data.drawSteps.length; i++) {
            const drawStep = data.drawSteps[i];

            if (this.drawStepFunctions[drawStep.functionName]) {
                this.drawStepFunctions[drawStep.functionName](this.graphicsInstance, drawStep.data);
            } else {
                console.error(`Function ${drawStep.functionName} doesn't exist`)
            }
        }
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
     * Adds a step of the shape being drawn
     * Each step could be either a new shape or vector to add or could be a new setting
     * element like the fill colour or stroke size
     * 
     * These mirror how PIXI.Graphics works
     * 
     * @param functionName - Name of the function to Draw With
     * @param data - Data to feed into the function
     * @returns {DrawnGraphics} - Returned for function chains
     */
    public useDrawFunction(functionName: string, data: any): DrawnGraphics {
        if (this.drawStepFunctions[functionName]) {
            this.drawStepFunctions[functionName](data);
        } else {
            console.error(`Function ${functionName} doesn't exist`)
        }

        return this;
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
    }
}