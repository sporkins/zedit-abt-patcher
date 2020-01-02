
registerPatcher({
    info: info,
    gameModes: [xelib.gmSSE],
    settings: {
        label: 'ABT Patcher',
        //hide: true,
        templateUrl: `${patcherUrl}/partials/settings.html`,
        defaultSettings: {
            arrowGravity: 0.20,
            arrowSpeed: 5400,
            boltGravity: 0.20,
            boltSpeed: 5400,
            patchFileName: 'abtPatch.esp'
        }
    },
    requiredFiles: [],
    getFilesToPatch: function(filenames) {
       return filenames.filter(function(value, index, arr) {
            return (value != `abtPatch.esp`);
        });
    },
    execute: (patchFile, helpers, settings, locals) => ({
        initialize: function() {
            // Optional function, omit if empty.
            // Perform anything that needs to be done once at the beginning of the
            // patcher's execution here.  This can be used to cache records which don't
            // need to be patched, but need to be referred to later on.  Store values
            // on the locals variable to refer to them later in the patching process.
            helpers.logMessage(settings);
            // this line shows you how to load records using the loadRecords helper
            // function and store them on locals for the purpose of caching
            // locals.weapons = helpers.loadRecords('WEAP');
        },
        // required: array of process blocks. each process block should have both
        // a load and a patch function.
        process: [{
            load: {
                signature: 'AMMO',
                filter: function(record) {
                    helpers.logMessage(xelib.FullName(record));
                    return xelib.GetValue(record, 'DNAM');
                }
            },
            patch: function(record) {
                // helpers.logMessage(`Patching ${xelib.LongName(record)}`);
                // xelib.SetValue(record, 'DNAM', '30');
            }
        },
        finalize: function() {
            // Optional function, omit if empty. Perform any cleanup here.
            // note that the framework automatically removes unused masters as
            // well as ITPO and ITM records, so you don't need to do that
            // helpers.logMessage(`Found ${locals.weapons.length} cached weapons records.`);
            // this creates a new record at the same form ID each time the patch
            // is rebuilt so it doesn't get lost when the user rebuilds a patch
            // plugin and loads a save

            // let weapon  = xelib.AddElement(patchFile, 'WEAP\\WEAP');
            // helpers.cacheRecord(weapon, 'MEPz_BlankWeapon');
            // xelib.AddElementValue(weapon, 'FULL', 'Blank Weapon');
        }
    })
});