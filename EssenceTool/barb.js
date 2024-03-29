Barb = {};

Barb.skills = {}; // name : button
     Barb.skills["Lacerate"] = null; 
     Barb.skills["Frenzy"] = null; 

     Barb.skills["Cleave"] = null; 
     Barb.skills["Hammer of the Ancients"] = null; 
     Barb.skills["Chained Spear"] = null; 
     Barb.skills["Whirlwind"] = null; 
     Barb.skills["Sprint"] = null; 
     Barb.skills["Furious Charge"] = null; 
     Barb.skills["Leap"] = null; 
     Barb.skills["Demoralize"] = null; 
     Barb.skills["Ground Stomp"] = null; 
     Barb.skills["Undying Rage"] = null; 
     Barb.skills["Grab"] = null; 
     Barb.skills["Wrath of the Berserker"] = null; 

     Barb.terms = {}; // name : button
     Barb.terms["Dash"] = null; 
     Barb.terms["Slow"] = null; 
     Barb.terms["Wind"] = null; 
     Barb.terms["Bleed"] = null; 
     Barb.terms["DoT"] = null; 
     Barb.terms["Summon"] = null; 
     Barb.terms["Stun"] = null; 
     Barb.terms["Debuff"] = null; 
     Barb.terms["Channel"] = null; 
     Barb.terms["Knockback"] = null; 
     Barb.terms["Charge"] = null; 
     Barb.terms["Gather"] = null; 
     Barb.terms["Fire"] = null; 
     Barb.terms["Buff"] = null; 
     Barb.terms["Immobilize"] = null; 
     Barb.terms["Shield"] = null; 
     Barb.terms["Heal"] = null; 
     Barb.terms["Slow"] = null; 

     Barb.essences = {};                                                                            
