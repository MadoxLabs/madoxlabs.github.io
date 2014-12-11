
onmessage = function(oEvent)
{
  log("Got model data, size " + oEvent.data.length);
  log("Starting");
  process(oEvent.data);
}

var States = {FindObjects: 1, FindTag: 2, ParseGeometry: 3, ParseModel: 4, ParseMaterial: 5, ParseConnections: 6, ParseTexture: 7 };
var groups = [];
var objects = { };
var curmesh = { type: "mesh" };
var curmodel = { type: "model" };
var curmaterial = { type: "material", models: [] };
var curTexture = { type: "texture" };

function log(msg)
{
  postMessage({ type: 2, result: indent + msg });
}

var indent = "";

function getInteger(cursor)
{
  var i = 0, v;
  i = i * 256; v = cursor.data[cursor.offset + 3]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 2]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 1]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 0]; i += v;
  cursor.offset += 4;
  return i;
}

var floatbuffer = new ArrayBuffer(4);

function getFloat(cursor)
{
  floatbuffer[0] = cursor.data[cursor.offset + 3];
  floatbuffer[1] = cursor.data[cursor.offset + 2];
  floatbuffer[2] = cursor.data[cursor.offset + 1];
  floatbuffer[3] = cursor.data[cursor.offset + 0];
  var floatview = new Float32Array(floatbuffer);
  cursor.offset += 4;
  return floatview[0];
}

var wfloatbuffer = new ArrayBuffer(8);

function getWideFloat(cursor)
{
  wfloatbuffer[0] = cursor.data[cursor.offset + 7];
  wfloatbuffer[1] = cursor.data[cursor.offset + 6];
  wfloatbuffer[2] = cursor.data[cursor.offset + 5];
  wfloatbuffer[3] = cursor.data[cursor.offset + 4];
  wfloatbuffer[4] = cursor.data[cursor.offset + 3];
  wfloatbuffer[5] = cursor.data[cursor.offset + 2];
  wfloatbuffer[6] = cursor.data[cursor.offset + 1];
  wfloatbuffer[7] = cursor.data[cursor.offset + 0];
  var floatview = new Float64Array(wfloatbuffer);
  cursor.offset += 8;
  return floatview[0];
}

function getShort(cursor)
{
  ret = cursor.data[cursor.offset];
  cursor.offset += 1;
  return ret;
}

function getChar(cursor)
{
  ret = cursor.data[cursor.offset];
  cursor.offset += 1;
  return String.fromCharCode(ret)[0];
}

function getString(cursor)
{
  var len = getShort(cursor);
  var result = "";
  for (var i = 0; i < len; i++)
    result += String.fromCharCode(cursor.data[cursor.offset+i]);

  cursor.offset += len;
  return result;
}

function getLongString(cursor)
{
  var len = getInteger(cursor);
  var result = "";
  for (var i = 0; i < len; i++)
    result += String.fromCharCode(cursor.data[cursor.offset + i]);

  cursor.offset += len;
  return result;
}

function getWideInteger(cursor)
{
  var i = 0, v;
  i = i * 256; v = cursor.data[cursor.offset + 7]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 6]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 5]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 4]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 3]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 2]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 1]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 0]; i += v;
  cursor.offset += 8;
  return i;
}

function getSmallInteger(cursor)
{
  var i = 0, v;
  i = i * 256; v = cursor.data[cursor.offset + 1]; i += v;
  i = i * 256; v = cursor.data[cursor.offset + 0]; i += v;
  cursor.offset += 2;
  return i;
}

function getBool(cursor)
{
  ret = cursor.data[cursor.offset];
  cursor.offset += 1;
  return ret ? 1 : 0;
}

function getData(cursor)
{
  var len = getInteger(cursor);
  cursor.offset += len;
  return " (" + len + " bytes)";
}

function getArrayInteger(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  cursor.offset += encodelen ? encodelen : (len*4);

  return " array is type: " + encoding + " with # items: " + len;
}

function getArrayWideInteger(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  cursor.offset += encodelen ? encodelen : (len * 8);
  return " array is type: " + encoding + " with # items: " + len;
}

function getArrayBool(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  cursor.offset += encodelen ? encodelen : len;
  return " array is type: " + encoding + " with # items: " + len;
}

function parseObjectRecord(cursor)
{
  var buf = "";

  var start = cursor.offset;
  var end = getInteger(cursor);    // end offset
  var len = getInteger(cursor);    // num properties
  var bytelen = getInteger(cursor); // properties byte length
  buf += getString(cursor);
  for (var i = 0; i < len; ++i)
  {
    if (!i) buf += ": ";
    if (i) buf += ", ";
    buf += parsePropertyRecord(cursor);
  }
  log(buf);

  if (cursor.offset != end)
  {
    log("{");
    indent += "  ";
    while (cursor.offset != end)
    {
      parseObjectRecord(cursor);
      if (end - cursor.offset == 13)
      {
        for (var i = 0; i < 13; ++i)
          if (cursor.data[cursor.offset + i] != 0) log("< expected null >");
        cursor.offset += 13;
      }
    }

    indent = indent.substr(0, indent.length - 2);
    log("}");
  }
}

function parsePropertyRecord(cursor)
{
  var type = getChar(cursor);
  if (type == 'Y') return ("(small integer) " + getSmallInteger(cursor));
  else if (type == 'C') return ("(bool) " + getBool(cursor));
  else if (type == 'I') return ("(integer) " + getInteger(cursor));
  else if (type == 'F') return ("(float) " + getFloat(cursor));
  else if (type == 'D') return ("(wide float) " + getWideFloat(cursor));
  else if (type == 'L') return ("(wide integer) " + getWideInteger(cursor));
  else if (type == 'f') return ("(float[]) " + getArrayInteger(cursor));
  else if (type == 'd') return ("(wide float[]) " + getArrayWideInteger(cursor));
  else if (type == 'l') return ("(wide integer[]) " + getArrayWideInteger(cursor));
  else if (type == 'i') return ("(integer[]) " + getArrayInteger(cursor));
  else if (type == 'b') return ("(bool[]) " + getArrayBool(cursor));
  else if (type == 'S') return ("(string) " + getLongString(cursor));
  else if (type == 'R') return ("(data) " + getData(cursor));
  else
    return "(missing type)";
}

function process(data)
{
  var bytes = new Uint8Array(data);

  // validate
  var header = "";
  for (var i = 0; i < 20; i++)
    header += String.fromCharCode(parseInt(bytes[i], 2));

  if (header != "Kaydara FBX Binary  ") log("Missing valid header");
  if (bytes[20] != 0x0) log("Missing magic number");
  if (bytes[21] != 0x1A) log("Missing magic number");
  if (bytes[22] != 0x0) log("Missing magic number");

  // first step, just parse and output what we find
  var cursor = { data: bytes, offset: 23 };
  log("File version:" + getInteger(cursor));
  while (cursor.offset != bytes.length)
    parseObjectRecord(cursor);
}
