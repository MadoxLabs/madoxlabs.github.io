DH = {};

DH.skills = {}; // name : button
     DH.skills["Shoot"] = null; 

     DH.terms = {}; // name : button
     DH.terms["shoot"] = null; 

     DH.essences = {};
     DH.essences["Some bow"] = { terms: " shoot ", desc: ["Some bow to shoot with"], skill: "Shoot", slot: "Weapon" };

     Game.classes["dh"] = DH;