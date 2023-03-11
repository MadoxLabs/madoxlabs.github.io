Wiz = {};

     Wiz.skills = {}; // name : button
     Wiz.skills["Electrocute"] = null; 
     Wiz.skills["Magic Missile"] = null;
     Wiz.skills["Arcane Torrent"] = null;
     Wiz.skills["Arcane Wind"] = null;
     Wiz.skills["Black Hole"] = null;
     Wiz.skills["Disintegrate"] = null;
     Wiz.skills["Ice Armor"] = null;
     Wiz.skills["Ice Crystal"] = null;
     Wiz.skills["Lightning Nova"] = null;
     Wiz.skills["Meteor"] = null;
     Wiz.skills["Ray of Frost"] = null;
     Wiz.skills["Scorch"] = null;
     Wiz.skills["Slow Time"] = null;
     Wiz.skills["Teleport"] = null;

     Wiz.terms = {}; // name : button
     Wiz.terms["chill"] = null; 
     Wiz.terms["knockback"] = null;
     Wiz.terms["stun"] = null;
     Wiz.terms["freeze"] = null;
     Wiz.terms["burn"] = null;
     Wiz.terms["dash"] = null;
     Wiz.terms["movement"] = null;
     Wiz.terms["speed"] = null;
     Wiz.terms["shield"] = null;
     Wiz.terms["heal"] = null;
     Wiz.terms["buff"] = null;
     Wiz.terms["selfbuff"] = null;
     Wiz.terms["debuff"] = null;
     Wiz.terms["atk speed"] = null;
     Wiz.terms["autoaim"] = null;
     Wiz.terms["aura"] = null;
     Wiz.terms["aoe"] = null;
     Wiz.terms["effectiveness up"] = null;
     Wiz.terms["primary"] = null;
     Wiz.terms["summon"] = null;

     Wiz.essences = {};
     Wiz.essences["Cowl of the Abyss"] = { terms: " effectiveness up ", desc: ["Black Hole radius increased by 20%"], skill: "Black Hole", slot: "Head" };
     Wiz.essences["Crown of Arcane Truths"] = { terms: " aoe ", desc: ["Scorch now launches an arcane orb that explodes when activated again or when it expires,","damaging all nearby enemies. Damage and explosion radius grow as it travels"], skill: "Scorch", slot: "Head" };
     Wiz.essences["Cryomancer's Helm"] = { terms: " effectiveness up ", desc: ["Ray of Frost range increased by 20%"], skill: "Ray of Frost", slot: "Head" };
     Wiz.essences["Fireflurry"] = { terms: " burn stun aoe ", desc: ["Scorch now hurls a ball of magma that bursts when it strikes an enemy,","creating a pool of magma that Burns and Stuns enemies"], skill: "Scorch", slot: "Head" };
     Wiz.essences["Lyan's Resonant Wisdom"] = { terms: " aoe dash ", desc: ["Teleport now conjures a lightning cloud at your destination,","dealing damage to all nearby enemies over 2.5 seconds"], skill: "Teleport", slot: "Head" };
     Wiz.essences["Mask of Illusions"] = { terms: " selfbuff dash ", desc: ["Teleport now causes you to become invisible and leave behind a mirror image"], skill: "Teleport", slot: "Head" };
     Wiz.essences["Memory of Xiaoyu"] = { terms: " aura ", desc: ["Scorch now conjures four flaming orbs that orbit around you and explode when they strike","enemies, damaging and Burning all nearby enemies"], skill: "Scorch", slot: "Head" };
     Wiz.essences["Prophet's Corolla"] = { terms: " shield ", desc: ["Slow Time now blocks all enemy projectiles from entering or exiting"], skill: "Slow Time", slot: "Head" };
     Wiz.essences["Shiversent Stare"] = { terms: " freeze ", desc: ["Ray of Frost now Freezes enemies for 2 seconds after taking damage from the ray 6 times"], skill: "Ray of Frost", slot: "Head" };
     Wiz.essences["The Loom"] = { terms: " debuff ", desc: ["Slow Time now generates a darkened realm, disabling the use of skills and basic attacks and","greatly reducing the vision of any enemies inside the realm"], skill: "Slow Time", slot: "Head" };
     Wiz.essences["Vaetia's Resourceful Countenance"] = { terms: " stun aoe ", desc: ["Scorch now launches an electric orb that explodes on impact creating an electric field that","continually Stuns and damages nearby enemies"], skill: "Scorch", slot: "Head" };
     Wiz.essences["Vision of the Frozen Path"] = { terms: " chill aoe ", desc: ["Scorch now launches a frozen orb that continually damages nearby enemies and Chills them."], skill: "Scorch", slot: "Head" };

     Wiz.essences["Affinity Spiral"] = { terms: " effectiveness up freeze ", desc: ["Meteor now deals 35% increased damage to Frozen targets"], skill: "Meteor", slot: "Shoulder" };
     Wiz.essences["Angmar's Repulsive Burden"] = { terms: " knockback effectiveness up ", desc: ["Scorch’s Knockback distance is increased"], skill: "Scorch", slot: "Shoulder" };
     Wiz.essences["Arcane Intensifiers"] = { terms: " effectiveness up ", desc: ["Disintegrate will fire a stronger instantaneous beam after a short delay"], skill: "Disintegrate", slot: "Shoulder" };
     Wiz.essences["Csur's Fortutious Ward"] = { terms: " dash shield ", desc: ["Teleport now causes you to gain a shield that absorbs damage"], skill: "Teleport", slot: "Shoulder" };
     Wiz.essences["Extraction Harness"] = { terms: " dash heal ", desc: ["Teleport now also removes the last harmful effect applied to you"], skill: "Teleport", slot: "Shoulder" };
     Wiz.essences["Pads of Protection"] = { terms: " effectiveness up ", desc: ["Disintegrate now fractures into a short-ranged cone"], skill: "Disintegrate", slot: "Shoulder" };
     Wiz.essences["Phoenix Mantle"] = { terms: " effectiveness up ", desc: ["Scorch radius increased by 20%"], skill: "Scorch", slot: "Shoulder" };
     Wiz.essences["Rime Mantle"] = { terms: " chill aoe ", desc: ["Enemies killed by Ray of Frost will shatter, dealing damage to all nearby enemies and inflicting","Chill"], skill: "Ray of Frost", slot: "Shoulder" };
     Wiz.essences["Searing Judgment"] = { terms: " burn ", desc: ["Disintegrate now channels Fire, Burning enemies for additional damage over time"], skill: "Disintegrate", slot: "Shoulder" };
     Wiz.essences["Shoulders of the Cataclysm"] = { terms: " effectiveness up ", desc: ["Meteor damage increased by 10%"], skill: "Meteor", slot: "Shoulder" };
     Wiz.essences["The Enervators"] = { terms: " shield ", desc: ["Ray of Frost now creates an ice shield each time it damages an enemy, absorbing damage","and stacking up to 10 times"], skill: "Ray of Frost", slot: "Shoulder" };
     Wiz.essences["The Perfect Situation"] = { terms: " dash speed ", desc: ["After casting Teleport, your Movement Speed is increased by 30%"], skill: "Teleport", slot: "Shoulder" };  

     Wiz.essences["Blazing Brunt"] = { terms: " aura ", desc: ["Lightning Nova now creates two novae that orbit you and damage any nearby enemies they hit."], skill: "Lightning Nova", slot: "Chest" };
     Wiz.essences["Ellora's Fervor"] = { terms: " burn ", desc: ["Lightning Nova now hurls balls of Burning fire."], skill: "Lightning Nova", slot: "Chest" };
     Wiz.essences["Frostreaver's Garments"] = { terms: " aoe chill ", desc: ["Ice Crystal now summons a freezing crystal that inflicts greater damage over time and a stacking","Chill."], skill: "Ice Crystal", slot: "Chest" };
     Wiz.essences["Heart of the Frozen North"] = { terms: " chill ", desc: ["While Ice Armor is active, enemies attacking you are afflicted with 40% Chill for 2 seconds."], skill: "Ice Armor", slot: "Chest" };
     Wiz.essences["Kyn's Cryoclasp"] = { terms: " effectiveness up freeze ", desc: ["Ray of Frost now unleashes a stronger instantaneous beam after a short delay, damaging and","freezing all enemies in its path."], skill: "Ray of Frost", slot: "Chest" };
     Wiz.essences["Nor the Hail Nursed"] = { terms: " shield ", desc: ["Ice Armor now also reduces damage you take."], skill: "Ice Armor", slot: "Chest" };
     Wiz.essences["Quiet Downpour"] = { terms: " aoe ", desc: ["Lightning Nova now launches a giant nova, exploding into smaller novae when activated again","or when it arrives at its final destination."], skill: "Lightning Nova", slot: "Chest" };
     Wiz.essences["Regalia of the Archmage"] = { terms: " stun ", desc: ["Lightning Nova now hurls balls of Immobilizing arcane energy."], skill: "Lightning Nova", slot: "Chest" };
     Wiz.essences["Robes of the Avalanche"] = { terms: " aura chill ", desc: ["Ray of Frost now channels a blizzard around you, continually damaging and Chilling nearby","enemies."], skill: "Ray of Frost", slot: "Chest" };
     Wiz.essences["Starcaller's Drapery"] = { terms: " effectiveness up ", desc: ["Meteor radius increased by 20%."], skill: "Meteor", slot: "Chest" };
     Wiz.essences["Waking Invocation"] = { terms: " summon ", desc: ["Ray of Frost now creates an illusion that channels a beam of frost in the targeted direction."], skill: "Ray of Frost", slot: "Chest" };
     Wiz.essences["Zann Esu Elemental Weave"] = { terms: " chill ", desc: ["Lightning Nova now hurls balls of Chilling ice."], skill: "Lightning Nova", slot: "Chest" };

     Wiz.essences["Devastation"] = { terms: " effectiveness up ", desc: ["Arcane Wind now summons a tornado that damages enemies in a line, and no longer charges up.","Increases Arcane Wind's maximum charges to 2."], skill: "Arcane Wind", slot: "Weapon" };
     Wiz.essences["Electrospike"] = { terms: " effectiveness up ", desc: ["Electrocute leaps to 3 additional enemies."], skill: "Electrocute", slot: "Weapon" };
     Wiz.essences["Entropic Edge"] = { terms: " effectiveness up ", desc: ["Disintegrate damage increased by 10%."], skill: "Disintegrate", slot: "Weapon" };
     Wiz.essences["Force of Harakas"] = { terms: " effectiveness up ", desc: ["Magic Missile damage increased by 20%."], skill: "Magic Missile", slot: "Weapon" };
     Wiz.essences["Negation Blade"] = { terms: " shield ", desc: ["Black Hole also absorbs nearby enemy projectiles."], skill: "Black Hole", slot: "Weapon" };
     Wiz.essences["Scourcut"] = { terms: " effectiveness up ", desc: ["Disintegrate range increased by 20%."], skill: "Disintegrate", slot: "Weapon" };
     Wiz.essences["Staff of Baying"] = { terms: " movement ", desc: ["Arcane Torrent now launches missiles ahead of you and can be channeled while moving."], skill: "Arcane Torrent", slot: "Weapon" };
     Wiz.essences["Staggernick"] = { terms: " stun ", desc: ["Arcane Wind now knocks enemies up into the air with an updraft and Stuns them,","but no longer charges up"], skill: "Arcane Wind", slot: "Weapon" };
     Wiz.essences["Syldra's Fang"] = { terms: " chill ", desc: ["Arcane Wind can no longer be charged up, and now unleashes an icy wind, damaging and","Chilling enemies."], skill: "Arcane Wind", slot: "Weapon" };
     Wiz.essences["The Aimless One"] = { terms: " autoaim ", desc: ["Arcane Torrent now launches missiles at random enemies around you."], skill: "Arcane Torrent", slot: "Weapon" };
     Wiz.essences["Thunderbird's Bite"] = { terms: " effectiveness up ", desc: ["Lightning Nova damage increased by 10%."], skill: "Lightning Nova", slot: "Weapon" };
     Wiz.essences["Windshaper"] = { terms: " autoaim ", desc: ["Arcane Wind now summons a Tornado that follows enemies and continually damages all","enemies in its path."], skill: "Arcane Wind", slot: "Weapon" };
	
     Wiz.essences["Alder Crystal"] = { terms: " freeze chill ", desc: ["Arcane Wind now also Freezes Chilled enemies for seconds. Cannot occur more often","than once every seconds."], skill: "Arcane Wind", slot: "Offhand" };
     Wiz.essences["Azkalor's Fire"] = { terms: " effectiveness up ", desc: ["Scorch damage increased by 10%."], skill: "Scorch", slot: "Offhand" };
     Wiz.essences["Blaster Cast"] = { terms: " effectiveness up ", desc: ["Magic Missile fires two additional missiles each dealing damage."], skill: "Magic Missile", slot: "Offhand" };
     Wiz.essences["Chaosrupture"] = { terms: " stun aoe ", desc: ["Black Hole instead conjures an unstable star which explodes when it expires, damaging","and Stunning nearby enemies."], skill: "Black Hole", slot: "Offhand" };
     Wiz.essences["Devouring Void"] = { terms: " effectiveness up ", desc: ["Black Hole moves forward a short distance, pulling in and damaging enemies as it travels."], skill: "Black Hole", slot: "Offhand" };
     Wiz.essences["Halestone"] = { terms: " selfbuff shield chill ", desc: ["Ice Armor now protects you with 6 charges of damage immunity that also Chills nearby","enemies when they attack you."], skill: "Ice Armor", slot: "Offhand" };
     Wiz.essences["Heart of the Storm"] = { terms: " aura aoe ", desc: ["Ice Armor becomes Storm Armor, continually damaging nearby enemies."], skill: "Ice Armor", slot: "Offhand" };
     Wiz.essences["Icon of Synchronicity"] = { terms: " buff ", desc: ["Ice Armor now also grants damage absorption to your nearby allies."], skill: "Ice Armor", slot: "Offhand" };
     Wiz.essences["The Siphon"] = { terms: " speed ", desc: ["Casting Lightning Nova temporarily increases your movement speed by 60%."], skill: "Lightning Nova", slot: "Offhand" };
     Wiz.essences["Unrepentant Gale"] = { terms: " effectiveness up ", desc: ["Maximum Arcane Wind charges increased by 1."], skill: "Arcane Wind", slot: "Offhand" };
     Wiz.essences["Weathering Eye"] = { terms: " debuff ", desc: ["Arcane Wind now also applies a 30% reduction to Movement Speed for 4 seconds."], skill: "Arcane Wind", slot: "Offhand" };
     Wiz.essences["Winter's Eye"] = { terms: " aoe chill ", desc: ["Ice Armor no longer absorbs damage, instead conjuring an ice storm around you that continually","damages and Chills nearby enemies."], skill: "Ice Armor", slot: "Offhand" };

     Wiz.essences["Chaos Nexus"] = { terms: " effectiveness up ", desc: ["Disintegrate channels up to 3 additional beams at nearby enemies, each continually dealing","damage."], skill: "Disintegrate", slot: "Pants" };
     Wiz.essences["Crystal Guards"] = { terms: " effectiveness up ", desc: ["Ice Crystal cooldown decreased by 15%."], skill: "Ice Crystal", slot: "Pants" };
     Wiz.essences["Fragments Upon Fragments"] = { terms: " knockback stun ", desc: ["Meteor now drops several meteorites in a direction, knocking enemies away and Stunning them."], skill: "Meteor", slot: "Pants" };
     Wiz.essences["Frostwalkers"] = { terms: " aoe chill ", desc: ["Meteor now summons an icy meteor, dealing damage and covering the area with ice that deals","additional damage and Chills enemies."], skill: "Meteor", slot: "Pants" };
     Wiz.essences["Frozen Wellspring"] = { terms: " aoe chill ", desc: ["Meteor now calls down a snowstorm that continually damages and Chills enemies in the area."], skill: "Meteor", slot: "Pants" };
     Wiz.essences["Galebringer's Leggings"] = { terms: " effectiveness up ", desc: ["Arcane Wind damage increased by 10%."], skill: "Arcane Wind", slot: "Pants" };
     Wiz.essences["Impact Event"] = { terms: " aoe ", desc: ["Meteor now continuously calls down smaller meteors that damage enemies in the area."], skill: "Meteor", slot: "Pants" };
     Wiz.essences["Kavil's Grand Revelation"] = { terms: " aoe ", desc: ["Enemies killed by Disintegrate will explode, dealing damage to all nearby enemies."], skill: "Disintegrate", slot: "Pants" };
     Wiz.essences["Ninety Nine Wild Arcana"] = { terms: " effectiveness up ", desc: ["Arcane Torrent damage increased by 10%."], skill: "Arcane Torrent", slot: "Pants" };
     Wiz.essences["Riftdancer's Stride"] = { terms: " aoe dash ", desc: ["Teleport now targets a location where it also damages all nearby enemies."], skill: "Teleport", slot: "Pants" };
     Wiz.essences["Starcaller's Breeches"] = { terms: " aoe ", desc: ["Meteor now continually damages enemies an area, but no longer Stuns."], skill: "Meteor", slot: "Pants" };
     Wiz.essences["Time warped Cloth"] = { terms: " dash movement ", desc: ["Teleport can now be recast, transporting you back to your original location."], skill: "Teleport", slot: "Pants" };

     Wiz.essences["Charged Stigma"] = { terms: " atk speed primary ", desc: ["Electrocute also increases your Primary Attack Speed by 6% for two seconds,","stacking up to a maximum of five times."], skill: "Electrocute", slot: "Offhand" };
     Wiz.essences["Crushing Weight"] = { terms: " dash selfbuff ", desc: ["Teleport also increases your damage by 10% for three seconds."], skill: "Teleport", slot: "Head" };
     Wiz.essences["Galebrinde "] = { terms: " primary debuff ", desc: ["Ice Armor also causes your Primary Attacks to decrease enemy Movement Speed by 40% for","three seconds."], skill: "Ice Armor", slot: "Shoulder" };
     Wiz.essences["Novel Castigation"] = { terms: " autoaim ", desc: ["Arcane Torrent also fires tracking missiles that seek out enemies, dealing damage."], skill: "Arcane Torrent", slot: "Pants" };
     Wiz.essences["Ol' Rustic"] = { terms: " primary atk speed ", desc: ["Lightning Nova also increases your Primary Attack Speed by 30% for three seconds."], skill: "Lightning Nova", slot: "Weapon" };
     Wiz.essences["Rampant and Inscrutable"] = { terms: " summon primary ", desc: ["Lightning Nova now conjures a lightning orb that orbits you, firing chain","lightning at your target when you use your Primary Attack."], skill: "Lightning Nova", slot: "Chest" };

     Wiz.essences["Sticle Burr"] = { terms: " aoe ", desc: ["When Magic Missile deals a critical hit, it explodes and deals additional damage to all nearby enemies."], skill: "Magic Missile", slot: "Offhand" };
     Wiz.essences["Silver LIning"] = { terms: " selfbuff ", desc: ["Black Hole now devours the power of enemies caught within it, increasing the damage you deal","for 2 seconds"], skill: "Black Hole", slot: "Head" };
     Wiz.essences["Spars of Energy "] = { terms: " effectiveness up ", desc: ["Generate a charge of Teleport when you defeat an enemy."], skill: "Teleport", slot: "Shoulder" };
     Wiz.essences["Greaves of the Firmament"] = { terms: " effectiveness up ", desc: ["Disintegrate deals additional damage every 3 hits"], skill: "Disintegrate", slot: "Pants" };
     Wiz.essences["Thistle Bloom"] = { terms: " aoe gather ", desc: ["Arcane Wind now conjures a storm that grows over time, pulling in and damaging nearby enemies."], skill: "Arcane Wind", slot: "Weapon" };
     Wiz.essences["Coat of the Astrum"] = { terms: " asutoaim effectiveness up ", desc: ["Lightning Nova now unleashes a single, uncontrollable arc that jumps chaotically between enemies."], skill: "Lightning Nova", slot: "Chest" };

     Game.classes["wiz"] = Wiz;