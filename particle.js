function Particle()
{
  this.y = 100;
  this.x = Math.random() * 600;
  this.dx = Math.random() - 0.5;
  this.dy = Math.random();
  this.alive = true;
}

Particle.prototype.move = function ()
{
  this.x += this.dx;
  this.y += this.dy;
  if (this.x >= 600) this.alive = false;
  if (this.y >= 600) this.alive = false;
}
