document.addEventListener('DOMContentLoaded', () => {
	const { Renderer } = require('tera-mod-ui');
	const mod = new Renderer;
	const skillsTable = document.querySelector('.skills-table');
	let configSettings;
	let skillGroups;
	let isVisible = true;
	
	mod.on('UI_SETTINGS', ({settings, classSkillGroups}) => {
		configSettings = settings;
		skillGroups = classSkillGroups;
		
		populateTable();
	});
	
	mod.on('UI_SKILL_COOLDOWN', ({skillId, cooldown, useTime}) => {
		var dataSkills = document.querySelectorAll(`[data-skill='${skillId}']`);
		dataSkills.forEach(dataSkill => {
			activateSkill(dataSkill, cooldown, useTime);
		});
	});
	
	mod.on('UI_SKILL_COOLDOWN_UPDATE', ({skillId, cdRemaining}) => {
		var dataSkills = document.querySelectorAll(`[data-skill='${skillId}']`);
		dataSkills.forEach(dataSkill => {
			updateSkill(dataSkill, cdRemaining);
		});
	});
	
	mod.on('UI_VISIBLE', (visible) => {
		isVisible = visible;
		updateVisibility();
	});
	
	function updateVisibility() {
		var trs = document.querySelectorAll('tr');
		trs.forEach(tr => {
			tr.style.visibility = isVisible ? 'visible' : 'hidden';
		});
	}
	
	function populateTable() {
		skillsTable.innerHTML = '';
		
		if(skillGroups.length > 0 && skillGroups[0].length > 0) {
			var nodes = [];
			for(var i = 0; i < skillGroups.length; i++) {
				if(skillGroups[i].length == 0) { continue; }
				for(var n = 0; n < skillGroups[i].length; n++) {
					if(nodes[i] == undefined) {
						nodes[i] = document.createElement('tr');
					}
					var skillGroup = skillGroups[i][n];
					nodes[i].innerHTML += `<td style="padding: ${configSettings.iconPadding}; opacity: ${isVisible ? (configSettings.rOpacity / 100).toFixed(1) : 0};"><div id="${skillGroup.skillId}" class="skill" data-skill="${skillGroup.skillId}" data-cooldown="" data-remaining="" style="background-image: url('skills/${skillGroup.skillIcon}.png'); width: ${configSettings.iconSize}; height: ${configSettings.iconSize}; line-height: ${configSettings.iconSize};"></div></td>`;
				}
			}
			for(var m = 0; m < nodes.length; m++) {
				skillsTable.appendChild(nodes[m]);
			}
		}
	}
	
	function activateSkill(target, cooldown, useTime) {
		target.parentNode.style.opacity = `${(configSettings.cdOpacity / 100).toFixed(1)}`;
		target.style.setProperty('--time-left', '100%');
		target.setAttribute('data-cooldown', `${cooldown}`);
		target.style.lineHeight = target.style.width;
		
		const cdInterval = setInterval(() => {
			cooldown = parseInt(target.getAttribute('data-cooldown'), 10);
			var cdRemaining = cdTimeRemaining(useTime, cooldown);
			target.setAttribute('data-remaining', `${cdRemaining}`);
			
			target.parentNode.style.opacity = `${(configSettings.cdOpacity / 100).toFixed(1)}`;
			target.style.setProperty('--time-left', `${cdRemaining / cooldown * 100}%`);
			target.setAttribute('data-text', `${(cdRemaining / 1000).toFixed(1)}`);
			if(cdRemaining <= 0) {
				target.parentNode.style.opacity = `${(configSettings.rOpacity / 100).toFixed(1)}`;
				target.setAttribute('data-text', '');
				clearInterval(cdInterval);
			}
		}, 1000 / 60);
	}
	
	function updateSkill(target, newRemaining) {
		var currentRemaining = parseInt(target.getAttribute('data-remaining'), 10);
		var diff = currentRemaining - newRemaining;
		target.setAttribute('data-remaining', `${newRemaining > 0 ? newRemaining : 0}`);
		
		var currentCooldown = parseInt(target.getAttribute('data-cooldown'), 10);
		target.setAttribute('data-cooldown', `${currentCooldown - diff}`);
	}
	
	function cdTimeRemaining(lastUseTime, cdDuration) {
		if(lastUseTime == 0 || cdDuration == 0) { return 0; }
		var remaining = (lastUseTime + cdDuration) - Date.now();
		return remaining < 0 ? 0 : remaining;
	}
});
