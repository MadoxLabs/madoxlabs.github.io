Blood = {};

Blood.skills = {}; // name : button
Blood.skills["Ravage"] = null; 
Blood.skills["Shadow's Edge"] = null; 
Blood.skills["Spear Flurry"] = null; 
Blood.skills["Wave of Blood"] = null; 
Blood.skills["Tendrils of Blood"] = null; 
Blood.skills["Siphon Blood"] = null; 
Blood.skills["Sanguinate"] = null; 
Blood.skills["Umbral Lance"] = null; 
Blood.skills["Swarm of Bats"] = null; 
Blood.skills["Whirling Strike"] = null; 
Blood.skills["Mephetic Cloud"] = null; 
Blood.skills["Skewer"] = null; 
Blood.skills["Shroud of Night"] = null; 
Blood.skills["Abomination"] = null; 
Blood.skills["Blood Rush"] = null; 
Blood.skills["Shattering Fists"] = null; 
Blood.skills["Transfusion"] = null; 

Blood.terms = {}; // name : button
Blood.terms["aoe"] = null; 
Blood.terms["aura"] = null; 
Blood.terms["autoaim"] = null; 
Blood.terms["buff"] = null; 
Blood.terms["burn"] = null; 
Blood.terms["chill"] = null; 
Blood.terms["control"] = null; 
Blood.terms["dash"] = null; 
Blood.terms["debuff"] = null; 
Blood.terms["dot"] = null; 
Blood.terms["effectiveness up"] = null; 
Blood.terms["heal"] = null; 
Blood.terms["movement"] = null; 
Blood.terms["primary"] = null; 
Blood.terms["selfbuff"] = null; 
Blood.terms["shield"] = null; 
Blood.terms["slow"] = null; 
Blood.terms["speed"] = null; 
Blood.terms["stun"] = null; 
Blood.terms["summon"] = null; 

Blood.essences = {};
// CHEST
Blood.essences["Dereliction"]       = { terms: " debuff slow ", desc: ["Wave of Blood also reduces the Movement Speed of any enemies hit by 40% for 3 seconds."], skill: "Wave of Blood", slot: "Chest" };
Blood.essences["Chiropteran Trade"] = { terms: " effectiveness up ", desc: ["Swarm of Bats damage increased 10%."], skill: "Swarm of Bats", slot: "Chest" };
Blood.essences["Count of the Eves"] = { terms: " selfbuff shield ", desc: ["Whirling Strike also grants 5% damage reduction per enemy hit for 3 seconds. This effect stacks","up to a maximum of 6 times."], skill: "Whirling Strike", slot: "Chest" };
Blood.essences["Influencer"]        = { terms: " summon primary ", desc: ["Shroud of Night now only empowers you, causing every other Primary Attack to conjure a","shadowy apparition to attack enemies."], skill: "Shroud of Night", slot: "Chest" };
Blood.essences["Layered Aims"]      = { terms: " buff primary ", desc: ["Shroud of Night now empowers you and nearby allies, causing your Primary Attacks to mark ","enemies for death. The marks explode upon reaching 5 stacks dealing damage to the marked ","enemy."], skill: "Shroud of Night", slot: "Chest" };
Blood.essences["Momentary Comfort"] = { terms: " buff summon shield ", desc: ["Shroud of Night now periodically conjures shadowy apparitions that grant shields to you and ","nearby allies."], skill: "Shroud of Night", slot: "Chest" };
Blood.essences["No More Bygones"]   = { terms: " debuff ", desc: ["Sanguinate now also shatters enemy armor, increasing the damage they take by 10% for 3 ","seconds."], skill: "Sanguinate", slot: "Chest" };
Blood.essences["Rootvein Mail"]     = { terms: " stun dot ", desc: ["Tendrils of Blood now tethers you to an enemy, Immobilizing you and Stunning them for up to ","3 seconds. The blood tether continually deals damage to the linked enemy and can be broken ","at anytime by activating the skill again."], skill: "Tendrils of Blood", slot: "Chest" };
Blood.essences["Ruin's Bindings"]   = { terms: " stun control ", desc: ["Tendrils of Blood now throws enemies to a targeted location, dealing damage and Stunning them."], skill: "Tendrils of Blood", slot: "Chest" };
Blood.essences["Warmth and Likability"] = { terms: " effectiveness up ", desc: ["Wave of Blood maximum charges increased by 1."], skill: "Wave of Blood", slot: "Chest" };

