import * as PIXI from 'pixi.js';
import * as PIXIUI from '@pixi/ui';
import { gsap } from 'gsap';
import { EE, GameScreen } from '../../../screen/game_screen';
import { AvatarDataEntry, DialogueBoxCreatorData, DialogueData, EmojiDataEntry } from '../../factory_creators/ui/dialogue_box_creator';

export type TagTimingData = { time: number, tag: string };

/**
 * Dialogue Box
 * Displays dialogue text to the screen
 * 
 * @class
 * @extends {PIXI.Container}
 */
export class DialogueBox extends PIXI.Container {
    private gameScreen = GameScreen.instance;
    protected actorData!: DialogueBoxCreatorData;
    protected gamePosition: { x: number | null, y: number | null } = { x: null, y: null};
    protected exactPosition: { x: number | null, y: number | null } = { x: null, y: null};
    public buttonInstance!: PIXIUI.Button;

    protected dialogueText!: PIXI.SplitText;
    protected nameText!: PIXI.Text;

    protected avatarPanel!: PIXIUI.Switcher;
    protected emojiPanel!: PIXIUI.Switcher;
    protected emojiContainer!: PIXI.Container;

    protected dialogueData!: DialogueData[];
    protected dialogueIndex: number = -1;
    
    protected currentDialogueCharTweens: gsap.core.Tween[] = [];

    public remoteAssetTimeout: number = 100;

    public emojiVisibleDuration: number = 1;
    public emojiAlphaChangeDuration: number = 0.5;

    public charOffset: number = 20;
    public charAlphaChangeDuration = 0.5;
    public charDelayBetweenCharacter = 0.07;

    public dialogueVisibleDuration = 2.5;

    public pauseDialogue = false;
    
