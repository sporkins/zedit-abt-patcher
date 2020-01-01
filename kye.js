/*
====================
HOW TO USE THIS FILE
====================

Do not modify this file unless you know what you are doing. If you simply wish
to change armor trait assignment see armor_rules.js instead.

*/

/*jshint esversion: 6 */

let edid_of_referenced_record = function(referencing_record, path_to_reference) {
    let ref = xelib.GetLinksTo(referencing_record, path_to_reference);
    if (!ref) return '';
    return xelib.EditorID(ref);
};

let add_keywords = function(record, traits, locals) {
    traits.keywords.forEach(trait => {
        let keyword = 'kye_armor_' + trait;
        xelib.AddKeyword(record, keyword);
    });
};

let check_for_addons = function(locals, helpers) {
    if (locals.elemental_destruction_installed & !locals.know_your_elements_installed) {
        helpers.logMessage('Warning: Elemental destruction magic detected. For full compatibility with Know Your Enemy, please install Know Your Elements.');
    }
    if (!locals.elemental_destruction_installed & locals.know_your_elements_installed) {
        helpers.logMessage('Warning: Know Your Elements detected, but Elemental Desctruction Magic not detected.');
    }
    if (locals.shadow_spells_installed & !locals.light_and_shadow_installed) {
        helpers.logMessage('Warning: Shadow Spells Package detected. For full compatibility with Know Your Enemy, please install Know Your Enemy Light and Shadow.');
    }
    if (!locals.shadow_spells_installed & locals.light_and_shadow_installed) {
        helpers.logMessage('Warning: Know Your Enemy Light and Shadow detected, but Shadow Spells Package not detected.');
    }
};

let adjust_effect_magnitude = function(magnitude, scale) {
    if (magnitude == 1) return magnitude;
    if (magnitude > 1) {
        return (magnitude-1)*scale + 1;
    } else {
        return 1/adjust_effect_magnitude(1/magnitude, scale);
    }
};

let round1 = function(number) {
    return Math.round(number*10)/10;
};

let generate_description = function(armor_traits, settings, locals) {
    let description = '';
    if (armor_traits.material !== undefined) {
        description = "Material: " + armor_traits.material;
    }
    if (armor_traits.construction !== undefined) {
        if (description != '') description += '; ';
        description = description + "Construction: " + armor_traits.construction;
    }
    if (description != '') description += '.';
    
    let fire = 1;
    let frost = 1;
    let shock = 1;
    let blade = 1;
    let axe = 1;
    let blunt = 1;
    let arrows = 1;
    let earth = 1;
    let water = 1;
    let wind = 1;

    let keywords = armor_traits.keywords;
    if (keywords.includes('warm')) {
        fire *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        frost *= adjust_effect_magnitude(0.5, settings.effectIntensity);
        water *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        wind *= adjust_effect_magnitude(0.75, settings.effectIntensity);
    }
    if (keywords.includes('leathery')) {
        arrows *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        blade *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        blunt *= adjust_effect_magnitude(0.8, settings.effectIntensity);
        wind *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        water *= adjust_effect_magnitude(0.75, settings.effectIntensity);
    }
    if (keywords.includes('brittle')) {
        blunt *= adjust_effect_magnitude(1.5, settings.effectIntensity);
        axe *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        water *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        earth *= adjust_effect_magnitude(1.25, settings.effectIntensity);
    }
    if (keywords.includes('nonconductive')) {
        shock *= adjust_effect_magnitude(0.5, settings.effectIntensity);
        fire *= adjust_effect_magnitude(0.8, settings.effectIntensity);
        frost *= adjust_effect_magnitude(0.8, settings.effectIntensity);
        water *= adjust_effect_magnitude(0.75, settings.effectIntensity);
    }
    if (keywords.includes('thick')) {
        arrows *= adjust_effect_magnitude(0.5, settings.effectIntensity);
        blade *= adjust_effect_magnitude(0.5, settings.effectIntensity);
        wind *= adjust_effect_magnitude(0.75, settings.effectIntensity);
    }
    if (keywords.includes('metal')) {
        arrows *= adjust_effect_magnitude(0.5, settings.effectIntensity);
        blade *= adjust_effect_magnitude(0.5, settings.effectIntensity);
        shock *= adjust_effect_magnitude(1.5, settings.effectIntensity);
        fire *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        frost *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        earth *= adjust_effect_magnitude(0.75, settings.effectIntensity);
        water *= adjust_effect_magnitude(1.25, settings.effectIntensity);
    }
    if (keywords.includes('layered')) {
        blunt *= adjust_effect_magnitude(1.25, settings.effectIntensity);
        blade *= adjust_effect_magnitude(0.75, settings.effectIntensity);
        wind *= adjust_effect_magnitude(0.75, settings.effectIntensity);
    }
    if (keywords.includes('deep')) {
        blunt *= adjust_effect_magnitude(0.5, settings.effectIntensity);
        axe *= adjust_effect_magnitude(0.75, settings.effectIntensity);
        earth *= adjust_effect_magnitude(0.75, settings.effectIntensity);
    }
    
    fire = round1(fire);
    if (fire != 1) description = description + " Fire x" + fire + ",";

    frost = round1(frost);
    if (frost != 1) description = description + " Frost x" + frost + ",";

    shock = round1(shock);
    if (shock != 1) description = description + " Shock x" + shock + ",";

    blade = round1(blade);
    if (blade != 1) description = description + " Blade x" + blade + ",";

    axe = round1(axe);
    if (axe != 1) description = description + " Axe x" + axe + ",";

    blunt = round1(blunt);
    if (blunt != 1) description = description + " Blunt x" + blunt + ",";

    arrows = round1(arrows);
    if (arrows != 1) description = description + " Arrows x" + arrows + ",";

    if (locals.know_your_elements_installed == true) {
        water = round1(water);
        if (water != 1) description = description + " Water x" + water + ",";
        wind = round1(wind);
        if (wind != 1) description = description + " Wind x" + wind + ",";
        earth = round1(earth);
        if (earth != 1) description = description + " Earth x" + earth + ",";
    }

    description = description.replace(/.$/,".");
    return description;
};

