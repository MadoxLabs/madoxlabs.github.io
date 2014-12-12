importScripts('pako.js');

onmessage = function(oEvent)
{
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
function debug(msg)
{
  postMessage({ type: 2, result: indent + msg });
}

var indent = "";

var intbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 4);
var intbytes = new Uint8Array(intbuffer);
var intview = new Uint32Array(intbuffer);

function getInteger(cursor)
{
  intbytes[0] = cursor.data[cursor.offset + 0];
  intbytes[1] = cursor.data[cursor.offset + 1];
  intbytes[2] = cursor.data[cursor.offset + 2];
  intbytes[3] = cursor.data[cursor.offset + 3];
  cursor.offset += 4;
  return intview[0];
}

var floatbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 4);
var floatbytes = new Uint8Array(floatbuffer);
var floatview = new Float32Array(floatbuffer);

function getFloat(cursor)
{
  floatbytes[0] = cursor.data[cursor.offset + 0];
  floatbytes[1] = cursor.data[cursor.offset + 1];
  floatbytes[2] = cursor.data[cursor.offset + 2];
  floatbytes[3] = cursor.data[cursor.offset + 3];
  cursor.offset += 4;
  return floatview[0];
}

var wfloatbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 8);
var wfloatbytes = new Uint8Array(wfloatbuffer);
var wfloatview = new Float64Array(wfloatbuffer);

function getWideFloat(cursor)
{
  wfloatbytes[0] = cursor.data[cursor.offset + 0];
  wfloatbytes[1] = cursor.data[cursor.offset + 1];
  wfloatbytes[2] = cursor.data[cursor.offset + 2];
  wfloatbytes[3] = cursor.data[cursor.offset + 3];
  wfloatbytes[4] = cursor.data[cursor.offset + 4];
  wfloatbytes[5] = cursor.data[cursor.offset + 5];
  wfloatbytes[6] = cursor.data[cursor.offset + 6];
  wfloatbytes[7] = cursor.data[cursor.offset + 7];
  cursor.offset += 8;
  return wfloatview[0];
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

var wintbuffer = new ArrayBuffer(Uint8Array.BYTES_PER_ELEMENT * 4);
var wintbytes = new Uint8Array(wintbuffer);
var wintview = new Uint32Array(wintbuffer);

function getWideInteger(cursor)
{
  wintbytes[0] = cursor.data[cursor.offset + 0];
  wintbytes[1] = cursor.data[cursor.offset + 1];
  wintbytes[2] = cursor.data[cursor.offset + 2];
  wintbytes[3] = cursor.data[cursor.offset + 3];
//  wintbytes[4] = cursor.data[cursor.offset + 4];
//  wintbytes[5] = cursor.data[cursor.offset + 5];
//  wintbytes[6] = cursor.data[cursor.offset + 6];
//  wintbytes[7] = cursor.data[cursor.offset + 7];
  cursor.offset += 8;
  return wintview[0];
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

function getArrayFloat(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getFloat(mycursor));
  }
  return ret;
}

function getArrayWideFloat(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getWideFloat(mycursor));
  }
  return ret;
}

function getArrayInteger(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding)
  {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getInteger(mycursor));
  }
  return ret;
}

function getArrayWideInteger(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getWideInteger(mycursor));
  }
  return ret;
}

function getArrayBool(cursor)
{
  var len = getInteger(cursor);
  var encoding = getInteger(cursor);
  var encodelen = getInteger(cursor);

  var mycursor = cursor;
  if (encoding) {
    var zip = new Uint8Array(encodelen);
    for (var i = 0; i < encodelen; ++i) zip[i] = cursor.data[cursor.offset + i];
    var unzip = pako.inflate(zip);
    cursor.offset += encodelen;
    mycursor = { data: unzip, offset: 0 }
  }

  var ret = [];
  for (var i = 0; i < len; ++i) {
    ret.push(getBool(mycursor));
  }
  return ret;
}

