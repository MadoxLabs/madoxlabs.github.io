Crus = {};

Crus.skills = {}; // name : button
Crus.skills["Smite"] = null; 

Crus.terms = {}; // name : button
Crus.terms["smite"] = null; 

Crus.essences = {};
Crus.essences["Some cross"] = { terms: " smite ", desc: ["Some cross to smite with"], skill: "Smite", slot: "Weapon" };

Game.classes["crus"] = Crus;