import { ForbiddenLandsCharacterSheet } from "../../../systems/forbidden-lands/script/sheet/character.js";
import { InfoDialog } from "./dialog/info-dialog.js";

export class Helpers {
    static getCharacterDiceRoller(character) {        
        if ((!character || !character.apps) && game.user.character === null) return;

        let charSheet;
        for (let key in game.user.character.apps) {
            if (game.user.character.apps[key] instanceof ForbiddenLandsCharacterSheet) {
                charSheet = game.user.character.apps[key];
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