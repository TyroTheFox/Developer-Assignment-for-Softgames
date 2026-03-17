import * as PIXI from "pixi.js";
import * as PIXIUI from "@pixi/ui";
import { BaseFactoryCreator } from "../../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../../actor_factory";
import { GameScreen } from "../../../screen/game_screen";
import { FancyButton } from "../../actors/ui/fancy_button";

export type FancyButtonCreatorData = PositionalActorData & {
    options: PIXIUI.ButtonOptions,
    views?: {
        default?: string | any[]
        hover?: string | any[],
        pressed?: string | any[],
        disabled?: string | any[]
    },
    text?: {
        text: string,
        style: PIXI.TextStyleOptions
    },
    hitArea?: PIXI.Rectangle
}

/**
 * Creates Fancy Button Actors
 * 
 * @class
 * @extends {BaseFactoryCreator<FancyButton>}
 */
export class FancyButtonCreator extends BaseFactoryCreator<FancyButton> {
    /**
     * Builds the Actor
     * 
     * @public
     * @param {FancyButtonCreatorData} data - Actor Data used to make the Actor
     * @param {PIXI.Container} parent - The Parent to add the Actor to
     * @returns {FancyButton}
     */
    public build(data: FancyButtonCreatorData, parent: PIXI.Container): FancyButton {
        const actorFactory = ActorFactory.instance;
        const gameScreen = GameScreen.instance;
        const { id, x, y, xExactPos, yExactPos, pivotX, pivotY, scale, visible, alpha, rotation, angle, zIndex, views, options, text, cullable } = data;

        let caluclatedX = xExactPos ? xExactPos : (x ?? 0) * gameScreen.gameScreenDimensions.width;
        let caluclatedY = yExactPos ? yExactPos : (y ?? 0) * gameScreen.gameScreenDimensions.height;

        const buttonOptions = {...options};

        if (views) {
            if (views?.default && typeof views?.default === 'string') {
                buttonOptions.defaultView = views.default as string;
            } else {
                buttonOptions.defaultView = this.constructViewContainer(views.default as any[], actorFactory);
            }

            if (views?.hover && typeof views?.hover === 'string') {
                buttonOptions.hoverView = views.hover as string;
            } else {
                buttonOptions.hoverView = this.constructViewContainer(views.hover as any[], actorFactory);
            }

            if (views?.pressed && typeof views?.pressed === 'string') {
                buttonOptions.pressedView = views.pressed as string;
            } else {
                buttonOptions.pressedView = this.constructViewContainer(views.pressed as any[], actorFactory);
            }

            if (views?.disabled && typeof views?.disabled === 'string') {
                buttonOptions.disabledView = views.disabled as string;
            } else {
                buttonOptions.disabledView = this.constructViewContainer(views.disabled as any[], actorFactory);
            }
        }

        if (text) {
            const buttonText = new PIXI.Text({
                label: id + "_text",
                text: text.text, 
                style: text.style 
            });

            buttonOptions.text = buttonText as PIXI.Text;
        }

        const fancyButton = new FancyButton(buttonOptions, data, parent);

        fancyButton.label = id ?? "fancyButton";
        fancyButton.position.set(caluclatedX, caluclatedY);
        fancyButton.scale.set(scale?.x ?? 1, scale?.y ?? 1);
        fancyButton.rotation = rotation ?? fancyButton.rotation;
        fancyButton.angle = angle ?? fancyButton.angle;
        fancyButton.zIndex = zIndex ?? 0;
        fancyButton.visible = visible ?? fancyButton.visible;
        fancyButton.alpha = alpha ?? fancyButton.alpha;
        fancyButton.cullable = cullable ?? true;
        fancyButton.pivot = { x: pivotX ?? 0, y: pivotY ?? 0 };

        if (data.hitArea) {
            const shape = new PIXI.Rectangle(
                data.hitArea.x,
                data.hitArea.y,
                data.hitArea.width,
                data.hitArea.height
            );
            fancyButton.hitArea = shape;
        } else {
            fancyButton.calculateHitArea();
        }

        return fancyButton;
    }

    /**
     * Creates a View Container that the Button Switches to
     * 
     * @param {any[]} viewData 
     * @param {ActorFactory} actorFactory 
     * @returns {PIXI.Container}
     */
    private constructViewContainer(viewData: any[], actorFactory: ActorFactory): PIXI.Container {
        const container = new PIXI.Container();

        for (let i = 0; i < viewData.length; i++) {
            const sceneDataEntry = viewData[i];
            
            actorFactory.buildActor(sceneDataEntry, container);
        }

        return container;
    }
}