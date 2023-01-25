class Button
{
    constructor(x,y, text)
    {
        this.w = 100;
        this.h = 30;
        this.c = "#0A880A";

        this.x = x;
        this.y = y;
        this.text = text;
        this.desc = [];

        this.toggle = false;
        this.hover = false;
        this.pressed = false;
        this.visible = true;

        this.count = 0;
        Game.buttons.push(this);
    }

    resize()
    {
        this.h = 30 + this.desc.length * 14;
    }

    render()
    {
        if (!this.visible) return;

        Game.context.strokeStyle = this.c;
        Game.context.fillStyle = this.c;
        if (this.toggle)
            Game.context.fillRect( this.x, this.y, this.w, this.h);
        else
            Game.context.strokeRect( this.x, this.y, this.w, this.h);
        if (this.hover && !this.toggle)
        {
            Game.context.strokeStyle = "#F8DB4B";
            Game.context.strokeRect( this.x+5, this.y+3, this.w-10, this.h-6);
        }
        if (this.locked)
        {
            Game.context.strokeStyle = "#ff0000";
            Game.context.strokeRect( this.x+5, this.y+3, this.w-10, this.h-6);
        }

        Game.context.fillStyle = this.toggle ? "#000000" : "#ffffff";
        Game.context.font = '10pt sans-serif';
        Game.context.fillText(this.text, this.x+20, this.y+20);

        if (this.isSkill)
        {
            Game.context.beginPath();
            Game.context.strokeStyle = "#000000";
            Game.context.fillStyle = "#ffff00"
            Game.context.arc(this.x+this.w-12, this.y+15, 14, 0, 2 * Math.PI);
            Game.context.fill();
            Game.context.stroke();
            Game.context.fillStyle = "#000000"
            Game.context.font = '14pt sans-serif';
            Game.context.fillText(""+this.count, this.x+this.w-16, this.y+22);
        }

        let y = this.y+20;
        for (let d in this.desc)
        {
            y += 14;
            Game.context.fillText(this.desc[d], this.x+20, y);
        }
    }

    update()
    {
        this.hover = false;
        this.pressed = false;
        if (this.x < Game.mouse.X && Game.mouse.X < (this.x + this.w))
        {
            if (this.y < (Game.mouse.Y-40) && (Game.mouse.Y-40) < (this.y + this.h))
            {
                this.hover = true;
                if (this.visible && Game.mouse.down)
                {
                    this.pressed = true;
                }
            }
        }
    }
}

Game.init = function ()
{
    Game.Ready = false;

    Game.canvas = document.getElementById("surface");
    Game.canvas.width = 1200;
    Game.canvas.height = 800;
    Game.context = Game.canvas.getContext("2d");
    Game.mouse = new Mouse(Game.canvas);
};

Game.run = function ()
{
    if (!Game.Ready)
    {
        Game.postInit();
        Game.lastRun = window.performance.now();
    }
    else
    {
        let now = window.performance.now();
        let dt = now - Game.lastRun;
        Game.lastRun = now;
        Game.update(dt);
        Game.render();
    }
    window.requestAnimationFrame(Game.run);
};