function parseObjectRecord(obj, cursor)
{
  var buf = "";

  var start = cursor.offset;
  var end = getInteger(cursor);    // end offset
  var len = getInteger(cursor);    // num properties
  var bytelen = getInteger(cursor); // properties byte length

  var name = getString(cursor);
  buf += name;
  if (obj[name])
  {
    if (Array.isArray(obj[name]) == false)
    {
      var tmp = obj[name];
      obj[name] = [];
      obj[name].push(tmp);
    }
    var tmp = {};
    obj[name].push(tmp);
    obj = tmp;
  }
  else
  {
    obj[name] = {};
    obj = obj[name];
  }

  for (var i = 0; i < len; ++i)
  {
    if (buf.length > 1000)  {     debug(buf);     buf = "";    }
    if (!i) buf += ": ";
    if (i) buf += ", ";
    var val = parsePropertyRecord(cursor);
    buf += val.toString();
    obj[i] = val;
  }
  debug(buf);

  if (!end)    return false;

  if (cursor.offset != end)
  {
    debug("{");
    indent += "  ";
    while (cursor.offset != end)
    {
      parseObjectRecord(obj, cursor);
      if (end - cursor.offset == 13)
      {
        for (var i = 0; i < 13; ++i)
          if (cursor.data[cursor.offset + i] != 0) debug("< expected null >");
        cursor.offset += 13;
      }
    }

    indent = indent.substr(0, indent.length - 2);
    debug("}");
  }

  return true;
}

function parsePropertyRecord(cursor)
{
  var type = getChar(cursor);
  if (type == 'Y')      return (/* "(small integer) "  + */ getSmallInteger(cursor));
  else if (type == 'C') return (/* "(bool) "           + */ getBool(cursor));
  else if (type == 'I') return (/* "(integer) "        + */ getInteger(cursor));
  else if (type == 'F') return (/* "(float) "          + */ getFloat(cursor));
  else if (type == 'D') return (/* "(wide float) "     + */ getWideFloat(cursor));
  else if (type == 'L') return (/* "(wide integer) "   + */ getWideInteger(cursor));
  else if (type == 'f') return (/* "(float[]) "        + */ getArrayFloat(cursor));
  else if (type == 'd') return (/* "(wide float[]) "   + */ getArrayWideFloat(cursor));
  else if (type == 'l') return (/* "(wide integer[]) " + */ getArrayWideInteger(cursor));
  else if (type == 'i') return (/* "(integer[]) "      + */ getArrayInteger(cursor));
  else if (type == 'b') return (/* "(bool[]) "         + */ getArrayBool(cursor));
  else if (type == 'S') return (/* "(string) "         + */ getLongString(cursor));
  else if (type == 'R') return (/* "(data) "           + */ getData(cursor));
  else
    return "(missing type)";
}

var root = {};

function process(data)
{
  var bytes = new Uint8Array(data);
  log("Got model data, size " + bytes.length);
  log("Starting");

  // validate
  var header = "";
  for (var i = 0; i < 20; i++)
    header += String.fromCharCode(bytes[i]);

  if (header != "Kaydara FBX Binary  ") log("Missing valid header");
  if (bytes[20] != 0x0) log("Missing magic number");
  if (bytes[21] != 0x1A) log("Missing magic number");
  if (bytes[22] != 0x0) log("Missing magic number");

  // first step, just parse and output what we find
  var cursor = { data: bytes, offset: 23 };
  debug("File version:" + getInteger(cursor));
  while (cursor.offset != bytes.length)
    if (!parseObjectRecord(root, cursor)) break;

  log("Decoded");

  // do connections

  // create output
  var file = {};
  file.attributes = { 'POS': 0, 'TEX0': 12, 'NORM': 20 };
  file.groups = [];

  // materials
  if (Array.isArray(root.Objects.Material))
    for (var m in root.Objects.Material)
      file.groups.push(outputMaterial(root.Objects.Material[m]));
  else
    file.groups.push(outputMaterial(root.Objects.Material));

  // models

  // bounding boxes

  var result = JSON.stringify(root)
  log("result is " + result.length);

  log("Done");
  postMessage({ type: 1, result: result });
}

function outputMaterial(mat)
{
  var obj = {};
  obj.id = mat[0];
  obj.type = "material";
  obj.name = mat[1].split('\0')[0];
  if (mat.texture) obj.texture = mat.texture;
  log("Found material: " + obj.name);
  for (var p in mat.Properties70.P)
  {
    var prop = mat.Properties70.P[p];
    obj[prop[0]] = [];
    if (4 in prop) obj[prop[0]].push(prop[4]);
    if (5 in prop) obj[prop[0]].push(prop[5]);
    if (6 in prop) obj[prop[0]].push(prop[6]);
  }
  return obj;
}