Barb.essences["The Hewer"] = { terms: " Dash Slow ", desc: ["Grab now causes you to charge forward and grab the first enemy you hit. If you successfully ","grab an enemy, you will carry them for a short distance, damaging enemies you run though, ","before leaping into the air and slamming them into the ground, damaging and Slowing nearby ","enemies."], skill: "Grab", slot: "Weapon" };
Barb.essences["Eager Maelstrom"] = { terms: " ", desc: ["Whirlwind radius increased, but Whirlwind movement speed decreased."], skill: "Whirlwind", slot: "Weapon" };
Barb.essences["Bitterwind"] = { terms: " Wind ", desc: ["Whirlwind now draws on the power of the wind to deal increased damage, while no longer reducing ","your Movement Speed."], skill: "Whirlwind", slot: "Weapon" };
Barb.essences["Pathraze"] = { terms: " Dash ", desc: ["Whirlwind now causes you to spin and charge forward, dealing damage to all enemies along your ","path. Maximum 3 charges."], skill: "Whirlwind", slot: "Weapon" };
Barb.essences["Svot's Reach"] = { terms: "  ", desc: ["Cleave now strikes in a full circle around you."], skill: "Cleave", slot: "Weapon" };
Barb.essences["Stonefall"] = { terms: "  ", desc: ["Hammer of the Ancients damage increased by 10%."], skill: "Hammer of the Ancients", slot: "Weapon" };
Barb.essences["The Maddening"] = { terms: "  ", desc: ["Movement speed increased by 15% while Frenzy is at its maximum stacks."], skill: "Frenzy", slot: "Weapon" };
Barb.essences["Lunatic Twin"] = { terms: "  ", desc: ["When Frenzy is fully stacked, each attack unleashes 212 damage to all enemies in front of you. ","Cannot occur more often than once every 0.4 seconds."], skill: "Frenzy", slot: "Weapon" };
Barb.essences["Rending Bite"] = { terms: " Bleed ", desc: ["Lacerate now inflicts Bleeding that deals 712 damage over (3.1-0.1) seconds."], skill: "Lacerate", slot: "Weapon" };
Barb.essences["Sellena's Iron"] = { terms: " DoT ", desc: ["Leap causes the ground to shake where you land, dealing 492 damage to all enemies in the area ","over 3 seconds."], skill: "Leap", slot: "Weapon" };
Barb.essences["North Wind"] = { terms: " Slow ", desc: ["Whirlwind now also inflicts a stacking Chill."], skill: "Whirlwind", slot: "Weapon" };
Barb.essences["Luring Club"] = { terms: "  ", desc: ["Hammer of the Ancients damage increased by 35% against Stunned enemies."], skill: "Hammer of the Ancients", slot: "Weapon" };
Barb.essences["Ragecaller"] = { terms: " Slow ", desc: ["Hammer of the Ancients is now also electrified, slowing enemy movement by 50% for 2 seconds."], skill: "Hammer of the Ancients", slot: "Weapon" };
Barb.essences["The Remembered"] = { terms: " Summon Stun ", desc: ["Hammer of the Ancients now summons a Spirit of the Ancients who stuns all ","nearby enemies and fights alongside you for a time."], skill: "Hammer of the Ancients", slot: "Offhand" };
Barb.essences["Broken Soul"] = { terms: "  ", desc: ["Wrath of the Berserker now increases Critical Hit Chance instead of Attack Speed."], skill: "Wrath of the Berserker", slot: "Offhand" };
Barb.essences["Steel Lamprey"] = { terms: " Debuff ", desc: ["Chained Spear now marks enemies for 5 seconds and heals you for 5% of the damage ","it causes to marked enemies."], skill: "Chained Spear", slot: "Offhand" };
Barb.essences["Virulent Fist"] = { terms: "  ", desc: ["Enemies killed by Cleave will explode, inflicting 220 damage on all nearby enemies."], skill: "Cleave", slot: "Offhand" };
Barb.essences["Flesh Splitter"] = { terms: "  ", desc: ["Cleave damage increased by 10%.,"], skill: "Cleave", slot: "Offhand" };
Barb.essences["The Startler"] = { terms: " Channel Knockback ", desc: ["Hammer of the Ancients now strikes the ground multiple times, knocking ","enemies up into the air with each strike, but your Movement Speed is greatly decreased ","during the assault."], skill: "Hammer of the Ancients", slot: "Offhand" };
Barb.essences["Razorgrip"] = { terms: " Charge ", desc: ["The range and damage of Hammer of the Ancients can now be increased by charging it up."], skill: "Hammer of the Ancients", slot: "Offhand" };
Barb.essences["Obin's Many Fingers"] = { terms: "  ", desc: ["Chained Spear hurls 2 additional spears.,"], skill: "Chained Spear", slot: "Offhand" };
Barb.essences["The Forgotten"] = { terms: " Gather Knockback ", desc: ["Hammer of the Ancients now throws a giant hammer that damages enemies in its ","path and knocks them away. Picking up this hammer will reduce the remaining cooldown ","on Hammer of the Ancients.,"], skill: "Hammer of the Ancients", slot: "Offhand" };
Barb.essences["Sundered Legacy"] = { terms: " DoT Fire ", desc: ["Wrath of the Berserker now causes nearby enemies to Burn.,"], skill: "Wrath of the Berserker", slot: "Offhand" };
Barb.essences["Dishonored Blade"] = { terms: "  ", desc: ["Demoralize duration increased by 30%.,"], skill: "Demoralize", slot: "Offhand" };
Barb.essences["Paste and Powder"] = { terms: "  ", desc: ["Hammer of the Ancients now randomly drops hammers in the targeted area multiple times.,"], skill: "Hammer of the Ancients", slot: "Offhand" };
Barb.essences["Oncoming Brutality"] = { terms: "  ", desc: ["Frenzy increases damage you deal to that enemy by 6% for 3 seconds, stacking up to % increase."], skill: "Frenzy", slot: "Offhand" };
Barb.essences["The Gathering"] = { terms: " Gather ", desc: ["Whirlwind pulls in all enemies it damages."], skill: "Whirlwind", slot: "Chest" };
Barb.essences["Ferocious Gale"] = { terms: " Wind ", desc: ["Whirlwind occasionally throws out tornadoes that deal 207 damage to any enemies they strike."], skill: "Whirlwind", slot: "Chest" };
Barb.essences["Armor Caste"] = { terms: " Stun ", desc: ["Furious Charge creates shock waves when colliding with walls, dealing 210 damage to ","nearby enemies and Stunning them for 1 seconds."], skill: "Furious Charge", slot: "Chest" };
Barb.essences["Davin's Legacy"] = { terms: "  ", desc: ["Hammer of the Ancients maximum charges increased by 1."], skill: "Hammer of the Ancients", slot: "Chest" };
Barb.essences["Five Fresh Claws"] = { terms: " Debuff ", desc: ["Whirlwind now shreds armor, increasing all damage enemies take by 2%, stacking ","up to 5 times."], skill: "Whirlwind", slot: "Chest" };
Barb.essences["Crusher Rig"] = { terms: "  ", desc: ["Chained Spear now hurls giant rocks, inflicting damage on all enemies in its path."], skill: "Chained Spear", slot: "Chest" };
Barb.essences["Tracker's Rage"] = { terms: " Buff ", desc: ["All damage you deal increased by 10% after activating Furious Charge."], skill: "Furious Charge", slot: "Chest" };
Barb.essences["Impaler's Breath"] = { terms: " Stun Knockback ", desc: ["Chained Spear now hurls a harpoon that knocks enemies away, damaging and Stunning them."], skill: "Chained Spear", slot: "Chest" };
Barb.essences["Cracklefell"] = { terms: " Immobilize ", desc: ["Chained Spear now hurls an electrified spear that damages and immobilizes all enemies in its path."], skill: "Chained Spear", slot: "Chest" };
Barb.essences["Lumber Cords"] = { terms: " Buff ", desc: ["Furious Charge now decreases all damage you take by 5% for 3 seconds for each enemy it hits, ","stacking up to 6 times."], skill: "Furious Charge", slot: "Chest" };
Barb.essences["Temple of Battle"] = { terms: " Gather Stun ", desc: ["Chained Spear now sweeps spears from the left and the right, gathering all enemies within ","the area into a cluster in front of you."], skill: "Chained Spear", slot: "Chest" };
Barb.essences["Manifold Gore"] = { terms: "  ", desc: ["Whirlwind damage increased by 10% for each Bleed on the enemy, up to a maximum of (10)*3%."], skill: "Whirlwind", slot: "Chest" };
Barb.essences["Charred Iron"] = { terms: " DoT Fire ", desc: ["Chained Spear now hurls a flaming spear that damages all enemies in its path and leaves a ","Burning trail."], skill: "Chained Spear", slot: "Chest" };
Barb.essences["Battlemaster's Helm"] = { terms: " Buff ", desc: ["Demoralize is replaced with a war cry that increases all damage you and nearby allies inflict."], skill: "Demoralize", slot: "Head" };
Barb.essences["Second Breath"] = { terms: "  ", desc: ["Sprint duration increased by 30%."], skill: "Sprint", slot: "Head" };
Barb.essences["Lasting Hate"] = { terms: "  ", desc: ["Wrath of the Berserker duration increased by 30%."], skill: "Wrath of the Berserker", slot: "Head" };
Barb.essences["Spiritbreaker"] = { terms: " Wind ", desc: ["Sprint also leaves tornadoes in your path that deal 189 damage to any enemies they strike."], skill: "Sprint", slot: "Head" };
Barb.essences["Ancestors’ Stele"] = { terms: "  ", desc: ["Undying Rage duration increased by 1 second."], skill: "Undying Rage", slot: "Head" };
Barb.essences["Splitting Outbreak"] = { terms: "  ", desc: ["Ground Stomp maximum charges increased by 1."], skill: "Ground Stomp", slot: "Head" };
Barb.essences["The Trembling"] = { terms: "  ", desc: ["Undying Rage also increases your Movement Speed by 50%."], skill: "Undying Rage", slot: "Head" };
Barb.essences["Grinning Effigy"] = { terms: "  ", desc: ["Taking damage during Undying Rage now triggers a counterattack for 145 damage to all nearby ","enemies. Cannot occur more often than once every 0.5 seconds."], skill: "Undying Rage", slot: "Head" };
Barb.essences["Berserker's Sanity"] = { terms: "  ", desc: ["Wrath of the Berserker now also dispels effects which cause loss of control of your character."], skill: "Wrath of the Berserker", slot: "Head" };
Barb.essences["Weighted Brow"] = { terms: "  ", desc: ["Ground Stomp range increased by 20%."], skill: "Ground Stomp", slot: "Head" };
Barb.essences["Bestial Threat"] = { terms: " Immobilize ", desc: ["Demoralize is replaced with a terrifying roar that damages all nearby enemies and Immobilizes ","them."], skill: "Demoralize", slot: "Head" };
Barb.essences["Impending Slaughter"] = { terms: " Slow ", desc: ["Demoralize is replaced with an intimidating shout that damages nearby enemies and decreases ","their attack and movement speeds."], skill: "Demoralize", slot: "Head" };
Barb.essences["Horns of Harrogath"] = { terms: " Buff ", desc: ["During Wrath of the Berserker, slaying enemies increases your damage dealt by 1% for 6 ","seconds, up to a maximum of 10%."], skill: "Wrath of the Berserker", slot: "Head" };
Barb.essences["Screaming Fury"] = { terms: " Knockback ", desc: ["Furious Charge now charges to a location, damaging all nearby enemies and knocking them into ","the air. Maximum 2 charges."], skill: "Furious Charge", slot: "Pants" };
Barb.essences["Swiftwing"] = { terms: " Buff ", desc: ["Sprint now also increases movement speed of nearby allies."], skill: "Sprint", slot: "Pants" };
Barb.essences["Juggernaut's Plan"] = { terms: " Knockback ", desc: ["Sprint now causes you to run continuously, knocking away and damaging enemies in your path."], skill: "Sprint", slot: "Pants" };
Barb.essences["Kar's Defiance"] = { terms: " Buff Shield ", desc: ["Leap also grants you a shield that absorbs 932 damage."], skill: "Leap", slot: "Pants" };
Barb.essences["Compromise is Loss"] = { terms: "  ", desc: ["Ground Stomp now rips open the ground, dealing damage to enemies in front of you. ","Maximum 2 charges."], skill: "Ground Stomp", slot: "Pants" };
Barb.essences["Flattener"] = { terms: "  ", desc: ["Leap maximum charges increased by 1."], skill: "Leap", slot: "Pants" };
Barb.essences["Haughty Behemoth"] = { terms: " Knockback ", desc: ["Leap now knocks enemies into the air when you land."], skill: "Leap", slot: "Pants" };
Barb.essences["Rockspike"] = { terms: "  ", desc: ["Ground Stomp now affects all nearby enemies."], skill: "Ground Stomp", slot: "Pants" };
Barb.essences["Scalesunder"] = { terms: " Debuff ", desc: ["Chained Spear now also shatters armor, increasing all damage enemies take by 10% for 3 seconds."], skill: "Chained Spear", slot: "Pants" };
Barb.essences["Howler's Lift"] = { terms: "  ", desc: ["Leap damage increased by 10%."], skill: "Leap", slot: "Pants" };
Barb.essences["Shattered Ground"] = { terms: " DoT ", desc: ["Ground Stomp now produces an earthquake, continually damaging enemies in the area but no ","longer Stunning them."], skill: "Ground Stomp", slot: "Pants" };
Barb.essences["Determination"] = { terms: " Charge ", desc: ["Furious Charge can now be charged up to increase its range and damage."], skill: "Furious Charge", slot: "Pants" };
Barb.essences["Ram’s Impasse"] = { terms: " Gather ", desc: ["Furious Charge now causes you to drag enemies with you, but its maximum charges are now 2."], skill: "Furious Charge", slot: "Pants" };
Barb.essences["Ydama's Cyclone"] = { terms: "  ", desc: ["Whirlwind damage increased by 10%."], skill: "Whirlwind", slot: "Shoulder" };
Barb.essences["Hell's Legacy"] = { terms: " DoT Fire ", desc: ["Sprint also leaves a trail of flames, dealing 464 damage to enemies over 4 seconds."], skill: "Sprint", slot: "Shoulder" };
Barb.essences["The Coming Storm"] = { terms: "  ", desc: ["Wrath of the Berserker cooldown decreased by 15%."], skill: "Wrath of the Berserker", slot: "Shoulder" };
Barb.essences["Drop by Drop"] = { terms: "  ", desc: ["Cleave's Bleed effect now spreads to 2 nearby enemies when it expires."], skill: "Cleave", slot: "Shoulder" };
Barb.essences["Wreckfall"] = { terms: " Buff ", desc: ["Whirlwind also reduces all damage you take by 20% while channeling."], skill: "Whirlwind", slot: "Shoulder" };
Barb.essences["Shocking Chaos"] = { terms: " Stun ", desc: ["Leap is now electrified, Stunning all nearby enemies where you land."], skill: "Leap", slot: "Shoulder" };
Barb.essences["Lonecastle"] = { terms: " Buff ", desc: ["Chance to block projectiles is increased by 50% during Whirlwind."], skill: "Whirlwind", slot: "Shoulder" };
Barb.essences["Grimroost"] = { terms: " Heal ", desc: ["Whirlwind heals you for 3% of damage done."], skill: "Whirlwind", slot: "Shoulder" };
Barb.essences["Animal Instinct"] = { terms: " Charge ", desc: ["Leap can now charge up to increase range and damage."], skill: "Leap", slot: "Shoulder" };
Barb.essences["Broken Grasp"] = { terms: " Buff ", desc: ["Sprint also increases your dodge chance by 20%."], skill: "Sprint", slot: "Shoulder" };
Barb.essences["Doom of the Cowed"] = { terms: " Slow ", desc: ["Activating Wrath of the Berserker now immediately reduces the Movement Speed of all nearby ","enemies by 80%."], skill: "Wrath of the Berserker", slot: "Shoulder" };
Barb.essences["Hatred's Reach"] = { terms: "  ", desc: ["Cleave range increased by 20%."], skill: "Cleave", slot: "Shoulder" };
Barb.essences["Loathsome Lamina"] = { terms: " Buff Shield ", desc: ["Wrath of the Berserker also grants you a shield that absorbs 932 damage."], skill: "Wrath of the Berserker", slot: "Shoulder" };

Game.classes["barb"] = Barb;