Game.postInit = function ()
{
    document.getElementById("loading").style.display = "none";
    document.getElementById("game").style.display = "inline";
    document.getElementById("surface").style.display = "inline";
    Game.Ready = true;

    Game.msg("Ready");

    Game.slots = {}; // name : { button, essence }
    Game.slots["Head"] = null;
    Game.slots["Shoulder"] = null;
    Game.slots["Chest"] = null;
    Game.slots["Weapon"] = null;
    Game.slots["Offhand"] = null;
    Game.slots["Pants"] = null;

    Game.skills = {}; // name : button
    Game.skills["Electrocute"] = null; 
    Game.skills["Magic Missile"] = null;
    Game.skills["Arcane Torrent"] = null;
    Game.skills["Arcane Wind"] = null;
    Game.skills["Black Hole"] = null;
    Game.skills["Disintegrate"] = null;
    Game.skills["Ice Armor"] = null;
    Game.skills["Ice Crystal"] = null;
    Game.skills["Lightning Nova"] = null;
    Game.skills["Meteor"] = null;
    Game.skills["Ray of Frost"] = null;
    Game.skills["Scorch"] = null;
    Game.skills["Slow Time"] = null;
    Game.skills["Teleport"] = null;

    Game.essences = {};
    Game.essences["Cowl of the Abyss"] = { desc: ["Black Hole radius increased by 20%"], skill: "Black Hole", slot: "Head" };
    Game.essences["Crown of Arcane Truths"] = { desc: ["Scorch now launches an arcane orb that explodes when activated again or when it expires,","damaging all nearby enemies. Damage and explosion radius grow as it travels"], skill: "Scorch", slot: "Head" };
    Game.essences["Cryomancer's Helm"] = { desc: ["Ray of Frost range increased by 20%"], skill: "Ray of Frost", slot: "Head" };
    Game.essences["Fireflurry"] = { desc: ["Scorch now hurls a ball of magma that bursts when it strikes an enemy,","creating a pool of magma that Burns and Stuns enemies"], skill: "Scorch", slot: "Head" };
    Game.essences["Lyan's Resonant Wisdom"] = { desc: ["Teleport now conjures a lightning cloud at your destination,","dealing damage to all nearby enemies over 2.5 seconds"], skill: "Teleport", slot: "Head" };
    Game.essences["Mask of Illusions"] = { desc: ["Teleport now causes you to become invisible and leave behind a mirror image"], skill: "Teleport", slot: "Head" };
    Game.essences["Memory of Xiaoyu"] = { desc: ["Scorch now conjures four flaming orbs that orbit around you and explode when they strike","enemies, damaging and Burning all nearby enemies"], skill: "Scorch", slot: "Head" };
    Game.essences["Prophet's Corolla"] = { desc: ["Slow Time now blocks all enemy projectiles from entering or exiting"], skill: "Slow Time", slot: "Head" };
    Game.essences["Shiversent Stare"] = { desc: ["Ray of Frost now Freezes enemies for 2 seconds after taking damage from the ray 6 times"], skill: "Ray of Frost", slot: "Head" };
    Game.essences["The Loom"] = { desc: ["Slow Time now generates a darkened realm, disabling the use of skills and basic attacks and","greatly reducing the vision of any enemies inside the realm"], skill: "Slow Time", slot: "Head" };
    Game.essences["Vaetia's Resourceful Countenance"] = { desc: ["Scorch now launches an electric orb that explodes on impact creating an electric field that","continually Stuns and damages nearby enemies"], skill: "Scorch", slot: "Head" };
    Game.essences["Vision of the Frozen Path"] = { desc: ["Scorch now launches a frozen orb that continually damages nearby enemies and Chills them."], skill: "Scorch", slot: "Head" };

    Game.essences["Affinity Spiral"] = { desc: ["Meteor now deals 35% increased damage to Frozen targets"], skill: "Meteor", slot: "Shoulder" };
    Game.essences["Angmar's Repulsive Burden"] = { desc: ["Scorch’s Knockback distance is increased"], skill: "Scorch", slot: "Shoulder" };
    Game.essences["Arcane Intensifiers"] = { desc: ["Disintegrate will fire a stronger instantaneous beam after a short delay"], skill: "Disintegrate", slot: "Shoulder" };
    Game.essences["Csur's Fortutious Ward"] = { desc: ["Teleport now causes you to gain a shield that absorbs 1010 damage"], skill: "Teleport", slot: "Shoulder" };
    Game.essences["Extraction Harness"] = { desc: ["Teleport now also removes the last harmful effect applied to you"], skill: "Teleport", slot: "Shoulder" };
    Game.essences["Pads of Protection"] = { desc: ["Disintegrate now fractures into a short-ranged cone"], skill: "Disintegrate", slot: "Shoulder" };
    Game.essences["Phoenix Mantle"] = { desc: ["Scorch radius increased by 20%"], skill: "Scorch", slot: "Shoulder" };
    Game.essences["Rime Mantle"] = { desc: ["Enemies killed by Ray of Frost will shatter, dealing damage to all nearby enemies and inflicting","Chill"], skill: "Ray of Frost", slot: "Shoulder" };
    Game.essences["Searing Judgment"] = { desc: ["Disintegrate now channels Fire, Burning enemies for additional damage over time"], skill: "Disintegrate", slot: "Shoulder" };
    Game.essences["Shoulders of the Cataclysm"] = { desc: ["Meteor damage increased by 10%"], skill: "Meteor", slot: "Shoulder" };
    Game.essences["The Enervators"] = { desc: ["Ray of Frost now creates an ice shield each time it damages an enemy, absorbing damage","and stacking up to 10 times"], skill: "Ray of Frost", slot: "Shoulder" };
    Game.essences["The Perfect Situation"] = { desc: ["After casting Teleport, your Movement Speed is increased by 30%"], skill: "Teleport", slot: "Shoulder" };  

    Game.essences["Blazing Brunt"] = { desc: ["Lightning Nova now creates two novae that orbit you and damage any nearby enemies they hit."], skill: "Lightning Nova", slot: "Chest" };
    Game.essences["Ellora's Fervor"] = { desc: ["Lightning Nova now hurls balls of Burning fire."], skill: "Lightning Nova", slot: "Chest" };
    Game.essences["Frostreaver's Garments"] = { desc: ["Ice Crystal now summons a freezing crystal that inflicts greater damage over time and a stacking","Chill."], skill: "Ice Crystal", slot: "Chest" };
    Game.essences["Heart of the Frozen North"] = { desc: ["While Ice Armor is active, enemies attacking you are afflicted with 40% Chill for 2 seconds."], skill: "Ice Armor", slot: "Chest" };
    Game.essences["Kyn's Cryoclasp"] = { desc: ["Ray of Frost now unleashes a stronger instantaneous beam after a short delay, damaging and","freezing all enemies in its path."], skill: "Ray of Frost", slot: "Chest" };
    Game.essences["Nor the Hail Nursed"] = { desc: ["Ice Armor now also reduces damage you take."], skill: "Ice Armor", slot: "Chest" };
    Game.essences["Quiet Downpour"] = { desc: ["Lightning Nova now launches a giant nova, exploding into smaller novae when activated again","or when it arrives at its final destination."], skill: "Lightning Nova", slot: "Chest" };
    Game.essences["Regalia of the Archmage"] = { desc: ["Lightning Nova now hurls balls of Immobilizing arcane energy."], skill: "Lightning Nova", slot: "Chest" };
    Game.essences["Robes of the Avalanche"] = { desc: ["Ray of Frost now channels a blizzard around you, continually damaging and Chilling nearby","enemies."], skill: "Ray of Frost", slot: "Chest" };
    Game.essences["Starcaller's Drapery"] = { desc: ["Meteor radius increased by 20%."], skill: "Meteor", slot: "Chest" };
    Game.essences["Waking Invocation"] = { desc: ["Ray of Frost now creates an illusion that channels a beam of frost in the targeted direction."], skill: "Ray of Frost", slot: "Chest" };
    Game.essences["Zann Esu Elemental Weave"] = { desc: ["Lightning Nova now hurls balls of Chilling ice."], skill: "Lightning Nova", slot: "Chest" };

    Game.essences["Devastation"] = { desc: ["Arcane Wind now summons a tornado that damages enemies in a line, and no longer charges up.","Increases Arcane Wind's maximum charges to 2."], skill: "Arcane Wind", slot: "Weapon" };
    Game.essences["Electrospike"] = { desc: ["Electrocute leaps to 3 additional enemies."], skill: "Electrocute", slot: "Weapon" };
    Game.essences["Entropic Edge"] = { desc: ["Disintegrate damage increased by 10%."], skill: "Disintegrate", slot: "Weapon" };
    Game.essences["Force of Harakas"] = { desc: ["Magic Missile damage increased by 20%."], skill: "Magic Missile", slot: "Weapon" };
    Game.essences["Negation Blade"] = { desc: ["Black Hole also absorbs nearby enemy projectiles."], skill: "Black Hole", slot: "Weapon" };
    Game.essences["Scourcut"] = { desc: ["Disintegrate range increased by 20%."], skill: "Disintegrate", slot: "Weapon" };
    Game.essences["Staff of Baying"] = { desc: ["Arcane Torrent now launches missiles ahead of you and can be channeled while moving."], skill: "Arcane Torrent", slot: "Weapon" };
    Game.essences["Staggernick"] = { desc: ["Arcane Wind now knocks enemies up into the air with an updraft and Stuns them,","but no longer charges up"], skill: "Arcane Wind", slot: "Weapon" };
    Game.essences["Syldra's Fang"] = { desc: ["Arcane Wind can no longer be charged up, and now unleashes an icy wind, damaging and","Chilling enemies."], skill: "Arcane Wind", slot: "Weapon" };
    Game.essences["The Aimless One"] = { desc: ["Arcane Torrent now launches missiles at random enemies around you."], skill: "Arcane Torrent", slot: "Weapon" };
    Game.essences["Thunderbird's Bite"] = { desc: ["Lightning Nova damage increased by 10%."], skill: "Lightning Nova", slot: "Weapon" };
    Game.essences["Windshaper"] = { desc: ["Arcane Wind now summons a Tornado that follows enemies and continually damages all","enemies in its path."], skill: "Arcane Wind", slot: "Weapon" };
	
    Game.essences["Alder Crystal"] = { desc: ["Arcane Wind now also Freezes Chilled enemies for 1.5 seconds. Cannot occur more often","than once every 5 seconds."], skill: "Arcane Wind", slot: "Offhand" };
    Game.essences["Azkalor's Fire"] = { desc: ["Scorch damage increased by 10%."], skill: "Scorch", slot: "Offhand" };
    Game.essences["Blaster Cast"] = { desc: ["Magic Missile fires two additional missiles each dealing damage."], skill: "Magic Missile", slot: "Offhand" };
    Game.essences["Chaosrupture"] = { desc: ["Black Hole instead conjures an unstable star which explodes when it expires, damaging","and Stunning nearby enemies."], skill: "Black Hole", slot: "Offhand" };
    Game.essences["Devouring Void"] = { desc: ["Black Hole moves forward a short distance, pulling in and damaging enemies as it travels."], skill: "Black Hole", slot: "Offhand" };
    Game.essences["Halestone"] = { desc: ["Ice Armor now protects you with 6 charges of damage immunity that also Chills nearby","enemies when they attack you."], skill: "Ice Armor", slot: "Offhand" };
    Game.essences["Heart of the Storm"] = { desc: ["Ice Armor becomes Storm Armor, continually damaging nearby enemies."], skill: "Ice Armor", slot: "Offhand" };
    Game.essences["Icon of Synchronicity"] = { desc: ["Ice Armor now also grants damage absorption to your nearby allies."], skill: "Ice Armor", slot: "Offhand" };
    Game.essences["The Siphon"] = { desc: ["Casting Lightning Nova temporarily increases your movement speed by 60%."], skill: "Lightning Nova", slot: "Offhand" };
    Game.essences["Unrepentant Gale"] = { desc: ["Maximum Arcane Wind charges increased by 1."], skill: "Arcane Wind", slot: "Offhand" };
    Game.essences["Weathering Eye"] = { desc: ["Arcane Wind now also applies a 30% reduction to Movement Speed for 4 seconds."], skill: "Arcane Wind", slot: "Offhand" };
    Game.essences["Winter's Eye"] = { desc: ["Ice Armor no longer absorbs damage, instead conjuring an ice storm around you that continually","damages and Chills nearby enemies."], skill: "Ice Armor", slot: "Offhand" };

    Game.essences["Chaos Nexus"] = { desc: ["Disintegrate channels up to 3 additional beams at nearby enemies, each continually dealing","damage."], skill: "Disintegrate", slot: "Pants" };
    Game.essences["Crystal Guards"] = { desc: ["Ice Crystal cooldown decreased by 15%."], skill: "Ice Crystal", slot: "Pants" };
    Game.essences["Fragments Upon Fragments"] = { desc: ["Meteor now drops several meteorites in a direction, knocking enemies away and Stunning them."], skill: "Meteor", slot: "Pants" };
    Game.essences["Frostwalkers"] = { desc: ["Meteor now summons an icy meteor, dealing damage and covering the area with ice that deals","additional damage and Chills enemies."], skill: "Meteor", slot: "Pants" };
    Game.essences["Frozen Wellspring"] = { desc: ["Meteor now calls down a snowstorm that continually damages and Chills enemies in the area."], skill: "Meteor", slot: "Pants" };
    Game.essences["Galebringer's Leggings"] = { desc: ["Arcane Wind damage increased by 10%."], skill: "Arcane Wind", slot: "Pants" };
    Game.essences["Impact Event"] = { desc: ["Meteor now continuously calls down smaller meteors that damage enemies in the area."], skill: "Meteor", slot: "Pants" };
    Game.essences["Kavil's Grand Revelation"] = { desc: ["Enemies killed by Disintegrate will explode, dealing damage to all nearby enemies."], skill: "Disintegrate", slot: "Pants" };
    Game.essences["Ninety Nine Wild Arcana"] = { desc: ["Arcane Torrent damage increased by 10%."], skill: "Arcane Torrent", slot: "Pants" };
    Game.essences["Riftdancer's Stride"] = { desc: ["Teleport now targets a location where it also damages all nearby enemies."], skill: "Teleport", slot: "Pants" };
    Game.essences["Starcaller's Breeches"] = { desc: ["Meteor now continually damages enemies an area, but no longer Stuns."], skill: "Meteor", slot: "Pants" };
    Game.essences["Time warped Cloth"] = { desc: ["Teleport can now be recast, transporting you back to your original location."], skill: "Teleport", slot: "Pants" };

    Game.essences["Charged Stigma"] = { desc: ["Electrocute also increases your Primary Attack Speed by 6% for two seconds,","stacking up to a maximum of five times."], skill: "Electrocute", slot: "Offhand" };
    Game.essences["Crushing Weight"] = { desc: ["Teleport also increases your damage by 10% for three seconds."], skill: "Teleport", slot: "Head" };
    Game.essences["Galebrinde "] = { desc: ["Ice Armor also causes your Primary Attacks to decrease enemy Movement Speed by 40% for three seconds."], skill: "Ice Armor", slot: "Shoulder" };
    Game.essences["Novel Castigation"] = { desc: ["Arcane Torrent also fires tracking missiles that seek out enemies, dealing damage."], skill: "Arcane Torrent", slot: "Pants" };
    Game.essences["Ol' Rustic"] = { desc: ["Lightning Nova also increases your Primary Attack Speed by 30% for three seconds."], skill: "Lightning Nova", slot: "Weapon" };
    Game.essences["Rampant and Inscrutable"] = { desc: ["Lightning Nova now conjures a lightning orb that orbits you, firing chain lightning at your target","when you use your Primary Attack."], skill: "Lightning Nova", slot: "Chest" };

    Game.buttons = [];
    let y = 5;
    for ( let s in Game.slots)
    {
        let button = new Button(5, y, s);
        button.w = 150;
        button.isSlot = true;
        Game.slots[s] = { button: button, essence: null };
        y += 40;
    }

    y = 5;
    for ( let s in Game.skills)
    {
        let button = new Button(800, y, s);
        button.w = 150;
        button.isSkill = true;
        Game.skills[s] = button;
        y += 40;
    }

    y = 5;
    for ( let s in Game.essences)
    {
        let button = new Button(170, y, s + " - " + Game.essences[s].slot + " - " + Game.essences[s].skill );
        button.w = 600;
        button.desc = Game.essences[s].desc;
        button.resize();
        button.isEssence = true;
        button.essence = Game.essences[s];
        Game.essences[s].button = button;
        y += button.h + 10;
    }

    Game.countSkills();
}

