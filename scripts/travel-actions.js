
import { RollDialog } from "../../../systems/forbidden-lands/script/dialog/roll-dialog.js";
import { InfoDialog } from "./dialog/info-dialog.js";
import { CharacterPickerDialog } from "./dialog/character-picker-dialog.js";
import { Helpers } from "./helpers.js";

/**
 * Roll skill check to perform a travel action
 * 
 * @param  {string}   rollName    Display name for the roll
 * @param  {string}   skillName   Unlocalized label
 * @param  {Function} onAfterRoll Callback that will be executed after roll is made
 */
function doRollTravelAction(character, rollName, skillName, onAfterRoll) {
    if (!character && game.user.character === null) return;

    character = character || game.user.character;
    const diceRoller = Helpers.getCharacterDiceRoller(character);
    if (diceRoller === null) return;

    const data = character.data.data;
    const skill = data.skill[skillName];

    RollDialog.prepareRollDialog(
        game.i18n.localize(rollName), 
        { name: game.i18n.localize(data.attribute[skill.attribute].label), value: data.attribute[skill.attribute].value},
        { name: game.i18n.localize(skill.label), value: skill.value}, 
        0, 
        "", 
        0, 
        0,
        diceRoller,
        onAfterRoll
    );
}

/**
 * Roll skill check to perform a travel action
 * 
 * @param  {Array}   assignedPartyMemberIds 
 * @param  {string}   rollName             Display name for the roll
 * @param  {string}   skillName            Unlocalized label
 * @param  {Function} onAfterRoll          Callback that will be executed after roll is made
 */
function rollTravelAction(assignedPartyMemberIds, rollName, skillName, onAfterRoll) {
    assignedPartyMemberIds = typeof assignedPartyMemberIds !== 'object' && assignedPartyMemberIds !== '' ? [assignedPartyMemberIds] : assignedPartyMemberIds;
    let assignedPartyMembers = [];
    for (let i = 0; i < assignedPartyMemberIds.length; i++) {
        assignedPartyMembers.push(game.actors.get(assignedPartyMemberIds[i]));
    }
    assignedPartyMembers = assignedPartyMembers.filter((partyMember) => partyMember.owner);

    if (assignedPartyMembers.length === 1) {
        doRollTravelAction(assignedPartyMembers[0], rollName, skillName, onAfterRoll);
    } else if (assignedPartyMembers.length > 1) {
        CharacterPickerDialog.show(
            game.i18n.localize(rollName) + " | Who Rolls?", 
            assignedPartyMembers, 
            function (entityId) {
                doRollTravelAction(game.actors.get(entityId), rollName, skillName, onAfterRoll);
            }
        );
    }
}

