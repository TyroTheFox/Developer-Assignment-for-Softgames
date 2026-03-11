import { DialogueBox } from "../../engine/actors/actors/dialogue_box";
import { Scene } from "../../engine/actors/actors/scene/scene";

import dialogueExampleData from '../../data/dialogue/dialogue_example.json' assert {type: 'json'};
import { EE } from "../../engine/screen/game_screen";

export class DialogueExampleUI extends Scene {
    protected dialogueBox!: DialogueBox;

    public override async init(): Promise<void> {
        const {dialogue} = dialogueExampleData;

        this.dialogueBox = this.getChildByLabel('dialogueBox') as DialogueBox;

        this.dialogueBox.setDialogueData(dialogue);

        this.dialogueBox.nextDialogueStep();

        EE.on('dialogue_entry_complete', () => {
            this.dialogueBox.nextDialogueStep();
        });
    }
}