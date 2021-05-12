# SkillCD

A TeraToolbox mod for visually keeping track of skill cooldowns in combo chains.

The SkillCD UI will be visible whenever you use a skill.

# Chat Commands
* !skillcd - Opens the SkillCD Config window for customizing settings and tracked skills
* !skillcd clear - Clears the tracked skills list for the currently logged in class

# Config Window
* Enable - Toggles whether skill CD tracking is enabled.
* Keybind - Change the keybind for opening the SkillCD Config window, leave blank for no keybind.
* *	Note: Need to restart after making changes to the keybind.
* OOC Time - (Out Of Combat Time) The SkillCD UI will hide after this number of seconds of no skill use.
* Ready Opacity - Change the opacity of skill icons when skill is ready to use.
* CD Opacity - Change the opacity of skill icons when skill is on cooldown.
* Icon Scale - Change the size of skill icons.
* Padding - Change the padding between skill icons.
* Press the 'Save' button to apply changes made.
	
# Config - Skill Setup
* Press a '+' button to begin adding a skill to track to the selected slot.
* After pressing '+', you need to use the skill in-game to track it.
* The skill's icon will then appear on the specified slot.
	
* Tracked skills can be removed by right-clicking their icon in the config.
* You can also change them to other skills by left-clicking them and using a different skill in-game.
	
* The SkillCD UI can be moved only while the config is open.
* * When config is closed, the SkillCD UI will have click-through behaviour.
	
---

# todo
* A future version will implement ability to re-order rows of skill groups.
* Need to blacklist certain skills from triggering visibility of SkillCD UI (like mounts).
* Add ability to track item use (like brooch buff).
