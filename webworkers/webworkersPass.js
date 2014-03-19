onmessage = function(e)
{
  if (!e.data.length) { postMessage( {ready: true} ); return; }

  var ret = [];
  for (var i = 0; i < e.data.length; ++i)
  {
    var num = e.data[i];
    var root = Math.sqrt(num);
    ret.push(root);
  }
  postMessage( ret );
  postMessage( {ready: true } );
  started = false; 
}