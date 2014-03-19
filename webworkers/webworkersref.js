onmessage = function(e)
{
  if (!e.data.byteLength) { postMessage( {ready: true} ); return; }

  var ret = new Float32Array(10000);
  var nums = new Uint32Array(e.data);

  for (var i = 0; i < nums.length; ++i)
  {
    var num = nums[i];
    var root = Math.sqrt(num);
    ret[i] = root;
  }
  postMessage( ret.buffer, [ret.buffer] );
  postMessage( {ready: true } );
  started = false; 
}