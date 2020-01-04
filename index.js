let getArrowProjectiles = (helpers) => {
    let projectiles = helpers.loadRecords('AMMO')
        .filter(a => {
            let isNonbolt = xelib.GetFlag(a, 'DATA\\Flags', 'Non-Bolt') == true;
            let isRiekling = /Riekling/i.test(xelib.LongName(a));
            helpers.logMessage(`arrow PROJ: ${xelib.LongName(a)}, isNonbolt=${isNonbolt}, isRiekling=${isRiekling}`);
            return !isRiekling && isNonbolt;
        })
        .map(a =>  xelib.GetWinningOverride(xelib.GetLinksTo(a, 'DATA\\Projectile')))
    return uniqueify(projectiles, xelib.GetFormID);
}

let getBoltProjectiles = (helpers) => {
    let projectiles = helpers.loadRecords('AMMO')
        .filter(a => {
            let isBolt = xelib.GetFlag(a, 'DATA\\Flags', 'Non-Bolt') == false;
            let isRiekling = /Riekling/i.test(xelib.LongName(a));
            helpers.logMessage(`bolt PROJ: ${xelib.LongName(a)}, isBolt=${isBolt}, isRiekling=${isRiekling}`);
            return !isRiekling && isBolt;
        })
        .map(a => xelib.GetWinningOverride(xelib.GetLinksTo(a, 'DATA\\Projectile')))
    return uniqueify(projectiles, xelib.GetFormID);
}

let {EditorID, GetRefEditorID, GetValue, GetFlag, HasElement, GetElement, GetElements, GetLinksTo, GetWinningOverride} = xelib;
let getSignature = (rec) => xelib.ExtractSignature(xelib.LongName(rec));
let getTemplateFlags = (rec) => ['Use Traits', 'Use Stats','Use Factions','Use Spell List','Use AI Data','Use AI Packages','Use Model/Animation?','Use Base Data','Use Inventory','Use Script','Use Def Pack List','Use Attack Data','Use Keywords'].filter(flag => GetFlag(rec, 'ACBS\\Template Flags', flag));
let hasAmmoItemsWithCountExceeding = (npc, helpers, maxCount) => {
    return getAmmoItems(npc, helpers)
        .map(ammoItem => {
            let entryData = GetElement(ammoItem, 'CNTO');
            let count = parseInt(GetValue(entryData, 'Count'), 10);
            return count > maxCount;
        })
        .includes(true);
};
let getAmmoItems = (npc, helpers) => {
	let entries = HasElement(npc, 'Items')? GetElements(npc, 'Items') : [];
    return entries.filter(ientry => {
        let entryData = GetElement(ientry, 'CNTO');
        return getSignature(GetLinksTo(entryData, 'Item')) === 'AMMO';
    });
};

let getNpcWithTooMuchAmmo = (helpers, settings) => {
    return helpers.loadRecords("NPC_")
        .filter(npc => {
            let hasTemplate = HasElement(npc, 'TPLT'), templateFlags = hasTemplate? getTemplateFlags(npc):[];
            if (!hasTemplate || !templateFlags.includes('Use Inventory')) {
                if(hasAmmoItemsWithCountExceeding(npc, helpers, settings.ammoItemCount)) {
                    helpers.logMessage(`NPC  ${xelib.LongName(npc)} has AMMO item exceeding max count`);
                    return true;
                }
            } else {
                helpers.logMessage(`NPC  ${xelib.LongName(npc)} has TPLT element and Use Inventory flag`);
                return false;
            }
        })	
};

function uniqueify(array, ux) {
    let map = new Map();
    for (p of array) {
        map.set(ux(p), p);
    }
    var filteredData = [];
    map.forEach( (value, key, map) => {
        filteredData.push(value);
    });
    return filteredData;
}

registerPatcher({
    info: info,
    gameModes: [xelib.gmSSE],
    settings: {
        label: 'ABT Patcher',
        //hide: true,
        templateUrl: `${patcherUrl}/partials/settings.html`,
        controller: function($scope) {
            let patcherSettings = $scope.settings.abtPatcher;
        },
        defaultSettings: {
            arrowGravity: 0.20,
            arrowSpeed: 5400,
            boltGravity: 0.20,
            boltSpeed: 8100,
            ammoItemCount: 20,
            patchFileName: 'abtPatch.esp'
        }
    },
    requiredFiles: [],
    getFilesToPatch: function(filenames) {
        return filenames.subtract(['abtPatch.esp']);
    },
    execute: (patchFile, helpers, settings, locals) => ({
        initialize: function() {
            locals.boltProjectiles = getBoltProjectiles(helpers);
            locals.arrowProjectiles = getArrowProjectiles(helpers);
            locals.npcsWithTooMuchAmmo = getNpcWithTooMuchAmmo(helpers, settings);
        },
        process: [
            {
                records: () => {
                   return locals.boltProjectiles;
                },
                patch: function(record) {
                    helpers.logMessage(`Patching bolt PROJ: ${xelib.LongName(record)}, gravity=${settings.boltGravity}, speed=${settings.boltSpeed}`);
                    xelib.SetFloatValue(record, 'DATA\\Gravity', settings.boltGravity);
                    xelib.SetFloatValue(record, 'DATA\\Speed', settings.boltSpeed);
                }
            },
            {
                records: () => {
                    return locals.arrowProjectiles;
                },
                patch: function(record) {
                    helpers.logMessage(`Patching arrow PROJ: ${xelib.LongName(record)}, gravity=${settings.arrowGravity}, speed=${settings.arrowSpeed}`);
                    xelib.SetFloatValue(record, 'DATA\\Gravity', settings.arrowGravity);
                    xelib.SetFloatValue(record, 'DATA\\Speed', settings.arrowSpeed);
                }
            },
            {
                records: () => {
                    return locals.npcsWithTooMuchAmmo
                },
                patch: function(npc) {
                    getAmmoItems(npc, helpers)
                        .map(ammoItem => {
                            let entryData = GetElement(ammoItem, 'CNTO');
                            let count = parseInt(GetValue(entryData, 'Count'), 10);
                            let refId = GetRefEditorID(entryData, 'Item');
                            if(count > settings.ammoItemCount) {
                                helpers.logMessage(`Patching AMMO item for NPC: ${xelib.LongName(npc)}`);
                                xelib.SetIntValue(entryData, 'Count', settings.ammoItemCount);
                            }
                        });
                }
            }
        ],
        finalize: function() {}
    })
});