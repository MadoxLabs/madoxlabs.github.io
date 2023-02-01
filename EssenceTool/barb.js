Barb = {};

Barb.skills = {}; // name : button
     Barb.skills["Fight"] = null; 

     Barb.terms = {}; // name : button
     Barb.terms["fight"] = null; 

     Barb.essences = {};
     Barb.essences["Some weapon"] = { terms: " fight ", desc: ["Some weapon to fight with"], skill: "Fight", slot: "Weapon" };

     Game.classes["barb"] = Barb;