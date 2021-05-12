document.addEventListener('DOMContentLoaded', () => {
	const { Renderer } = require('tera-mod-ui');
	const mod = new Renderer;
	let configSettings;
	let skillGroups;
	let skillsTable = document.getElementById('skillstbd');
	
	document.getElementById('close').onclick = function() {
		mod.send('UI_CLOSE');
	};
	
	mod.on('UI_SETTINGS', ({settings, classSkillGroups}) => {
		configSettings = settings;
		skillGroups = classSkillGroups;
		document.getElementById('checkEnabled').checked = configSettings.enabled;
		document.getElementById('textKeybind').value = configSettings.configKeybind;
		document.getElementById('sliderCombat').value = configSettings.outOfCombatTime;
		document.getElementById('sliderIcon').value = configSettings.iconSize;
		document.getElementById('sliderPadding').value = configSettings.iconPadding;
		document.getElementById('sliderROpacity').value = configSettings.rOpacity;
		document.getElementById('sliderCDOpacity').value = configSettings.cdOpacity;
		populateTable();
		
		document.getElementById('textCombat').innerHTML = `OOC Time: ${document.getElementById('sliderCombat').value}`;
		document.getElementById('textIcon').innerHTML = `Icon Scale: ${document.getElementById('sliderIcon').value}`;
		document.getElementById('textPadding').innerHTML = `Padding: ${document.getElementById('sliderPadding').value}`;
		document.getElementById('textROpacity').innerHTML = `Ready Opacity: ${document.getElementById('sliderROpacity').value}%`;
		document.getElementById('textCDOpacity').innerHTML = `CD Opacity: ${document.getElementById('sliderCDOpacity').value}%`;
	});
	
	mod.on('UI_SKILL_CAPTURED', ({settings, classSkillGroups}) => {
		configSettings = settings;
		skillGroups = classSkillGroups;
		populateTable();
	});
	
	function populateSkillGroups() {
		skillGroups = [];
		
		for(var i = 0; i < skillsTable.children.length; i++) {
			for(var n = 0; n < skillsTable.children[i].children.length; n++) {
				if(skillsTable.children[i].children[n].id == '') { continue; }
				var sId = skillsTable.children[i].children[n].id;
				var sIcon = skillsTable.children[i].children[n].getAttribute('name');
				
				if(skillGroups[i] == undefined) {
					skillGroups.push([{ skillId: sId, skillIcon: sIcon }]);
				} else {
					skillGroups[i][n] = { skillId: sId, skillIcon: sIcon };
				}
			}
		}
		
		mod.send('UI_REPOPULATED_SKILLGROUPS', skillGroups);
		populateTable();
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
					nodes[i].innerHTML += `<td id="${skillGroup.skillId}" name="${skillGroup.skillIcon}" class="addSkill"><img src="skills/${skillGroup.skillIcon}.png" width="31" height="31" vspace="-20"/></td>`;
					
					if(skillGroups[i][n + 1] == undefined) {
						nodes[i].innerHTML += `<td class="addSkill"><img src="addbutton_norm.png" width="31" height="31" vspace="-20"/></td>`;
					}
				}
			}
			for(var m = 0; m < nodes.length; m++) {
				skillsTable.appendChild(nodes[m]);
			}
			var node = document.createElement('tr');
			node.innerHTML = `<td class="addSkill"><img src="addbutton_norm.png" width="31" height="31" vspace="-20"/></td>`;
			skillsTable.appendChild(node);
		} else {
			var node = document.createElement('tr');
			node.innerHTML = `<td class="addSkill"><img src="addbutton_norm.png" width="31" height="31" vspace="-20"/></td>`;
			skillsTable.appendChild(node);
		}
	}
	
	function insertAfter(referenceNode, newNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}
	
	document.addEventListener('mouseup', function(e) {
		if(e.target.id == 'save' && e.which == 1) {
			configSettings.enabled = document.getElementById("checkEnabled").checked;
			configSettings.configKeybind = document.getElementById("textKeybind").value;
			configSettings.outOfCombatTime = document.getElementById("sliderCombat").value;
			configSettings.iconSize = document.getElementById("sliderIcon").value;
			configSettings.iconPadding = document.getElementById("sliderPadding").value;
			configSettings.rOpacity = document.getElementById("sliderROpacity").value;
			configSettings.cdOpacity = document.getElementById("sliderCDOpacity").value;
			mod.send('UI_UPDATE_SETTINGS', configSettings);
		} else if(e.target.parentNode.className == 'addSkill' && e.which == 1) {
			e.target.parentNode.className = 'awaitSkill';
			e.target.setAttribute('src', 'addbutton_await.png');
			
			var xId = Array.prototype.indexOf.call(e.target.parentNode.parentNode.parentNode.children, e.target.parentNode.parentNode);
			var yId = Array.prototype.indexOf.call(e.target.parentNode.parentNode.children, e.target.parentNode);
			
			mod.send('UI_AWAIT_SKILL_CAPTURE', ({skillGroup: xId, skillSlot: yId}));
		} else if(e.target.parentNode.className == 'awaitSkill' && e.which == 1) {
			e.target.parentNode.className = 'addSkill';
			if(e.target.parentNode.id == '') {
				e.target.setAttribute('src', 'addbutton_norm.png');
			} else {
				e.target.setAttribute('src', `skills/${e.target.parentNode.getAttribute('name')}.png`);
			}
			
			mod.send('UI_AWAIT_SKILL_CANCEL');
		} else if(e.target.parentNode.className == 'addSkill' && e.target.parentNode.id != '' && e.which == 3) {
			if(e.target.parentNode.parentNode.children.length <= 2) {
				e.target.parentNode.parentNode.parentNode.removeChild(e.target.parentNode.parentNode);
			} else {
				e.target.parentNode.parentNode.removeChild(e.target.parentNode);
			}
			populateSkillGroups();
		}
	}, false);
	
	document.addEventListener('change', function(e) {
		if(e.target.id == 'sliderCombat') {
			document.getElementById('textCombat').innerHTML = `OOC Time: ${e.target.value}`;
		} else if(e.target.id == 'sliderIcon') {
			document.getElementById('textIcon').innerHTML = `Icon Scale: ${e.target.value}`;
		} else if(e.target.id == 'sliderPadding') {
			document.getElementById('textPadding').innerHTML = `Padding: ${e.target.value}`;
		} else if(e.target.id == 'sliderROpacity') {
			document.getElementById('textROpacity').innerHTML = `Ready Opacity: ${e.target.value}%`;
		} else if(e.target.id == 'sliderCDOpacity') {
			document.getElementById('textCDOpacity').innerHTML = `CD Opacity: ${e.target.value}%`;
		}
	}); 
});