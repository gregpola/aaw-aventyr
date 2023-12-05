const optionName = "Shadow Mote Sphere";
const version = "11.0";

try {
    if (args[0].macroPass === "postActiveEffects") {
        let target = workflow.hitTargets.first();

        if (target) {
            // ask if they want to use Goading Attack
            let dialog = new Promise((resolve, reject) => {
                new Dialog({
                    // localize this text
                    title: `${optionName}`,
                    content: `<p>Which Shadow Mote Effect?</p>`,
                    buttons: {
                        one: {
                            icon: '<p> </p><img src = "icons/magic/control/fear-fright-shadow-monster-green.webp" width="50" height="50"></>',
                            label: "<p>Distracting Shadows</p>",
                            callback: async (html) => {
                                const conc =target.actor.effects.find(i => i.name === "Concentrating");
                                if (conc) {
                                    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [conc.id] });
                                }
                                await applyDistractingShadows(target.actor.uuid, item.uuid);
                                resolve();
                            }
                        },
                        two: {
                            icon: '<p> </p><img src = "icons/magic/control/fear-fright-shadow-monster-purple.webp" width="50" height="50"></>',
                            label: "<p>Threatening Shadows</p>",
                            callback: async (html) => {
                                await applyThreateningShadows(target.actor.uuid, item.uuid);
                                resolve();
                            }
                        }
                    },
                    default: "two"
                }).render(true);
            });
        }
    }

} catch (err) {
    console.error(`${optionName}: ${version}`, err);
}

/*
    The target sees movement amongst the shadows, making it harder to focus on any one thing. For one round, the target makes attacks with disadvantage and it cannot concentrate.
 */
async function applyDistractingShadows(targetId, origin) {
    const effectData = {
        name: "Distracting Shadows",
        icon: "icons/magic/control/fear-fright-shadow-monster-green.webp",
        origin: origin,
        changes: [
            {
                key: 'flags.midi-qol.disadvantage.attack.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'true',
                priority: 20
            }
        ],
        flags: {
            dae: {
                selfTarget: false,
                stackable: "none",
                durationExpression: "",
                macroRepeat: "none",
                specialDuration: [
                    "turnEnd"
                ],
                transfer: false
            }
        },
        disabled: false
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}

/*
    The target sees threats that are not there, which lowers their defenses against threats that are. The next weapon attack against the target is made with advantage.
 */
async function applyThreateningShadows(targetId, origin) {
    const effectData = {
        name: "Threatening Shadows",
        icon: "icons/magic/control/fear-fright-shadow-monster-purple.webp",
        origin: origin,
        changes: [
            {
                key: 'flags.midi-qol.grants.advantage.attack.all',
                mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM,
                value: 'true',
                priority: 20
            }
        ],
        flags: {
            dae: {
                selfTarget: false,
                stackable: "none",
                durationExpression: "",
                macroRepeat: "none",
                specialDuration: [
                    "turnEnd",
                    "isAttacked"
                ],
                transfer: false
            }
        },
        disabled: false
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetId, effects: [effectData] });
}
