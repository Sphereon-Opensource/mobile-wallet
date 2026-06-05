function dec(buf, p={i:0}) {
  const b = buf[p.i++], mt = b >> 5, ai = b & 0x1f;
  const len = (ai) => {
    if (ai < 24) return ai;
    if (ai === 24) return buf[p.i++];
    if (ai === 25) { const v = buf.readUInt16BE(p.i); p.i+=2; return v; }
    if (ai === 26) { const v = buf.readUInt32BE(p.i); p.i+=4; return v; }
    if (ai === 27) { const hi=buf.readUInt32BE(p.i), lo=buf.readUInt32BE(p.i+4); p.i+=8; return hi*4294967296+lo; }
    throw new Error("ai "+ai);
  };
  switch(mt){
    case 0: return len(ai);
    case 1: return -1 - len(ai);
    case 2: { const n=len(ai); const v=buf.subarray(p.i,p.i+n); p.i+=n; return v; }
    case 3: { const n=len(ai); const v=buf.toString("utf8",p.i,p.i+n); p.i+=n; return v; }
    case 4: { const n=len(ai); const a=[]; for(let k=0;k<n;k++)a.push(dec(buf,p)); return a; }
    case 5: { const n=len(ai); const m=new Map(); for(let k=0;k<n;k++){const key=dec(buf,p); const val=dec(buf,p); m.set(typeof key==="object"&&key.length!==undefined?key.toString("hex"):key,val);} return m; }
    case 6: { const tag=len(ai); const v=dec(buf,p); return {__tag:tag, value:v}; }
    case 7: { if(ai===20)return false; if(ai===21)return true; if(ai===22)return null; if(ai===23)return undefined; throw new Error("simple "+ai);}
  }
}
module.exports = { dec };