Game.msg = function(txt)
{
    let obj = document.getElementById("msg");
    obj.innerText = txt;
}

Game.fireMouseEvent = function (type, mouse)
{
    for (let i in Game.buttons)
    Game.buttons[i].update();

    if (type == MouseEvent.Down && mouse.button == 0)
    {
        // click        
        for (let i in Game.buttons)
        {
            let button = Game.buttons[i];
            if (button.pressed)
            {
                if (button.isSkill)
                {
                    if (button == Game.lastSkillPressed)
                    {
                        Game.lastSkillPressed = null;
                        button.toggle = false;
                    }
                    else
                    {
                        if (Game.lastSkillPressed) Game.lastSkillPressed.toggle = false;
                        Game.lastSkillPressed = button;
                        button.toggle = true;    
                    }
                }

                if (button.isSlot)
                {
                    if (button == Game.lastSlotPressed)
                    {
                        Game.lastSlotPressed = null;
                        button.toggle = false;
                    }
                    else
                    {
                        if (Game.lastSlotPressed) Game.lastSlotPressed.toggle = false;
                        Game.lastSlotPressed = button;
                        button.toggle = true;    
                    }
                }    

                if (button.isEssence)
                {
                    // lock the essence
                    // turn off that skill
                    let slot = button.text.split("-")[1].trim();
                    if (button.locked)
                    {
                        if (Game.slots[slot].essence)
                        {
                            Game.slots[slot].button.visible = true;
                            Game.slots[slot].essence = null;
                        }                            
                        button.locked = false;
                    }
                    else
                    {
                        if (Game.slots[slot].essence)
                        {
                            Game.slots[slot].essence.button.locked = false;
                        }
                        Game.slots[slot].button.visible = false;
                        Game.slots[slot].essence = button.essence;
                        button.locked = true;
                    }
                }

                // update essences
                for (let s in Game.essences)
                {
                    let ess = Game.essences[s];

                    Game.essences[s].button.visible = true;
                    if (Game.essences[s].button.locked) continue;
                    if (Game.lastSkillPressed && (ess.skill != Game.lastSkillPressed.text)) Game.essences[s].button.visible = false;
                    if (Game.lastSlotPressed && (ess.slot != Game.lastSlotPressed.text)) Game.essences[s].button.visible = false;
                    if (Game.slots[Game.essences[s].slot].essence) Game.essences[s].button.visible = false;
                }
                Game.placeEssences();
                Game.countSkills();
            }
        }        
    }
    else if (type == MouseEvent.Down && mouse.button == 2)
    {
        // r click
    }
    else if (type == MouseEvent.Up && mouse.button == 0)
    {
        // release
    }
    else if (type == MouseEvent.Move)
    {
        if (mouse.down && mouse.button == 0)
        {
            // click drag
        }

        Game.handleHover();
    }
};

