/*
    You create a small sphere of shadow-essence that you can hurl as a ranged spell attack at one target. On a hit, the
    sphere causes the target to see distracting movement out of the corner of their eye. This can have two possible
    effects; you decide which when the attack hits.

    Distracting Shadows. The target sees movement amongst the shadows, making it harder to focus on any one thing. For
    one round, the target makes attacks with disadvantage and it cannot concentrate.

    Threatening Shadows. The target sees threats that are not there, which lowers their defenses against threats that
    are. The next weapon attack against the target is made with advantage.

    At Higher Levels. When you cast this spell using a spell slot of 2nd level or higher, you can target one additional
    creature for each slot above 1st. You must make a ranged spell attack for each target.
 */
const optionName = "Shadow Mote";
const version = "11.0";
let beamItem = await HomebrewHelpers.getItemFromCompendium('aaw-aventyr.aaw-automation-items', 'Shadow Mote Sphere');

try {
    if (args[0].macroPass === "postActiveEffects") {
        const spellLevel = workflow.castData.castLevel;
        const sphereCount = spellLevel;

        // check for need to select targets
        if (workflow.targets.size === 1) {
            let target = workflow.targets.first();
            await launchSphere(target);
        }
        else {
            let sphereTargets = new Set();

            let rows = "";
            for(let t of workflow.targets) {
                let row = `<div class="flexrow"><label>${t.name}</label><input type="checkbox" value=${t} style="margin-right:10px;"/></div>`;
                rows += row;
            }

            let content = `<form>
                <div class="flexcol">
                    <div class="flexrow" style="margin-bottom: 5px;"><p>Pick your sphere targets (max ${sphereCount}):</p></div>
                    <div id="targetRows" class="flexcol"style="margin-bottom: 10px;">
                        ${rows}
                    </div>
                </div>
              </form>`;

            let dialog = new Promise(async (resolve, reject) => {
                let errorMessage;
                new Dialog({
                    title: `${item.name} Targets`,
                    content: content,
                    buttons: {
                        damage: {
                            label: "Cast", callback: async (html) => {
                                var grid = document.getElementById("targetRows");
                                var checkBoxes = grid.getElementsByTagName("INPUT");
                                for (var i = 0; i < checkBoxes.length; i++) {
                                    if (checkBoxes[i].checked) {
                                        sphereTargets.add(checkBoxes[i].value);
                                    }
                                }

                                if (sphereTargets.size === 0) {
                                    errorMessage = `The spell fails, no targets`;
                                    ui.notifications.error(errorMessage);
                                }
                                else {
                                    let sentSpheres = 0;
                                    for (let targetToken of sphereTargets.values()) {
                                        await launchSphere(targetToken);
                                        sentSpheres++;

                                        if (sentSpheres >= sphereCount)
                                            break;
                                    }
                                }
                                resolve();
                            }
                        }
                    },
                    close: async (html) => {
                        if(errorMessage) reject(new Error(errorMessage));
                    },
                    default: "damage"
                }).render(true);
            });
            await dialog;
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

async function launchSphere(targetToken){
    let feature = new CONFIG.Item.documentClass(beamItem, {'parent': workflow.actor});
    let [config, options] = HomebrewHelpers.syntheticItemWorkflowOptions([targetToken.document.uuid]);
    await MidiQOL.completeItemUse(feature, config, options);
    await warpgate.wait(250);
}