registerPatcher({
    info: info,
    gameModes: [xelib.gmSSE, xelib.gmTES5],
    settings: {
        label: "Know Your Enemy's Armor Patcher",
        hide: false,
        templateUrl: `${patcherUrl}/partials/settings.html`,
        controller: function($scope) {
            let patcherSettings = $scope.settings.KnowYourArmorPatcher;
        },
        defaultSettings: {
            patchArmorDescription: 'true',
            effectIntensity: 1.00,
            patchFileName: 'know_your_armor_patch.esp'
        }
    },
    requiredFiles: ['know_your_enemy.esp'],
    getFilesToPatch: function(filenames) {
        return filenames.filter(function(value, index, arr) {
            return (value != `know_your_armor_patch.esp`);
        });
    },
    execute: (patchFile, helpers, settings, locals) => ({
        initialize: function() {
            locals.armor_rules = require(`${patcherPath}/armor_rules.js`);
            locals.misc_rules = require(`${patcherPath}/misc.js`);

            let kye = xelib.FileByName("know_your_enemy.esp");
            locals.kye_armor_perk = xelib.GetHexFormID(xelib.GetElement(kye, 'kye_perk_armors2'));

            locals.elemental_destruction_installed = xelib.HasElement(0, 'Elemental Destruction.esp');
            locals.know_your_elements_installed = xelib.HasElement(0, 'Know Your Elements.esp');
            locals.shadow_spells_installed = xelib.HasElement(0, 'ShadowSpellPackage.esp');
            locals.light_and_shadow_installed = xelib.HasElement(0, 'KYE Light and Shadow.esp');
            check_for_addons(locals, helpers);
        },
        process: [{
            // ***** PART 1 *****
            // Add the armor perk to all relevant NPCs
            load: {
                signature: 'NPC_',
                filter: function(record) {
                    if (xelib.HasElement(record, 'ACBS\\Template Flags')) {
                        let flags = xelib.GetEnabledFlags(record, 'ACBS\\Template Flags');
                        if (flags.includes("Use Spell List")) return false;
                    }

                    if (xelib.HasKeyword(record, 'ActorTypeGhost')) return false;
                    
                    let race_name = edid_of_referenced_record(record, 'RNAM');
                    return locals.misc_rules.armor_races.includes(race_name);
                }
            },
            patch: function (record) {
                xelib.AddPerk(record, locals.kye_armor_perk, '1');
            }
        }, {
            // ***** PART 2 *****
            // Adjust the magnitude of KYE's effects according to the effectIntensity settings.
            records: () => {
                let kye = xelib.FileByName("know_your_enemy.esp");
                let armor_perk = [xelib.GetElement(kye, 'kye_perk_armors2')];
                return [armor_perk].map(rec => xelib.GetWinningOverride(rec));
            },
            patch : armor_perk => {
                if (settings.effectIntensity == 1.0) return;
                let effects = xelib.GetElements(armor_perk, 'Effects');
                effects.forEach(effect => {
                    let entry_point = xelib.GetValue(effect, 'DATA\\Entry Point\\Entry Point');
                    if (!['Mod Incoming Damage', 'Mod Incoming Spell Magnitude'].includes(entry_point)) return;
                    let current_magnitude = xelib.GetFloatValue(effect, 'Function Parameters\\EPFD\\Float');
                    let new_magnitude = adjust_effect_magnitude(current_magnitude, settings.effectIntensity);
                    xelib.SetFloatValue(effect, 'Function Parameters\\EPFD\\Float', new_magnitude);
                });
            }
        },{
            // ***** PART 3 *****
            // Add the keywords to each armor
            load: {
                signature: 'ARMO',
                filter: function(record) {
                    let record_id = xelib.GetValue(record, 'EDID');
                    if (locals.misc_rules.ignored_armors.includes(record_id)) return false;

                    if (!xelib.HasKeyword(record, 'ArmorCuirass')) return false;

                    if (!xelib.HasElement(record, 'TNAM')) return true;
                    let template = xelib.GetValue(record, 'TNAM');
                    return (template == "");
                }
            },
            patch: function(record) {
                let record_id = xelib.EditorID(record);
                let armor_traits = locals.armor_rules[record_id];
                if (!armor_traits) {
                    let keywords = xelib.GetElements(record, 'KWDA').map(k => {
                      return xelib.EditorID(xelib.GetLinksTo(k));
                    });
                    let keyword = keywords.find(keyword => {
                      return locals.armor_rules.hasOwnProperty(keyword);
                    });
                    if (keyword) {
                        armor_traits = locals.armor_rules[keyword];
                    }
                }
                if (!armor_traits) {
                    helpers.logMessage(`Warning: ${record_id} has no specific rule or recognized keywords, it will not be affected by the patcher.`);
                    return;
                }

                add_keywords(record, armor_traits, locals);
                if (settings.patchArmorDescription == "true") {
                    let description = generate_description(armor_traits, settings, locals);
                    xelib.AddElementValue(record, 'DESC', description);
                }
            }
        }],
    })
});