export let TravelActionsConfig = {
    hike: {
        key: "hike",
        journalEntryName: "Hike",
        name: "FLPS.TRAVEL.HIKE",
        buttons: [
            {
                name: "FLPS.TRAVEL_ROLL.FORCED_MARCH",
                class: "travel-forced-march",
                handler: function (party, event) {
                    rollTravelAction(party.actor.data.flags.travel.hike, "FLPS.TRAVEL_ROLL.FORCED_MARCH", 'endurance');
                },
            },
            {
                name: "FLPS.TRAVEL_ROLL.HIKE_IN_DARKNESS",
                class: "travel-hike-in-darkness",
                handler: function (party, event) {
                    rollTravelAction(party.actor.data.flags.travel.hike, "FLPS.TRAVEL_ROLL.HIKE_IN_DARKNESS", 'scouting');
                },
            },
        ],
    },
    lead: {
        key: "lead",
        journalEntryName: "Lead the Way",
        name: "FLPS.TRAVEL.LEAD",
        buttons: [
            {
                name: "FLPS.TRAVEL_ROLL.NAVIGATE",
                class: "travel-navigate",
                handler: function (party, event) {
                    rollTravelAction(party.actor.data.flags.travel.lead, "FLPS.TRAVEL_ROLL.NAVIGATE", 'survival');
                },
            },
        ],
    },
    watch: {
        key: "watch",
        journalEntryName: "Keep Watch",
        name: "FLPS.TRAVEL.WATCH",
        buttons: [
            {
                name: "FLPS.TRAVEL_ROLL.KEEP_WATCH",
                class: "travel-keep-watch",
                handler: function (party, event) {
                    rollTravelAction(party.actor.data.flags.travel.watch, "FLPS.TRAVEL_ROLL.KEEP_WATCH", 'scouting');
                },
            },
        ],
    },
    rest: {
        key: "rest",
        journalEntryName: "Rest",
        name: "FLPS.TRAVEL.REST",
        buttons: [],
    },
    sleep: {
        key: "sleep",
        journalEntryName: "Sleep",
        name: "FLPS.TRAVEL.SLEEP",
        buttons: [],
    },
    forage: {
        key: "forage",
        journalEntryName: "Forage",
        name: "FLPS.TRAVEL.FORAGE",
        buttons: [
            {
                name: "FLPS.TRAVEL_ROLL.FIND_FOOD",
                class: "travel-find-food",
                handler: function (party, event) {
                    rollTravelAction(party.actor.data.flags.travel.forage, "FLPS.TRAVEL_ROLL.FIND_FOOD", 'survival');
                },
            },
        ],
    },
    hunt: {
        key: "hunt",
        journalEntryName: "Hunt",
        name: "FLPS.TRAVEL.HUNT",
        buttons: [
            {
                name: "FLPS.TRAVEL_ROLL.FIND_PREY",
                class: "travel-find-prey",
                handler: function (party, event) {
                    rollTravelAction(
                        party.actor.data.flags.travel.hunt,
                        "FLPS.TRAVEL_ROLL.FIND_PREY", 
                        'survival',
                        function (diceRoller) { // onAfterRoll
                            const isSuccess = diceRoller.countSword() > 0;
                            if (isSuccess) {
                                let rolltable = game.tables.getName('Find a Prey');
                                if (rolltable) {
                                    rolltable.draw();
                                } else {
                                    let chatData = {
                                        user: game.user._id,
                                        content: "You've spotted a prey!<br><i>Create a roll table named 'Find a Prey' to automatically find out what creature have you spotted.<i>"
                                    };
                                    ChatMessage.create(chatData, {});
                                }
                            }
                        }
                    );
                },
            },
            {
                name: "FLPS.TRAVEL_ROLL.KILL_PREY",
                class: "travel-kill-prey",
                handler: function (party, event) {
                    // handleGM(party.actor.data.flags.travel.hunt, 'FLPS.TRAVEL.HUNT', 'FLPS.TRAVEL_ROLL.KILL_PREY');

                    if (game.user.character === null) return;

                    const data = game.user.character.data.data;
                    const skill = data.skill.marksmanship;
                    RollDialog.prepareRollDialog(
                        game.i18n.localize("FLPS.TRAVEL_ROLL.KILL_PREY"), 
                        data.attribute[skill.attribute].value,
                        skill.value, 
                        0, 
                        "", 
                        0, 
                        0
                    );
                },
            },
        ],},
    fish: {
        key: "fish",
        journalEntryName: "Fish",
        name: "FLPS.TRAVEL.FISH",
        buttons: [
            {
                name: "FLPS.TRAVEL_ROLL.CATCH_FISH",
                class: "travel-catch-fish",
                handler: function (party, event) {
                    rollTravelAction(party.actor.data.flags.travel.fish, "FLPS.TRAVEL_ROLL.CATCH_FISH", 'survival');
                },
            },
        ],
    },
    camp: {
        key: "camp",
        journalEntryName: "Make Camp",
        name: "FLPS.TRAVEL.CAMP",
        buttons: [
            {
                name: "FLPS.TRAVEL_ROLL.MAKE_CAMP",
                class: "travel-make-camp",
                handler: function (party, event) {
                    rollTravelAction(party.actor.data.flags.travel.camp, "FLPS.TRAVEL_ROLL.MAKE_CAMP", 'survival');
                },
            },
        ],
    },
    other: {
        key: "other",
        journalEntryName: "",
        name: "FLPS.TRAVEL.OTHER",
        buttons: [],
    },
};