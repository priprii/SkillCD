
const globalShortcut = require('electron').globalShortcut;

module.exports = function SkillCD(mod) {
	const { Host } = require('tera-mod-ui');
	const path = require("path");
	
	mod.settings.winPos = mod.settings.winPos == undefined ? [0, 0] : mod.settings.winPos;
	mod.settings.winConfigPos = mod.settings.winConfigPos == undefined ? [0, 0] : mod.settings.winConfigPos;
	mod.settings.enabled = mod.settings.enabled == undefined ? true : mod.settings.enabled;
	mod.settings.configKeybind = mod.settings.configKeybind == undefined ? 'Ctrl+Shift+K' : mod.settings.configKeybind;
	mod.settings.outOfCombatTime = mod.settings.outOfCombatTime == undefined ? 6 : mod.settings.outOfCombatTime;
	mod.settings.iconSize = mod.settings.iconSize == undefined ? [24, 24] : mod.settings.iconSize;
	mod.settings.iconPadding = mod.settings.iconPadding == undefined ? 0 : mod.settings.iconPadding;
	mod.settings.rOpacity = mod.settings.rOpacity == undefined ? 98 : mod.settings.rOpacity;
	mod.settings.cdOpacity = mod.settings.cdOpacity == undefined ? 94 : mod.settings.cdOpacity;
	
	let classId = (mod.game.me.templateId - 10101) % 100;
	let classSkillGroups = new Map();
	let uiVisible = false;
	let uiClosedByFocus = false;
	let uiConfigVisible = false;
	let uiMoving = false;
	let awaitSkill = false;
	let awaitSkillGroup = 0;
	let awaitSkillSlot = 0;
	const maxIconRows = 8;
	let outOfCombatTime = mod.settings.outOfCombatTime;
	
	const UI = new Host(mod, 'ui.html', {
		title: 'SkillCD',
		transparent: true,
		frame: false,
		alwaysOnTop: true,
		maximizable: false,
		fullscreen: false,
		fullscreenable: false,
		skipTaskBar: false,
		width: 200,
		height: 240,
		resizable: false,
		focusable: false,
		center: true,
		x: mod.settings.winPos[0],
		y: mod.settings.winPos[1],
		autoHideMenuBar: true,
		titleBarStyle: 'hidden',
		trafficLightPosition: { x: 1, y: 1 },
		webPreferences: { nodeIntegration: true, devTools: false }
	}, false, path.join(__dirname, 'ui'));
	
	const UIConfig = new Host(mod, 'config.html', {
		title: 'SkillCDConfig',
		transparent: true,
		frame: false,
		alwaysOnTop: true,
		maximizable: false,
		fullscreen: false,
		fullscreenable: false,
		skipTaskBar: false,
		width: 490,
		height: 354,
		resizable: false,
		center: true,
		x: mod.settings.winConfigPos[0],
		y: mod.settings.winConfigPos[1],
		autoHideMenuBar: true,
		titleBarStyle: 'hidden',
		trafficLightPosition: { x: 1, y: 1 },
		webPreferences: { nodeIntegration: true, devTools: false }
	}, false, path.join(__dirname, 'ui'));
	
	if(mod.settings.configKeybind != '') {
		globalShortcut.register(mod.settings.configKeybind, () => {
			if(uiConfigVisible){ UIConfig.close(); } else { OpenUIConfig(); }
		});
	}
	
	loadSkillGroups();
	
	mod.hook('S_LOGIN', 14, e => {
		classId = (mod.game.me.templateId - 10101) % 100;
		loadSkillGroups();
	});
	
	mod.command.add('skillcd', {
		'$default': () => {
			if(uiConfigVisible){ UIConfig.close(); } else { OpenUIConfig(); }
		},
		'clear': () => {
			if(classSkillGroups.has(classId)) {
				classSkillGroups.set(classId, []);
				saveSkillGroups();
			}
		}
	});
	
	function loadSkillGroups() {
		if(classId >= 0) {
			if(mod.settings.skillGroups == null) {
				classSkillGroups = new Map();
			} else {
				classSkillGroups = new Map(JSON.parse(mod.settings.skillGroups));
			}
			if(!classSkillGroups.has(classId)) {
				classSkillGroups.set(classId, []);
				saveSkillGroups();
			}
			if(UI.window != null) { UI.close(); }
			OpenUI(true);
		}
	}
	function saveSkillGroups() {
		mod.settings.skillGroups = JSON.stringify([...classSkillGroups.entries()]);
	}
	
	function OpenUI(initOnCombat = false, initOnConfig = false) {
		if(!mod.settings.enabled) { return; }
		uiVisible = true;
		UI.show();
		UI.window.setPosition(mod.settings.winPos[0], mod.settings.winPos[1]);
		UI.window.setBounds(maxIconRows * (mod.settings.iconSize + 2), classSkillGroups.get(classId).length * (mod.settings.iconSize + 2));
		UI.window.setVisibleOnAllWorkspaces(true);
		UI.window.setIgnoreMouseEvents(!uiConfigVisible);
		UI.window.setAlwaysOnTop(true);
		UI.window.on('move', () => { uiMoving = true; });
		UI.window.on('moved', () => { mod.setTimeout(() => { uiMoving = false; mod.settings.winPos = UI.window.getPosition(); }, 500); });
		UI.window.on('close', () => {
			mod.settings.winPos = UI.window.getPosition();
			uiVisible = false;
		});
		UI.window.once('ready-to-show', () => {
			UI.send('UI_SETTINGS', ({settings: mod.settings, classSkillGroups: classSkillGroups.get(classId)}));
			if(initOnCombat) { UI.send('UI_VISIBLE', false); }
			if(initOnConfig) { UI.send('UI_VISIBLE', true); }
		});
	}
	
	function OpenUIConfig() {
		uiConfigVisible = true;
		UIConfig.show();
		UIConfig.window.setPosition(mod.settings.winConfigPos[0], mod.settings.winConfigPos[1]);
		UIConfig.window.setVisibleOnAllWorkspaces(true);
		if(UI.window != null) {
			UI.send('UI_VISIBLE', true);
		} else {
			OpenUI(false, true);
		}
		UIConfig.window.on('close', () => {
			mod.settings.winConfigPos = UIConfig.window.getPosition();
			uiConfigVisible = false;
			if(UI.window != null) {
				UI.window.setIgnoreMouseEvents(true);
				UI.window.setFocusable(false);
				UI.send('UI_VISIBLE', false);
			}
		});
		UIConfig.window.once('ready-to-show', () => {
			UIConfig.send('UI_SETTINGS', ({settings: mod.settings, classSkillGroups: classSkillGroups.get(classId)}));
			if(UI.window != null) {
				UI.window.setIgnoreMouseEvents(false);
				UI.window.setFocusable(true);
				UI.window.setAlwaysOnTop(true);
			}
		});
	}
	
	UIConfig.on('UI_CLOSE', () => { UIConfig.close(); });
	
	UIConfig.on('UI_UPDATE_SETTINGS', (configSettings) => {
		mod.settings.enabled = configSettings.enabled;
		mod.settings.configKeybind = configSettings.configKeybind;
		mod.settings.outOfCombatTime = configSettings.outOfCombatTime;
		outOfCombatTime = mod.settings.outOfCombatTime;
		mod.settings.iconSize = configSettings.iconSize;
		mod.settings.iconPadding = configSettings.iconPadding;
		mod.settings.rOpacity = configSettings.rOpacity;
		mod.settings.cdOpacity = configSettings.cdOpacity;
		UI.send('UI_SETTINGS', ({settings: mod.settings, classSkillGroups: classSkillGroups.get(classId)}));
		mod.command.message(`Settings Saved`);
	});
	
	UIConfig.on('UI_AWAIT_SKILL_CAPTURE', ({skillGroup, skillSlot}) => {
		awaitSkill = true;
		awaitSkillGroup = skillGroup;
		awaitSkillSlot = skillSlot;
		mod.command.message(`Use a skill to save to Group ${awaitSkillGroup} Slot ${awaitSkillSlot}`);
	});
	
	UIConfig.on('UI_AWAIT_SKILL_CANCEL', () => {
		awaitSkill = false;
		mod.command.message('Skill Capture Cancelled');
	});
	
	UIConfig.on('UI_REPOPULATED_SKILLGROUPS', (skillGroups) => {
		classSkillGroups.set(classId, skillGroups);
		saveSkillGroups();
		UI.send('UI_SETTINGS', ({settings: mod.settings, classSkillGroups: classSkillGroups.get(classId)}));
		UI.window.setBounds(maxIconRows * (mod.settings.iconSize + 2), classSkillGroups.get(classId).length * (mod.settings.iconSize + 2));
	});
	
	mod.hook('S_START_COOLTIME_SKILL', 3, { order: -999 }, ({ skill, cooldown }) => {
		if(skill.npc) { return; }
		if(awaitSkill) {
			awaitSkill = false;
			mod.queryData("/SkillIconData/Icon@class=?&skillId=?/", [mod.game.me.class, skill.id], true, false, ["skillId", "iconName"]).then(res => {
				if(res[0] != undefined) {
					var skillGroups = classSkillGroups.get(classId);
					if(skillGroups[awaitSkillGroup] == undefined) {
						skillGroups.push([{ skillId: skill.id, skillIcon: res[0].attributes.iconName }]);
					} else {
						skillGroups[awaitSkillGroup][awaitSkillSlot] = { skillId: skill.id, skillIcon: res[0].attributes.iconName };
					}
					classSkillGroups.set(classId, skillGroups);
					saveSkillGroups();
					UIConfig.send('UI_SKILL_CAPTURED', ({settings: mod.settings, classSkillGroups: classSkillGroups.get(classId)}));
					UI.send('UI_SETTINGS', ({settings: mod.settings, classSkillGroups: classSkillGroups.get(classId)}));
					UI.window.setBounds(maxIconRows * (mod.settings.iconSize + 2), classSkillGroups.get(classId).length * (mod.settings.iconSize + 2));
					UI.send('UI_SKILL_COOLDOWN', ({skillId: skill.id, cooldown: cooldown, useTime: Date.now() }));
				}
			});
		} else if(mod.settings.enabled && findId(classSkillGroups.get(classId), skill.id) > -1) {
			UI.send('UI_SKILL_COOLDOWN', ({skillId: skill.id, cooldown: cooldown, useTime: Date.now() }));
		}
		
		if(!uiConfigVisible) {
			if(outOfCombatTime == mod.settings.outOfCombatTime) {
				UI.send('UI_VISIBLE', true);
				UI.window.setAlwaysOnTop(true);
				outOfCombatTime -= 1;
				setTimeout(outOfCombatTimer, 1000);
			} else {
				outOfCombatTime = mod.settings.outOfCombatTime - 1;
			}
		}
	});
	
	mod.hook('S_DECREASE_COOLTIME_SKILL', 3, { order: -999 }, ({ skill, cooldown }) => {
		if(skill.npc) { return; }
		if(mod.settings.enabled && findId(classSkillGroups.get(classId), skill.id) > -1) {
			UI.send('UI_SKILL_COOLDOWN_UPDATE', ({skillId: skill.id, cdRemaining: cooldown }));
		}
	});
	
	function outOfCombatTimer() {
		if(!uiConfigVisible) {
			outOfCombatTime -= 1;
			if(outOfCombatTime > 0) {
				setTimeout(outOfCombatTimer, 1000);
			} else {
				outOfCombatTime = mod.settings.outOfCombatTime;
				UI.send('UI_VISIBLE', false);
			}
		} else {
			outOfCombatTime = mod.settings.outOfCombatTime;
		}
	}
	
	const findId = (list, skillId) => list.reduce((ret, cList, cId) => {
		if(cList.findIndex(x => x.skillId == skillId) > - 1){
			ret = cId;
		}
		return ret;
	}, -1);
	
	mod.game.on('leave_game', () => { UI.close(); UIConfig.close(); });
	this.destructor = () => { UI.close(); UIConfig.close(); }
}