//HEAD
Blood.essences["Cousin to Wildcats"]    = { terms: " slow aoe stun ", desc: ["Siphon Blood now Slows and binds nearby enemies to you. When Siphon Blood expires you","expel a wave of blood, damaging and Stunning all nearby enemies that were still bound to you."], skill: "Siphon Blood", slot: "Head" };
//Blood.essences["Gorger's Yawn"]         = { terms: " effectiveness up ", desc: ["Wave of Blood range increased by 20%."], skill: "Wave of Blood", slot: "Head" };
Blood.essences["Heir of High Regions"]  = { terms: " effectiveness up control ", desc: ["Spear Flurry deals 15% increased damage to enemies suffering loss of control."], skill: "Spear Flurry", slot: "Head" };
Blood.essences["Horns of the Hexed"]    = { terms: " aoe aura ", desc: ["Siphon Blood is no longer Channeled and now moves with you, dealing damage and draining ","the life of nearby enemies."], skill: "Siphon Blood", slot: "Head" };
//Blood.essences["Hush"]                  = { terms: " effectiveness up ", desc: ["Shroud of Night's duration increased by 30%."], skill: "Shroud of Night", slot: "Head" };
Blood.essences["Pain is Purpose"]       = { terms: " aoe shield ", desc: ["Siphon Blood now instantly drains the life of nearby enemies to grant yourself or an ally a shield ","that absorbs damage, but it no longer heals you. Shielding an ally will also grant you a shield."], skill: "Siphon Blood", slot: "Head" };
Blood.essences["Siren's Grin"]          = { terms: " effectiveness up ", desc: ["Whirling Strike maximum charges increased by 1."], skill: "Whirling Strike", slot: "Head" };
Blood.essences["Voice of the Crescent"] = { terms: " selfbuff ", desc: ["Shroud of Night also increases your Evasion Rating by 12%."], skill: "Shroud of Night", slot: "Head" };
Blood.essences["Vow of Trickery"]       = { terms: " shield ", desc: ["Whirling Strike also blocks incoming projectiles."], skill: "Whirling Strike", slot: "Head" };
Blood.essences["Wightveil"]             = { terms: " selfbuff aoe debuff ", desc: ["Siphon Blood now absorbs the power from nearby enemies reducing their damage. Each affected ","enemy provides you with increased damage."], skill: "Siphon Blood", slot: "Head" };

// WEAPON
Blood.essences["Bardiche of Below"] = { terms: " aoe ", desc: ["Whirling Strike now unleashes a blast, dealing damage to enemies caught in the path."], skill: "Whirling Strike", slot: "Weapon" };
Blood.essences["The Besalver"]      = { terms: " aoe stun ", desc: ["Skewer now causes you to leap into the air and slam into the target location, knocking enemies","up and stunning them."], skill: "Skewer", slot: "Weapon" };
Blood.essences["Blotniffe"]         = { terms: " effectiveness up ", desc: ["Umbral Lance deals up to 20% increased damage, the further you are from the target."], skill: "Umbral Lance", slot: "Weapon" };
Blood.essences["Broken Corseque"]   = { terms: " effectiveness up ", desc: ["When Siphon Blood damages the same enemy 3 times it causes them to hemorrhage, ","dealing additional damage."], skill: "Siphon Blood", slot: "Weapon" };
Blood.essences["Coiled Course"]     = { terms: " aoe ", desc: ["The final strike of the Ravage combo unleashes a wave of energy that deals damage to enemies."], skill: "Ravage", slot: "Weapon" };
Blood.essences["Dire Calling"]      = { terms: " chill slow ", desc: ["Whirling Strike is now infused with frost, Chilling enemies, reducing their Attack and ","Movement Speed."], skill: "Whirling Strike", slot: "Weapon" };
Blood.essences["Red Concord"]       = { terms: " burn ", desc: ["Whirling Strike now combusts, causing enemies to Burn."], skill: "Whirling Strike", slot: "Weapon" };
Blood.essences["Reverent Hunter"]   = { terms: " movement speed debuff slow ", desc: ["Siphon Blood also slows enemy Movement Speed by 30%, absorbing their vigor, and increases ","your Movement Speed by 10%, up to 30%."], skill: "Siphon Blood", slot: "Weapon" };
Blood.essences["Sawtooth"]          = { terms: " movement control ", desc: ["Skewer now causes you to sprint forward while dragging your spear. Release the skill to knock ","your enemy up in the air."], skill: "Skewer", slot: "Weapon" };
Blood.essences["Toothdrinker"]      = { terms: " aoe slow control ", desc: ["Whirling Strike now sweeps your polearm in front of you, damaging, Slowing and pulling enemies ","to the side."], skill: "Whirling Strike", slot: "Weapon" };