Game.handleHover = function()
{
    Game.msg("Ready. Hover over buttons for help.");
    for (let b in Game.buttons)
    {
        let button = Game.buttons[b];
        if (button.hover == false) continue;

        if (button.isSlot)
        {
            if (button.visible)
            {
                if (button.toggle)
                    Game.msg( button.text + " slot is empty. Click an essence to fill it. Click to view all essences" );
                else
                    Game.msg( button.text + " slot is empty. Click an essence to fill it. Click to view only "+button.text+" essences." );
            }
            else
            {
                if (button.toggle)
                    Game.msg( button.text + " slot is filled. Click the locked essence to empty it. Click to view all essences" );
                else
                    Game.msg( button.text + " slot is filled. Click the locked essence to empty it. Click to view only "+button.text+" essences." );
            }
        }

        if (button.isSkill)
        {
            if (button.toggle)
            {
                if (button.count == 1)
                    Game.msg( "There is "+button.count+" "+ button.text+" essence available. Click to view all essences.");
                else if (button.count == 0)
                    Game.msg( "There are no "+ button.text+" essences available. Click to view all essences.");
                else                  
                    Game.msg( "There are "+button.count+" "+ button.text+" essences available. Click to view all essences.");
            }
            else
            {
                if (button.count == 1)
                    Game.msg( "There is "+button.count+" "+ button.text+" essence available. Click to only see them");
                else if (button.count == 0)
                    Game.msg( "There are no "+ button.text+" essences available.");
                else
                    Game.msg( "There are "+button.count+" "+ button.text+" essences available. Click to only see them");
            }
        }

        if (button.isEssence)
        {
            if (button.locked)
                Game.msg("This essence is assigned to a slot. Click to unassign it.");
            else if (button.visible)
                Game.msg("Click to assign this essence to a slot.");
        }
    }
}

