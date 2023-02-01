Necro = {};

Necro.skills = {}; // name : button
Necro.skills["Fear"] = null; 

Necro.terms = {}; // name : button
Necro.terms["fear"] = null; 

Necro.essences = {};
Necro.essences["Some horror"] = { terms: " fear ", desc: ["Some horror to fear with"], skill: "Fear", slot: "Weapon" };

Game.classes["necro"] = Necro;