// OFFHAND
Blood.essences["Ageless Cross"]      = { terms: " aoe ", desc: ["Umbral Lance now causes shadow spears to randomly fall from the sky within an area, dealing","damage to enemies."], skill: "Umbral Lance", slot: "Offhand" };
Blood.essences["Blood Theriac"]      = { terms: " aoe stun movement ", desc: ["Umbral Lance now throws a shadow lance forward into the ground, damaging enemies in its path. ","Activate again to rush the polearm, Stunning and dealing additional damage to any enemies in ","your path."], skill: "Umbral Lance", slot: "Offhand" };
Blood.essences["Hanging Chalice"]    = { terms: " autoaim ", desc: ["After Shadow's Edge hits an enemy, two blades ricochet out randomly targeting nearby enemies, ","dealing damage to them."], skill: "Shadow's Edge", slot: "Offhand" };
Blood.essences["Idol of Opulence"]   = { terms: " aoe stun ", desc: ["Wave of Blood now releases a bloody explosion, damaging, knocking back and Stunning enemies ","within the area."], skill: "Wave of Blood", slot: "Offhand" };
Blood.essences["Mercy's Plight"]     = { terms: " effectiveness up ", desc: ["Shadow's Edge now marks enemies, causing them to erupt for additional damage, when reaching ","4 marks."], skill: "Shadow's Edge", slot: "Offhand" };
Blood.essences["Peer of the Cursed"] = { terms: " aoe slow ", desc: ["Wave of Blood now creates a well of death that Slows enemies within until they are Immobilized."], skill: "Wave of Blood", slot: "Offhand" };
Blood.essences["Pinch Point"]        = { terms: " aoe control ", desc: ["Wave of Blood now unleashes an eruption of blood around you, dealing damage and knocking up ","nearby enemies."], skill: "Wave of Blood", slot: "Offhand" };
Blood.essences["Sprig of Hawthorn"]  = { terms: " selfbuff ", desc: ["Skewer also increases your damage done by 10% for 4 seconds."], skill: "Skewer", slot: "Offhand" };
Blood.essences["Wardstone"]          = { terms: " aoe stun ", desc: ["Umbral Lance now conjures a giant void spear that falls from the sky, damaging, knocking back ","and Stunning enemies within the area."], skill: "Umbral Lance", slot: "Offhand" };
Blood.essences["Woundwell"]          = { terms: " effectiveness up ", desc: ["Umbral Lance now throws multiple spears in an arc."], skill: "Umbral Lance", slot: "Offhand" };

