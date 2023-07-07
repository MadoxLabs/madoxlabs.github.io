Blood = {};

Blood.skills = {}; // name : button
Blood.skills["Bleed"] = null; 

Blood.terms = {}; // name : button
Blood.terms["bleed"] = null; 

Blood.essences = {};
Blood.essences["Some skill"] = { terms: " bleed ", desc: ["Some skill to bleed with"], skill: "Bleed", slot: "Weapon" };

Game.classes["blood"] = Blood;