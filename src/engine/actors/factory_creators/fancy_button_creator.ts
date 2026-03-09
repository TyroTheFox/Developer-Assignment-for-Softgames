import * as PIXI from "pixi.js";
import * as PIXIUI from "@pixi/ui";
import { BaseFactoryCreator } from "../base_factory_creator";
import { ActorFactory, PositionalActorData } from "../actor_factory";
import { FancyButton } from "../actors/fancy_button";

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
    }
}

export class FancyButtonCreator extends BaseFactoryCreator<FancyButton> {
    public build(data: FancyButtonCreatorData, parent: PIXI.Container): FancyButton {
        const actorFactory = ActorFactory.instance;

        const { id, x, y, xExactPos, yExactPos, scale, visible, alpha, rotation, angle, zIndex, views, options, text, cullable } = data;

        let caluclatedX = xExactPos ? xExactPos : (x || 0) * parent.width;
        let caluclatedY = yExactPos ? yExactPos : (y || 0) * parent.height;

        options.defaultView = views && views?.default && views?.default instanceof String ? this.constructViewContainer(views.default as any[], actorFactory) : undefined;
        options.hoverView = views && views?.hover && views?.hover instanceof String ? this.constructViewContainer(views.hover as any[], actorFactory) : undefined;
        options.pressedView = views && views?.pressed && views?.pressed instanceof String ? this.constructViewContainer(views.pressed as any[], actorFactory) : undefined;
        options.disabledView = views && views?.disabled && views?.disabled instanceof String ? this.constructViewContainer(views.disabled as any[], actorFactory) : undefined;

        if (text) {
            const buttonText = new PIXI.Text({
                label: id + "_text",
                text: text.text, 
                style: text.style 
            });

            options.text = buttonText as PIXI.Text;
        }

        const fancyButton = new FancyButton(options, data, parent);

        fancyButton.label = id || "fancyButton";
        fancyButton.position.set(caluclatedX, caluclatedY);
        fancyButton.scale.set(scale?.x || 1, scale?.y || 1);
        fancyButton.rotation = rotation || fancyButton.rotation;
        fancyButton.angle = angle || fancyButton.angle;
        fancyButton.zIndex = zIndex || 0;
        fancyButton.visible = visible || fancyButton.visible;
        fancyButton.alpha = alpha || fancyButton.alpha;
        fancyButton.cullable = cullable || true;

        return fancyButton;
    }

    private constructViewContainer(viewData: any[], actorFactory: ActorFactory) {
        const container = new PIXI.Container();

        for (let i = 0; i < viewData.length; i++) {
            const sceneDataEntry = viewData[i];
            
            actorFactory.buildActor(sceneDataEntry, container);
        }

        return container;
    }
}