// PANTS
Blood.essences["Castellatia"]           = { terms: " aoe stun ", desc: ["Sanguinate's second activation now causes you to burst into the air, damaging, knocking up ","and stunning nearby enemies."], skill: "Sanguinate", slot: "Pants" };
Blood.essences["Faces of Fading Mirth"] = { terms: " dot ", desc: ["Swarm of Bats now also poisons enemies, causing them to take continual damage for 3 seconds."], skill: "Swarm of Bats", slot: "Pants" };
Blood.essences["Journey's End"]         = { terms: " heal ", desc: ["While Abomination is active, defeating an enemy heals you for 5% of your Life, up to a maximum ","of 80% Life restored during your transformation."], skill: "Abomination", slot: "Pants" };
Blood.essences["Lianor's Misgivings"]   = { terms: " effectiveness up ", desc: ["Mephetic Cloud duration increased by 30%."], skill: "Mephetic Cloud", slot: "Pants" };
Blood.essences["Made to Wander"]        = { terms: " dash aoe movement ", desc: ["Spear Flurry now causes you to Dash forward, damaging all enemies in your path. Spear Flurry ","can be activated again up to 2 additional times."], skill: "Spear Flurry", slot: "Pants" };
Blood.essences["Nightflayer"]           = { terms: " speed movement selfbuff ", desc: ["While you remain inside Mephitic Cloud, your Attack and Movement Speed are increased by 10%."], skill: "Mephetic Cloud", slot: "Pants" };
Blood.essences["Overrun"]               = { terms: " control ", desc: ["Spear Flurry now knocks enemies into the air."], skill: "Spear Flurry", slot: "Pants" };
Blood.essences["Oversight"]             = { terms: " heal ", desc: ["Swarm of Bats now also heals you for 15% of the damage it deals."], skill: "Swarm of Bats", slot: "Pants" };
Blood.essences["Relent Not"]            = { terms: " movement control ", desc: ["Spear Flurry now causes you to run forward, damaging and knocking back all enemies in your ","path."], skill: "Spear Flurry", slot: "Pants" };
Blood.essences["Reliable Peril"]        = { terms: " aoe aura dot ", desc: ["Abomination also conjures an unholy aura around you for the duration of your transformation, ","dealing damage every second to nearby enemies."], skill: "Abomination", slot: "Pants" };

// SHOULDER
Blood.essences["Bats and Men Both"]    = { terms: " aoe ", desc: ["Swarm of Bats now unleashes a barrage of bats, damaging enemies in their path."], skill: "Swarm of Bats", slot: "Shoulder" };
Blood.essences["Bright Arrival"]       = { terms: " effectiveness up ", desc: ["While Abomination is active, defeating an enemy increases the remaining duration of Abomination ","by .4 seconds, up to a maximum increase of 4.8 seconds."], skill: "Abomination", slot: "Shoulder" };
Blood.essences["Consent to Ecstasy"]   = { terms: " selfbuff ", desc: ["While Abomination is active, defeating an enemy grants you Abomination's Might increasing your ","damage done by 3%, up to a maximum of 15% during your transformation."], skill: "Abomination", slot: "Shoulder" };
Blood.essences["Dismal Figure"]        = { terms: " debuff ", desc: ["Mephitic Cloud also causes harmful effects to last 30% longer."], skill: "Mephetic Cloud", slot: "Shoulder" };
Blood.essences["Empress Pariah"]       = { terms: " shield ", desc: ["Siphon Blood also converts 6% of the damage done into an absorb shield."], skill: "Siphon Blood", slot: "Shoulder" };
Blood.essences["Evil Thoughts"]        = { terms: " effectiveness up ", desc: ["Umbral Lance maximum charges increased by 1."], skill: "Umbral Lance", slot: "Shoulder" };
Blood.essences["Fernam's Birthmantle"] = { terms: " dot ", desc: ["Spear Flurry also causes enemies to Bleed for 3 seconds, dealing additional damage."], skill: "Spear Flurry", slot: "Shoulder" };
Blood.essences["The Numbing Edge"]     = { terms: " dot effectiveness up ", desc: ["Siphon Blood now also deals 20% increased damage to enemies suffering from continual damage ","effects."], skill: "Siphon Blood", slot: "Shoulder" };
Blood.essences["Solemn Snare"]         = { terms: " aoe movement speed ", desc: ["Swarm of Bats now shrouds you in a fog of blood mist, increasing your Movement Speed and ","making you untargetable while also dealing damage to nearby enemies."], skill: "Swarm of Bats", slot: "Shoulder" };
Blood.essences["Swarmspeaker"]         = { terms: " aoe aura ", desc: ["Swarm of Bats now engulfs you in a cloud of bats, continually damaging to nearby enemies."], skill: "Swarm of Bats", slot: "Shoulder" };

Game.classes["blood"] = Blood;