    /**
     * @constructor
     * @param {PIXI.ContainerOptions} options 
     * @param {DialogueBoxCreatorData} data 
     * @param {?PIXI.Container} parent 
     */
    constructor(options: PIXI.ContainerOptions, data: DialogueBoxCreatorData, parent?: PIXI.Container) {
        super(options);

        this.actorData = data;

        this.alpha = 0;

        const { 
            x, y, xExactPos, yExactPos, 
            textPosition: textPositionData, nameTextPosition: nameTextPositionData, 
            textStyle, nameStyle, 
            avatarPosition
        } = data;

        this.gamePosition = { x: x ?? null, y: y ?? null };
        this.exactPosition = { x: xExactPos ?? null, y: yExactPos ?? null };
        
        if (parent) {
            parent.addChild(this);

            /**
             * Updates the internal position when the scene resizes
             * 
             * @listens this.position#event:scene_resize
             */
            parent.on('scene_resize', (width, height) => this.resize(width, height));
        }

        const { x: textPosX, y: textPosY } = textPositionData ?? { x: 0, y: 0 };
        const { x: namePosX, y: namePosY } = nameTextPositionData ?? { x: 0, y: 0 };
        const { x: avatarPosX, y: avatarPosY } = avatarPosition ?? { x: 0, y: 0 };

        const textPosition = { x: (textPosX ?? 0), y: (textPosY ?? 0) };
        const nameTextPosition = { x: (namePosX ?? 0), y: (namePosY ?? 0) };
        const avatarContainerPosition = { x: (avatarPosX ?? 0), y: (avatarPosY ?? 0) };

        this.dialogueText = new PIXI.SplitText({
            text: "-",
            position: textPosition,
            style: textStyle ?? {},
            zIndex: 100,
            visible: false
        });
        this.addChild(this.dialogueText);

        this.nameText = new PIXI.Text({
            text: "",
            position: nameTextPosition,
            style: nameStyle ?? {},
            zIndex: 100
        });
        this.addChild(this.nameText);

        const avatarContainer = new PIXI.Container({
            label: "Avatar Panel Container",
            position: avatarContainerPosition
        });
        this.addChild(avatarContainer);

        this.emojiContainer = new PIXI.Container({
            label: "Emoji Panel Container",
            position: avatarContainerPosition,
            alpha: 0
        });
        this.addChild(this.emojiContainer);

        this.emojiPanel = new PIXIUI.Switcher();
        this.emojiPanel.label = "Emoji Panel";
        this.emojiContainer.addChild(this.emojiPanel);

        this.avatarPanel = new PIXIUI.Switcher();
        this.avatarPanel.label = "Avatar Panel";
        avatarContainer.addChild(this.avatarPanel);

        /**
         * @listens DialogueBox#event:childAdded
         */
        this.on('childAdded', () => this.resize(this.gameScreen.gameScreenDimensions.width, this.gameScreen.gameScreenDimensions.height));
        /**
         * @listens DialogueBox#event:childRemoved
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
     * Set the Dialogue Data to display
     * 
     * @param {DialogueData[]} data - Dialogue Scene Data
     * @public
     */
    public setDialogueData(data: DialogueData[]) {
        this.dialogueData = data;
    }

    /**
     * Show the Dialogue Box
     * 
     * @public
     */
    public show() {
        gsap.to(
            this,
            {
                duration: 0.5,
                alpha: 1,
                onComplete: () => { 
                    this.setAvatarImage('');
                    this.nextDialogueStep();
                    this.nameText.text = "";
                }
            }
        );
    }

    /**
     * Hide the Dialogue Box
     * 
     * @public
     */
    public hide() {
        gsap.to(
            this,
            {
                duration: 0.5,
                alpha: 0,
                onComplete: () => {
                    this.reset();
                }
            }
        );
    }

    /**
     * Resets the Dialogue Box back to the start
     * 
     * @public
     */
    public reset() {
        this.killAllDialogueTweens();
        this.dialogueIndex = -1;
        this.dialogueText.text = "-";
        this.dialogueText.visible = false;
        this.nameText.text = "";
        this.setAvatarImage('');
    }

    /**
     * Displays the next part of the Dialogue sequence
     * 
     * @public
     * @returns {void}
     */
    public nextDialogueStep() {
        if (this.dialogueIndex >= this.dialogueData.length) {
            return;
        }
        
        this.dialogueIndex++;

        this.displayNextDialogueStep();
    }

    /**
     * Sets the data required to display the Character Avatars
     * 
     * @param {AvatarDataEntry[]} data
     * @async
     * @public
     */
    public async setAvatarData(data: AvatarDataEntry[]) {
        await this.setPanelData(this.avatarPanel, 'avatar', data);
    }

    /**
     * Sets the current Avatar to display
     * 
     * @param {string} avatarName 
     * @public
     */
    public setAvatarImage(avatarName: string) {
        const { avatarData } = this.actorData;

        if (avatarData) {
            const foundEntry = avatarData.findIndex((entry: AvatarDataEntry) => entry.name === avatarName);

            if (foundEntry !== -1) {
                this.avatarPanel.switch(foundEntry);

                const foundObject = this.avatarPanel.children[0].children[foundEntry];

                if (foundObject instanceof PIXI.DOMContainer && (foundObject as PIXI.DOMContainer).element.clientWidth === 0) {
                    foundObject.addChild(new PIXI.Sprite({
                        texture: PIXI.Assets.get(`avatar_${avatarName}`), 
                        anchor: 0.5
                    }));
                }
            } else {
                this.avatarPanel.switch(this.avatarPanel.views.length - 1);
            }
        }
    }

    /**
     * Sets the data required to display the Emoji
     * 
     * @param {EmojiDataEntry[]} data 
     * @public
     */
    public async setEmojiData(data: EmojiDataEntry[]) {
        await this.setPanelData(this.emojiPanel, 'emoji', data);
    }

    /**
     * Sets what Emoji to display
     * 
     * @param {string} emojiName 
     */
    public setEmojiImage(emojiName: string) {
        const { emojiData } = this.actorData;

        if (emojiData) {
            const foundEntry = emojiData.findIndex((entry: EmojiDataEntry) => entry.name === emojiName);

            if (foundEntry !== -1) {
                this.emojiPanel.switch(foundEntry);

                const foundObject = this.emojiPanel.children[0].children[foundEntry];

                if (foundObject instanceof PIXI.DOMContainer && (foundObject as PIXI.DOMContainer).element.clientWidth === 0) {
                    foundObject.addChild(new PIXI.Sprite({
                        texture: PIXI.Assets.get(`emoji_${emojiName}`), 
                        anchor: 0.5
                    }));
                }

                gsap.timeline()
                    .to(
                        this.emojiContainer,
                        {
                            alpha: 1,
                            duration: this.emojiAlphaChangeDuration
                        }
                    )
                    .to(
                        this.emojiContainer,
                        {
                            delay: this.emojiVisibleDuration,
                            alpha: 0,
                            duration: this.emojiAlphaChangeDuration
                        }
                    );
            } else {
                this.emojiPanel.switch(this.avatarPanel.views.length - 1);
            }
        }
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

        /**
         * Updates the internal position when the scene resizes
         * 
         * @emits DialogueBox#event:scene_resize
         */
        this.emit('scene_resize', width, height);
    }

    /**
     * Kills all current Dialogue Tweens
     * 
     * @protected
     */
    protected killAllDialogueTweens() {
        for (let i = 0; i < this.currentDialogueCharTweens.length; i++) {
            const currentDialogueCharTween = this.currentDialogueCharTweens[i];
            currentDialogueCharTween.kill();
        }

        this.currentDialogueCharTweens = [];
    }

    /**
     * Renders the next dialogue step to the Dialogue Box, setting up all the tweens
     * 
     * @returns {void}
     */
    protected displayNextDialogueStep() {
        if (this.dialogueIndex >= this.dialogueData.length || this.pauseDialogue) {
            return;
        }

        const { name, text } = this.dialogueData[this.dialogueIndex];

        this.nameText.text = "";

        let tagList: TagTimingData[] = this.recursivelyFindDialogueTags(text, []);

        this.dialogueText.text = this.recursivelyDeTag(text);
        this.dialogueText.visible = true;
        this.setAvatarImage(name);

        EE.emit('dialogue_step_start', name);

        this.currentDialogueCharTweens = [];

        for (let i = 0; i < this.dialogueText.chars.length; i++) {
            const char = this.dialogueText.chars[i];

            if (this.pauseDialogue) {
                i = this.dialogueText.chars.length;
                continue;
            }

            const filteredData = tagList.filter((tagData: TagTimingData) => tagData.time === i);
            const currentData = filteredData.pop();

            if (currentData) {
                EE.emit("dialogue_tag_fired", currentData?.tag, name);
                this.setEmojiImage(currentData.tag);
                tagList = tagList.filter((tagData: TagTimingData) => tagData.time > i);
            }

            this.currentDialogueCharTweens.push(gsap.fromTo(
                char,
                {
                    alpha: 0,
                    y: this.charOffset
                },
                {
                    delay: i * this.charDelayBetweenCharacter,
                    alpha: 1,
                    y: 0,
                    duration: this.charAlphaChangeDuration,
                    ease: 'power4.out',
                    onStart: () => {
                        this.nameText.text = name;
                        EE.emit('char_display_start', name);
                    }
                }
            ));

            if (i === this.dialogueText.chars.length - 1) {
                this.currentDialogueCharTweens.push(gsap.to(
                    this.dialogueText.chars,
                    {
                        duration: ((this.dialogueText.chars.length - 1) * this.charDelayBetweenCharacter) + this.dialogueVisibleDuration,
                        onComplete: () => {
                            EE.emit('dialogue_entry_complete', name);

                            if (this.dialogueIndex >= this.dialogueData.length) {
                                EE.emit('dialogue_complete', this);
                            }
                        }
                    }
                ));
            }
        }
    }

    /**
     * Recursively removes tags from the dialogue text
     * 
     * @protected
     * @param {string} dialogueText - Raw dialogue text 
     * @returns {string}
     */
    protected recursivelyDeTag(dialogueText: string): string {
        const foundTagStartIndex = dialogueText.indexOf('{');

        // Found a tag
        if (foundTagStartIndex !== -1) {
            const foundTagEndIndex = dialogueText.indexOf('}');
            const tagText = dialogueText.substring(foundTagStartIndex + 1, foundTagEndIndex);
            const regExpression = new RegExp(`\s?{${tagText}}\s?`);

            dialogueText = dialogueText.replace(regExpression, "");
            dialogueText = dialogueText.replace("  ", " ");

            this.recursivelyDeTag(dialogueText);
        }

        return dialogueText;
    }

    /**
     * Recursively records each tag returning a list of each one
     * 
     * @param {string} dialogueText - Raw dialogue text 
     * @param {TagTimingData[]} tagList - Returned list of tags and the index it appears on
     * @returns {TagTimingData[]}
     */
    protected recursivelyFindDialogueTags(dialogueText: string, tagList: TagTimingData[]): TagTimingData[] {
        // Because timing is based on when the Split Text's char list is animated, it's possible to have
        // spaces throw off the timing. This removes those spaces for accurate timing.
        dialogueText = dialogueText.replace(/\s/g, '');

        const foundTagStartIndex = dialogueText.indexOf('{');

        // Found a tag
        if (foundTagStartIndex !== -1) {
            const foundTagEndIndex = dialogueText.indexOf('}');
            const tagText = dialogueText.substring(foundTagStartIndex + 1, foundTagEndIndex);
            const regExpression = new RegExp(`\s?{${tagText}}\s?`);

            tagList.push({ time: foundTagStartIndex, tag: tagText });

            dialogueText = dialogueText.replace(regExpression, "");
            dialogueText = dialogueText.replace("  ", " ");

            // Found tag exceeds the bounds of the string and is corrected
            if (foundTagStartIndex >= dialogueText.length) {
                tagList[tagList.length - 1].time = dialogueText.length - 1;
            }

            this.recursivelyFindDialogueTags(dialogueText, tagList);
        }

        return tagList;
    }

    /**
     * Sets up a panel using data
     * 
     * @param {PIXIUI.Switcher} panel - Panel Switcher object 
     * @param {string} panelType - Which panel is being set up
     * @param {(AvatarDataEntry | EmojiDataEntry)[]} data - Panel data
     */
    protected async setPanelData(panel: PIXIUI.Switcher, panelType: string, data: (AvatarDataEntry | EmojiDataEntry)[]) {
        if (panelType === 'avatar') {
            this.actorData.avatarData = data as AvatarDataEntry[];
        }
        
        if (panelType === 'emoji') {
            this.actorData.emojiData = data as EmojiDataEntry[];
        }

        for (let i = 0; i < data.length; i++) {
            const {url, texture, name} = data[i];

            if (url) {
                const imageExists = await this.imageExists(url);

                if (imageExists) {
                    const element = document.createElement('img');
                    element.src = url;
                    element.alt = name;

                    const domContainer = new PIXI.DOMContainer({
                        element,
                        anchor: 0.5,
                    });

                    panel.add(domContainer);

                    continue;
                }
            }

            if (!PIXI.Assets.cache.has(`${panelType}_${name}`)) {
                await PIXI.Assets.load({ alias: `${panelType}_${name}`, src: texture})
                    .then(() => {
                        panel.add(`${panelType}_${name}`);
                    })
                    .catch(() => {
                        const defaultSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
                        panel.add(defaultSprite);
                    });
            } else {
                panel.add(`${panelType}_${name}`);
            }
        }

        // Default Sprite
        const defaultSprite = new PIXI.Sprite(PIXI.Texture.EMPTY);
        panel.add(defaultSprite);
    }

    /**
     * To cover the possibility of a hoasted screen element not being available for use, the game will double check
     * that the hosted element is actually there
     * 
     * @private
     * @param {string} url - The URL of the Hosted Image
     * @returns {HTMLImageElement | boolean}
     */
    private imageExists(url: string): Promise<HTMLImageElement | boolean> {
        return new Promise(resolve => {
            var img = document.createElement('img');
            img.addEventListener('load', () => {
                resolve(img.complete ? img: false);
            });
            img.addEventListener('error', () => resolve(false));
            img.src = url;

            setTimeout(function() {
                resolve(img.complete ? img: false);
            }, this.remoteAssetTimeout);
        });
    }
}