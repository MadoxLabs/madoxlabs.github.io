var started = false;

onmessage = function(e)
{
  if (started) return;
  started = true;

  postMessage("Starting...");
  for (var j = 0; j < 100000; ++j)
  {
    for (var i = 0; i < 10000; ++i)
    {
      var num = (Math.random() * 100000000 + 100000000) |0;
      var root = Math.sqrt(num);
    }
    postMessage("Completed: " + (j * 10000));
  }

  started = false; 
}