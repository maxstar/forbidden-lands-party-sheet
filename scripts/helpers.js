import { ForbiddenLandsCharacterSheet } from "../../../systems/forbidden-lands/script/sheet/character.js";
import { InfoDialog } from "./dialog/info-dialog.js";

export class Helpers {
    static getCharacterDiceRoller(character) {
        character = character instanceof Actor ? character : game.user.character;
        if (!character) return;

        let charSheet;
        for (let key in character.apps) {
            if (character.apps[key] instanceof ForbiddenLandsCharacterSheet) {
                charSheet = character.apps[key];
                break;
            }
        }
        if (!charSheet) {
            InfoDialog.show('Attention', 'Please open your character sheet at least once before making travel rolls.');
            return null;
        }

        return charSheet.diceRoller;
    }
}