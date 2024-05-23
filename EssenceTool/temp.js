Temp = {};

     Temp.skills = {}; // name : button
     Temp.skills["Mist Touched"] = null; 
     Temp.skills["Wind Edge"] = null; 
     Temp.skills["Wave Edge"] = null;
     Temp.skills["Breaker"] = null;
     Temp.skills["Crosswinds"] = null;
     Temp.skills["Vortex"] = null;
     Temp.skills["Squal"] = null;
     Temp.skills["Blade Dance"] = null;
     Temp.skills["Cascade"] = null;
     Temp.skills["Flowing Strike"] = null;
     Temp.skills["Tidal Rush"] = null;
     Temp.skills["Zephyr Surge"] = null;
     Temp.skills["Wind Walk"] = null;
     Temp.skills["Rolling Surf"] = null;
     Temp.skills["Riptide"] = null;
     Temp.skills["Stormfury"] = null;
     Temp.skills["Zephyrs"] = null;

     Temp.terms = {}; // name : button
     Temp.terms["chill"] = null; 

     Temp.essences = {};

     Temp.essences["Anopsia Rising"]    = { terms: " ", desc: ["Cascade now conjures 1 Zephyr to slam the ground at a targeted location, pulling waves into","them that damage and pull in nearby enemies."], skill: "Cascade", slot: "Head" };
     Temp.essences["Sacred Gasp"]       = { terms: " ", desc: ["Cascade now conjures converging currents around you, damaging and knocking up nearby ","enemies. The damage and radius of the currents is increased for every Zephyr you control."], skill: "Cascade", slot: "Head" };
     Temp.essences["Dawning Smile"]     = { terms: " ", desc: ["Wind Walk cooldown is reduced."], skill: "Wind Walk", slot: "Head" };
     Temp.essences["Dream and Drown"]   = { terms: " ", desc: ["Cascade now empowers you and your Zephyrs attacks to release waves at enemies you hit, ","dealing damage to them and nearby enemies."], skill: "Cascade", slot: "Head" };
     Temp.essences["Sumptuous Swell"]   = { terms: " ", desc: ["Cascade now periodically unleashes bursts of water from you and your Zephyrs, damaging ","nearby enemies."], skill: "Cascade", slot: "Head" };
     Temp.essences["Look Leeward"]      = { terms: " ", desc: ["Squall now marks enemies briefly before it ruptures and slices through them, dealing ","damage equal to a portion of the damage you dealt to them while marked."], skill: "Squal", slot: "Head" };
     Temp.essences["Strident Bident"]   = { terms: " ", desc: ["Cascade now causes you and your Zephyrs to release a crushing wave, damaging and stunning ","enemies while also causing them to take additional damage from your next attack. Damage ","dealt to stunned enemies removes the effect."], skill: "Cascade", slot: "Head" };
     Temp.essences["Unmoored Eyes"]     = { terms: " ", desc: ["Blade Dance now throws your edges, impaling them into the first enemy they strike, damaging ","and stunning them. Your edges remain embedded in the target for a short while allowing ","you to activate the skill again to Dash behind the target, damaging all enemies along your path."], skill: "Blade Dance", slot: "Head" };
     Temp.essences["Unyielding Vision"] = { terms: " ", desc: ["Rolling Surf Critical Hits cause an explosion of water, dealing damage to nearby enemies."], skill: "Rolling Surf", slot: "Head" };
     Temp.essences["Vastwash"]          = { terms: " ", desc: ["Cascade now floods the ground, damaging enemies while empowering you and allies within, ","causing your Skills to unleash waves that crash through enemies and damage them."], skill: "Cascade", slot: "Head" };

     Temp.essences["The Shoal"]             = { terms: " ", desc: ["Vortex also shatters enemy armor, increasing the damage they take."], skill: "Vortex", slot: "Shoulder" };
     Temp.essences["Storms Without Number"] = { terms: " ", desc: ["Stormfury now empowers only you, causing every 3 Primary Attacks to release a violent storm ","around your target, damaging and pulling in nearby enemies."], skill: "Stormfury", slot: "Shoulder" };
     Temp.essences["United Defiance"]       = { terms: " ", desc: ["Flowing Strike conjures 1 additional Zephyr."], skill: "Flowing Strike", slot: "Shoulder" };
     Temp.essences["Higher Coin"]           = { terms: " ", desc: ["Zephyrs now have a shorter duration, but when they dissipate, they charge into enemies and ","explode, dealing damage to all nearby enemies."], skill: "Zephyrs", slot: "Shoulder" };
     Temp.essences["Weightless Existence"]  = { terms: " ", desc: ["Wind Walk now increases your Evasion Rating and reduces all Skill cooldowns."], skill: "Wind Walk", slot: "Shoulder" };
     Temp.essences["Bounteous Sigil"]       = { terms: " ", desc: ["Breaker cooldown is reduced."], skill: "Breaker", slot: "Shoulder" };
     Temp.essences["Safe Borders"]          = { terms: " ", desc: ["Flowing Strike can now be used while suffering from total loss of control and knockback ","effects, making you immune to their effects briefly."], skill: "Flowing Strike", slot: "Shoulder" };
     Temp.essences["Barnacle Plaque"]       = { terms: " ", desc: ["Breaker maximum charges are increased by 1."], skill: "Breaker", slot: "Shoulder" };
     Temp.essences["Depthsdrawn"]           = { terms: " ", desc: ["Breaker also increases your damage done."], skill: "Breaker", slot: "Shoulder" };
     Temp.essences["Gustgift"]              = { terms: " ", desc: ["Wind Walk now conjures a dust storm, allowing you and your allies to evade Primary ","Attacks while you remain in the storm."], skill: "Wind Walk", slot: "Shoulder" };

     Temp.essences["Charging Current"]   = { terms: " ", desc: ["Vortex now conjures a waterspout at a target location, continually damaging enemies while pulling ","them towards the center. Enemies successfully pulled to the center are knocked up into the air."], skill: "Vortex", slot: "Chest" };
     Temp.essences["Blessed Ashet"]      = { terms: " ", desc: ["Cascade also increases your Movement Speed when it strikes an enemy."], skill: "Cascade", slot: "Chest" };
     Temp.essences["Deserters Pride"]    = { terms: " ", desc: ["Cascade also increases Primary Attack Speed."], skill: "Cascade", slot: "Chest" };
     Temp.essences["Fade to Bronze"]     = { terms: " ", desc: ["Cascade also causes enemies hit to become vulnerable, taking increased Critical Hit Damage."], skill: "Cascade", slot: "Chest" };
     Temp.essences["Flitter Away"]       = { terms: " ", desc: ["Blade Dance also increases your Primary Attack Speed."], skill: "Blade Dance", slot: "Chest" };
     Temp.essences["Merchants Scale"]    = { terms: " ", desc: ["Rolling Surf also conjures 1 Zephyr."], skill: "Rolling Surf", slot: "Chest" };
     Temp.essences["Overflow"]           = { terms: " ", desc: ["Vortex now causes geysers to erupt from the ground underneath random enemies every second, ","damaging and knocking them into the air."], skill: "Vortex", slot: "Chest" };
     Temp.essences["Reverent Sage"]      = { terms: " ", desc: ["Cascade cooldown is reduced."], skill: "Cascade", slot: "Chest" };
     Temp.essences["Tidewalls Strength"] = { terms: " ", desc: ["Riptide now calls a wave that crashes into you, pulling, damaging and stunning enemies."], skill: "Riptide", slot: "Chest" };
     Temp.essences["Zephyrguard"]        = { terms: " ", desc: ["Flowing Strike now conjures a Zephyr that slashes and Stuns enemies at a targeted location, ","before you Dash forward in a flourish of edge strikes."], skill: "Flowing Strike", slot: "Chest" };

     Temp.essences["Atonement Brand"]         = { terms: " ", desc: ["Zephyr Surge deals increased damage each time it strikes the same target."], skill: "Zephyr Surge", slot: "Pants" };
     Temp.essences["Footprints in the Abyss"] = { terms: " ", desc: ["Breaker now conjures 2 Zephyrs to ride the wave, damaging enemies in their path."], skill: "Breaker", slot: "Pants" };
     Temp.essences["Flaring Lighthouse"]      = { terms: " ", desc: ["Breaker now causes you to Dash forward, damaging enemies and conjuring a Zephyr in your ","wake. Additionally, you gain an absorb shield."], skill: "Breaker", slot: "Pants" };
     Temp.essences["Isolations Grace"]        = { terms: " ", desc: ["Tidal Rush now commands a Zephyr you control to sacrifice itself for an ally to grant ","them a shield that absorbs damage and blocks projectiles."], skill: "Tidal Rush", slot: "Pants" };
     Temp.essences["Pure of Will"]            = { terms: " ", desc: ["Tidal Rush now commands your Zephyrs to charge a target location, damaging and stunning ","enemies in their path."], skill: "Tidal Rush", slot: "Pants" };
     Temp.essences["Prolix Pair"]             = { terms: " ", desc: ["Breaker now conjures 2 Zephyrs that crash together on waves, damaging and knocking back ","enemies in their path."], skill: "Breaker", slot: "Pants" };
     Temp.essences["Truth as Treasure"]       = { terms: " ", desc: ["Mist-Toucheds cooldown is reduced for every Skill you cast."], skill: "Mist Touched", slot: "Pants" };
     Temp.essences["Seafarers Trows"]         = { terms: " ", desc: ["Flowing Strike also grants you increased damage for a short time."], skill: "Flowing Strike", slot: "Pants" };
     Temp.essences["Waverider"]               = { terms: " ", desc: ["Breaker now causes you to Dash forward, damaging and knocking back enemies in your path ","while also conjuring a Zephyr at your destination."], skill: "Breaker", slot: "Pants" };
     Temp.essences["Windswept Promise"]       = { terms: " ", desc: ["Zephyrs now also increase your Attack Speed for each you control."], skill: "Zephyrs", slot: "Pants" };

     Temp.essences["A Thousand Dooms"]        = { terms: " ", desc: ["Squall now causes you and your Zephyrs to swiftly slash forward and damaging enemies and ","shattering their armor increasing all damage they take."], skill: "Squal", slot: "Weapon" };
     Temp.essences["Chsaad Dhuth"]            = { terms: " ", desc: ["Rolling Surf now empowers your edges, causing you and your Zephyrs Primary Attacks to ","become sweeping sword slashes."], skill: "Rolling Surf", slot: "Weapon" };
     Temp.essences["Fiendfell"]               = { terms: " ", desc: ["Wind Edge becomes empowered periodically, causing your next attack to unleash a piercing ","wind that slices through enemies, dealing damage and shattering their armor, causing them ","to take increased damage."], skill: "Wind Edge", slot: "Weapon" };
     Temp.essences["Flooded Stream"]          = { terms: " ", desc: ["Rolling Surf now empowers your edges, causing you and your Zephyrs Primary Attacks to ","become swirling whip strikes."], skill: "Rolling Surf", slot: "Weapon" };
     Temp.essences["Grassblade Edge"]         = { terms: " ", desc: ["Wind Walk duration is increased."], skill: "Wind Walk", slot: "Weapon" };
     Temp.essences["Harmonious Castill"]      = { terms: " ", desc: ["Squall now makes you untargetable and causes you and your Zephyrs to Dash forward, ","damaging enemies in your paths."], skill: "Squal", slot: "Weapon" };
     Temp.essences["Mehrwens Humility"]       = { terms: " ", desc: ["Wind Walk also removes all non-loss of control harmful effects."], skill: "Wind Walk", slot: "Weapon" };
     Temp.essences["Paean of Pools"]          = { terms: " ", desc: ["Wave Edge also conjures a Zephyr for after striking the same enemy multiple times."], skill: "Wave Edge", slot: "Weapon" };
     Temp.essences["Shriekworth"]             = { terms: " ", desc: ["Crosswinds Critical Hits cause 4 blades of wind to shatter off the target, dealing ","additional damage to nearby enemies."], skill: "Crosswinds", slot: "Weapon" };
     Temp.essences["Spiral Guidance"]         = { terms: " ", desc: ["Squall is now Channeled, causing you and your Zephyrs to periodically unleash wind ","slashes, dealing damage to enemies in their path."], skill: "Squal", slot: "Weapon" };

     Temp.essences["Mistwhisper"]        = { terms: " ", desc: ["Zephyr Surge now causes you to become untargetable and Dash at an enemy, unleashing a ","series of rapid strikes against them, with each Zephyr consumed granting additional strikes."], skill: "Zephyr Surge", slot: "Offhand" };
     Temp.essences["Hurricane Hitch"]    = { terms: " ", desc: ["Crosswinds now empowers your edges with wind, causing you and your Zephyrs Primary ","Attacks to unleash wind blades, damaging enemies."], skill: "Crosswinds", slot: "Offhand" };
     Temp.essences["No Second Chances"]  = { terms: " ", desc: ["Wind Edge becomes empowered when you use a Skill, causing several Primary Attacks to ","deal additional damage to nearby enemies."], skill: "Wind Edge", slot: "Offhand" };
     Temp.essences["Cyclones Call"]      = { terms: " ", desc: ["Crosswinds is now Channeled and can be cast while moving, causing you and your Zephyrs ","to spin, launching wind blades that damage nearby enemies."], skill: "Crosswinds", slot: "Offhand" };
     Temp.essences["Dine on Fishtails"]  = { terms: " ", desc: ["Zephyr Surge can now be charged to increase its damage, allowing you to unleash a ","powerful slash of air, with each Zephyr consumed also increasing the Critical Hit Chance of the ","attack."], skill: "Zephyr Surge", slot: "Offhand" };
     Temp.essences["Samilian Windbrush"] = { terms: " ", desc: ["Blade Dance maximum charges increased by 1."], skill: "Blade Dance", slot: "Offhand" };
     Temp.essences["Maarozhi Spine"]     = { terms: " ", desc: ["Zephyr damage increased."], skill: "Zephyrs", slot: "Offhand" };
     Temp.essences["Glory to Ksathra"]   = { terms: " ", desc: ["Vortex also increases your Primary Attack Speed after hitting an enemy."], skill: "Vortex", slot: "Offhand" };
     Temp.essences["Echoing Sky"]        = { terms: " ", desc: ["Crosswinds now causes you and your Zephyrs to launch wind blades, damaging and Slowing ","enemies."], skill: "Crosswinds", slot: "Offhand" };
     Temp.essences["Sip of the Breath"]  = { terms: " ", desc: ["Mist-Touched Orbs also increase your Attack and Movement Speed."], skill: "Mist Touched", slot: "Offhand" };

     Game.classes["temp"] = Temp;