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

Game.onClassChange = function()
{
    var e = document.getElementById("classname");
    var value = e.value;

    let data = Game.classes[value];

    Game.skills = data.skills;
    Game.terms = data.terms;
    Game.essences = data.essences;

    Game.dataSetup();
}

Game.postInit = function ()
{
    document.getElementById("loading").style.display = "none";
    document.getElementById("game").style.display = "inline";
    document.getElementById("surface").style.display = "inline";
    Game.Ready = true;

    Game.msg("Ready");
    
    Game.skills = {}; // name : button
    Game.terms = {}; // name : button
    Game.essences = {};

    Game.onClassChange();
}

Game.dataSetup = function()
{
    Game.lastSkillPressed = null;
    Game.lastSlotPressed= null;
    Game.lastTermPressed = null;
    
    Game.slots = {}; // name : { button, essence }
    Game.slots["Head"] = null;
    Game.slots["Shoulder"] = null;
    Game.slots["Chest"] = null;
    Game.slots["Weapon"] = null;
    Game.slots["Offhand"] = null;
    Game.slots["Pants"] = null;
    
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
    for ( let s in Game.terms)
    {
        let button = new Button(1000, y, s);
        button.w = 150;
        button.isTerm = true;
        Game.terms[s] = button;
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
                if (button.isTerm)
                {
                    if (button == Game.lastTermPressed)
                    {
                        Game.lastTermPressed = null;
                        button.toggle = false;
                    }
                    else
                    {
                        if (Game.lastTermPressed) Game.lastTermPressed.toggle = false;
                        Game.lastTermPressed = button;
                        button.toggle = true;    
                    }
                }
    
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
                let allterms = " ";

                for (let s in Game.essences)
                {
                    let ess = Game.essences[s];

                    Game.essences[s].button.visible = true;
                    if (Game.essences[s].button.locked) continue;
                    if (Game.lastSkillPressed && (ess.skill != Game.lastSkillPressed.text)) Game.essences[s].button.visible = false;
                    if (Game.lastSlotPressed && (ess.slot != Game.lastSlotPressed.text)) Game.essences[s].button.visible = false;
                    if (Game.lastTermPressed && (!ess.terms.includes( " "+Game.lastTermPressed.text + " "))) Game.essences[s].button.visible = false;
                    if (Game.slots[Game.essences[s].slot].essence) Game.essences[s].button.visible = false;

                    if (Game.essences[s].button.visible) allterms +=  ess.terms;
                }
                allterms += " ";

                // hide unavailable terms
                for (let s in Game.terms)
                {
                    let termButton = Game.terms[s];
                    let term = termButton.text;
                    termButton.visible = ( allterms.includes(" "+term+" ") );
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

        if (Game.lastTermPressed && (!Game.essences[e].terms.includes( Game.lastTermPressed.text))) continue;

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

