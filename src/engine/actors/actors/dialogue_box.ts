import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';;
import { gsap } from 'gsap';
import { EE, GameScreen } from '../../screen/game_screen';
import { Button } from '@pixi/ui';
import { AvatarDataEntry, DialogueBoxCreatorData, DialogueData, EmojiDataEntry } from '../factory_creators/dialogue_box_creator';

export type TagTimingData = { time: number, tag: string };

export class DialogueBox extends PIXI.Container {
    private gameScreen = GameScreen.instance;
    protected actorData!: DialogueBoxCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    public buttonInstance!: Button;

    protected dialogueText!: PIXI.SplitText;
    protected nameText!: PIXI.Text;
    protected avatarPanel!: PIXIUI.Switcher;
    protected emojiPanel!: PIXIUI.Switcher;

    protected dialogueData!: DialogueData[];
    protected dialogueIndex: number = -1;
    
    constructor(options: PIXI.ContainerOptions, data: DialogueBoxCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        const { x, y, xExactPos, yExactPos, textPosition: textPositionData, nameTextPosition: nameTextPositionData, textStyle, nameStyle, avatarPosition} = data;

        this.gamePosition = { x: x || null, y: y || null };
        this.exactPosition = { x: xExactPos || null, y: yExactPos || null };
        
        if (parent) {
            parent.addChild(this);

            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

        const { x: textPosX, y: textPosY } = textPositionData || { x: 0, y: 0 };
        const { x: namePosX, y: namePosY } = nameTextPositionData || { x: 0, y: 0 };
        const { x: avatarPosX, y: avatarPosY } = avatarPosition || { x: 0, y: 0 };

        const textPosition = { x: (textPosX || 0), y: (textPosY || 0) };
        const nameTextPosition = { x: (namePosX || 0), y: (namePosY || 0) };

        this.dialogueText = new PIXI.SplitText({
            text: "-",
            position: textPosition,
            style: textStyle || {},
            zIndex: 100
        });
        this.addChild(this.dialogueText);

        this.nameText = new PIXI.Text({
            text: "-",
            position: nameTextPosition,
            style: nameStyle || {},
            zIndex: 100
        });
        this.addChild(this.nameText);

        this.avatarPanel = new PIXIUI.Switcher();
        this.addChild(this.avatarPanel);
        this.avatarPanel.position.set(avatarPosX, avatarPosY);

        this.emojiPanel = new PIXIUI.Switcher();
        this.addChild(this.emojiPanel);
        this.emojiPanel.position.set(avatarPosX, avatarPosY);
        this.emojiPanel.alpha = 0;

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

    public setDialogueData(data: DialogueData[]) {
        this.dialogueData = data;
    }

    public nextDialogueStep() {
        if (this.dialogueIndex >= this.dialogueData.length) {
            return;
        }
        
        this.dialogueIndex++;

        this.displayNextDialogueStep();
    }

    public async setAvatarData(data: AvatarDataEntry[]) {
        for (let i = 0; i < data.length; i++) {
            const {url, texture, name} = data[i];

            if (url) {
                const imageExists = this.imageExists(url);

                if (imageExists) {
                    const element = document.createElement('img');
                    element.src = url;
                    element.alt = name;

                    const domContainer = new PIXI.DOMContainer({
                        element,
                        anchor: 0.5,
                    });

                    this.avatarPanel.add(domContainer);
                }
            }

            if (!PIXI.Assets.cache.has(`avatar_${name}`)) {
                await PIXI.Assets.load({ alias: `avatar_${name}`, src: texture})
                    .then(() => {
                        this.avatarPanel.add(`avatar_${name}`);
                    })
                    .catch(() => {
                        const defaultSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
                        this.avatarPanel.add(defaultSprite);
                    });
            }
        }

        this.actorData.avatarData = data;
    }

    public setAvatarImage(avatarName: string) {
        const { avatarData } = this.actorData;

        if (avatarData) {
            const foundEntry = avatarData.findIndex((entry: AvatarDataEntry) => entry.name === avatarName);

            if (foundEntry !== -1) {
                this.avatarPanel.switch(foundEntry);
            }
        }
    }

    public async setEmojiData(data: EmojiDataEntry[]) {
        for (let i = 0; i < data.length; i++) {
            const {url, texture, name} = data[i];

            if (url) {
                const imageExists = this.imageExists(url);

                if (imageExists) {
                    const domContainer = new PIXI.DOMContainer({
                        element: imageExists as HTMLImageElement,
                        anchor: 0.5,
                    });

                    this.emojiPanel.add(domContainer);
                }
            }

            if (!PIXI.Assets.cache.has(`emoji_${name}`)) {
                await PIXI.Assets.load({ alias: `emoji_${name}`, src: texture})
                    .then(() => {
                        this.emojiPanel.add(`emoji_${name}`);
                    })
                    .catch(() => {
                        const defaultSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
                        this.emojiPanel.add(defaultSprite);
                    });
            }
        }

        this.actorData.emojiData = data;
    }

    public setEmojiImage(emojiName: string) {
        const { emojiData } = this.actorData;

        if (emojiData) {
            const foundEntry = emojiData.findIndex((entry: EmojiDataEntry) => entry.name === emojiName);

            if (foundEntry !== -1) {
                this.emojiPanel.switch(foundEntry);

                gsap.timeline()
                    .to(
                        this.emojiPanel,
                        {
                            alpha: 1
                        }
                    )
                    .to(
                        this.emojiPanel,
                        {
                            delay: 0.3,
                            alpha: 0
                        }
                    );
            }
        }
    }

    public resize(width: number, height: number) {
        let caluclatedX = this.exactPosition.x ? this.exactPosition.x : width * (this.gamePosition.x || 0);
        let caluclatedY = this.exactPosition.y ? this.exactPosition.y : height * (this.gamePosition.y || 0);

        this.x = caluclatedX;
        this.y = caluclatedY;

        this.emit('scene_resize', width, height);
    }

    protected displayNextDialogueStep() {
        if (this.dialogueIndex >= this.dialogueData.length) {
            return;
        }

        const { name, text } = this.dialogueData[this.dialogueIndex];

        this.nameText.text = "";

        let tagList: TagTimingData[] = this.recursivelyFindDialogueTags(text, []);

        this.dialogueText.text = this.recursivelyDeTag(text);
        this.setAvatarImage(name);

        this.dialogueText.chars.forEach((char, i) => {
            const filteredData = tagList.filter((tagData: TagTimingData) => tagData.time <= i);

            if (filteredData.length > 0) {
                const currentData = filteredData.pop();
                EE.emit("dialogue_tag_fired", currentData?.tag);
                tagList = tagList.filter((tagData: TagTimingData) => tagData.time > i);
            }

            gsap.fromTo(
                char,
                {
                    alpha: 0
                },
                {
                    delay: i * 0.07,
                    alpha: 1,
                    duration: 0.5,
                    ease: 'power4.out',
                    onStart: () => {
                        this.nameText.text = name;
                    }
                }
            );

            if (i === this.dialogueText.chars.length - 1) {
                gsap.to(
                    this.dialogueText.chars,
                    {
                        duration: ((this.dialogueText.chars.length - 1) * 0.07) + 2.5,
                        onComplete: () => {
                            EE.emit('dialogue_entry_complete');
                        }
                    }
                );
            }
        });
    }

    protected recursivelyDeTag(dialogueText: string): string {
        const foundTagStartIndex = dialogueText.indexOf('{');

        // Found a tag
        if (foundTagStartIndex !== -1) {
            const foundTagEndIndex = dialogueText.indexOf('}');
            const tagText = dialogueText.substring(foundTagStartIndex + 1, foundTagEndIndex);

            dialogueText = dialogueText.replace(` {${tagText}}`, "");
            dialogueText = dialogueText.replace(`{${tagText}}`, "");

            this.recursivelyDeTag(dialogueText);
        }

        return dialogueText;
    }

    protected recursivelyFindDialogueTags(dialogueText: string, tagList: TagTimingData[]): TagTimingData[] {
        const foundTagStartIndex = dialogueText.indexOf('{');

        // Found a tag
        if (foundTagStartIndex !== -1) {
            const foundTagEndIndex = dialogueText.indexOf('}');
            const tagText = dialogueText.substring(foundTagStartIndex + 1, foundTagEndIndex);

            tagList.push({ time: foundTagStartIndex, tag: tagText });

            dialogueText = dialogueText.replace(` {${tagText}}`, "");
            dialogueText = dialogueText.replace(`{${tagText}}`, "");

            this.recursivelyFindDialogueTags(dialogueText, tagList);
        }

        return tagList;
    }

    /**
     * To cover the possibility of a hoasted screen element not being available for use, the game will double check
     * that the hosted element is actually there
     * 
     * @param {string} url - The URL of the Hosted Image
     * @returns {HTMLImageElement | boolean}
     */
    private imageExists(url: string): HTMLImageElement | boolean {
        var image = new Image();

        image.src = url;

        if (!image.complete) {
            return false;
        }
        else if (image.height === 0) {
            return false;
        }

        return image;
    }
}