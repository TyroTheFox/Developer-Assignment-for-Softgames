import * as PIXI from "pixi.js";
import { GameScreen } from "../../../screen/game_screen";
import { DrawnGraphicsCreatorData } from "../../factory_creators/ui/drawn_graphics_creator";

export class DrawnGraphics extends PIXI.Container {
    private gameScreen = GameScreen.instance;
    protected actorData!: DrawnGraphicsCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};

    public graphicsInstance: PIXI.Graphics = new PIXI.Graphics();

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
    
    constructor(options: PIXI.ContainerOptions, data: DrawnGraphicsCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.gamePosition = { x: data?.x ?? null, y: data?.y ?? null };
        this.exactPosition = { x: data?.xExactPos ?? null, y: data?.yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

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

    public useDrawFunction(functionName: string, data: any) {
        if (this.drawStepFunctions[functionName]) {
            this.drawStepFunctions[functionName](data);
        } else {
            console.error(`Function ${functionName} doesn't exist`)
        }
    }

    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : width * (this.gamePosition.x ?? 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : height * (this.gamePosition.y ?? 0);

        this.x = caluclatedX;
        this.y = caluclatedY;
    }
}