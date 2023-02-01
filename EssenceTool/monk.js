Monk = {};

Monk.skills = {}; // name : button
Monk.skills["Zen"] = null; 

Monk.terms = {}; // name : button
Monk.terms["zen"] = null; 

Monk.essences = {};
Monk.essences["Some mantra"] = { terms: " zen ", desc: ["Some mantra to zen with"], skill: "Zen", slot: "Weapon" };

Game.classes["monk"] = Monk;