// main update function
Game.update = function (dt)
{
}

Game.placeEssences = function()
{
    let y = 5;
    for (let e in Game.essences)
    {
        let button = Game.essences[e].button;
        if (button.locked) 
        {
            button.y = y;
            y += button.h + 10;
        }
    }
    for (let e in Game.essences)
    {
        let button = Game.essences[e].button;
        if (button.locked) continue
        if (button.visible) 
        {
            button.y = y;
            y += button.h + 10;
        }
    }
}

Game.countSkills = function()
{
    for (let s in Game.skills)
    {
        Game.skills[s].count = 0;
    }

    let toggleExists = false;
    for (let e in Game.slots)
    {
        if (Game.slots[e].button.toggle) toggleExists = true;
    }

    for (let e in Game.essences)
    {
        let button = Game.essences[e].button;
        let slot = button.text.split("-")[1].trim();
        let skill = button.text.split("-")[2].trim();

        if (toggleExists && !Game.slots[slot].button.toggle) continue;

        if (Game.slots[slot].button.visible)
        {
            Game.skills[skill].count += 1;
        }
    }
}

Game.render = function ()
{
    // clear
    Game.context.fillStyle = "#01375f";
    Game.context.fillRect(0, 0, 1200, 800);
    Game.context.strokeStyle = "black";
    Game.context.lineWidth = 2;
    Game.context.strokeRect(0, 0, 1200, 800);

    // draw buttons
    for (let i in Game.buttons)
        Game.buttons[i].render();       
};

// when an event comes in, handle it.
// events can come from the mouse or from the UI templates
Game.handleEvent = function (e)
{
};

