(function(){
  'use strict';
  var palettes={
    ink:{bg:'#f3f0e8',fg:'#20251e',accent:'#e35c3c',soft:'#dedbd2'},
    cobalt:{bg:'#163d82',fg:'#fff9e6',accent:'#d8fd4b',soft:'#3963a5'},
    mono:{bg:'#eeeae2',fg:'#141615',accent:'#777b74',soft:'#cbc9c1'},
    clay:{bg:'#df5b3e',fg:'#211d1a',accent:'#f1ddbb',soft:'#b94734'},
    lime:{bg:'#d5ed45',fg:'#1f291f',accent:'#ffffff',soft:'#b7cf31'}
  };
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
  function n(v,min,max){return Math.max(min,Math.min(max,Number(v)||min))}
  function dimension(r){return({'4:5':[800,1000],'1:1':[900,900],'9:16':[720,1280],'16:9':[1120,630]})[r]||[800,1000]}
  function wrap(text,cap,maxlines){var words=String(text||'UNTITLED').replace(/\s+/g,' ').trim().split(' '), lines=[],cur='';words.forEach(function(w){if((cur+' '+w).trim().length>cap&&cur){lines.push(cur);cur=w}else{cur=(cur+' '+w).trim()}});if(cur)lines.push(cur);if(lines.length>maxlines){lines=lines.slice(0,maxlines);lines[maxlines-1]=lines[maxlines-1].slice(0,cap-1).trim()+'…'}return lines}
  function derived(brief){
    var s=String(brief||'').trim().split(/[.!?\n]/)[0].replace(/^(create|design|develop|make|generate|build|give me|i need|please|produce)\s+(\d+\s+)?(an?\s+)?/i,'').replace(/^(original|bold|premium|experimental)\s+/i,'').trim();
    var meaningful=s.replace(/^(a|the|three|3)\s+/i,'').slice(0,48);
    if(meaningful.length>37)meaningful=meaningful.slice(0,35).replace(/\s+\S*$/,'');
    return {headline:(meaningful||'MAKE IT MATTER').toUpperCase(),subtitle:String(brief||'').slice(0,105)||'A new visual direction.',eyebrow:'FORMA / EXPERIMENT 001'};
  }
  function textLines(lines,x,y,size,line,fill,opts){
    opts=opts||{}; var anchor=opts.anchor||'start',weight=opts.weight||'800',family=opts.family||'Arial,Helvetica,sans-serif',spacing=opts.spacing==null?'-0.045em':opts.spacing;
    return lines.map(function(t,i){return '<text x="'+x+'" y="'+(y+i*line)+'" text-anchor="'+anchor+'" fill="'+fill+'" font-family="'+family+'" font-size="'+size+'" font-weight="'+weight+'" letter-spacing="'+spacing+'">'+esc(t)+'</text>'}).join('');
  }
  function base(c,w,h){return '<rect width="'+w+'" height="'+h+'" fill="'+c.bg+'"/>'}
  function footer(c,w,h,variant,eyebrow){return '<line x1="48" x2="'+(w-48)+'" y1="'+(h-85)+'" y2="'+(h-85)+'" stroke="'+c.fg+'" opacity=".62"/><text x="48" y="'+(h-52)+'" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="'+c.fg+'" letter-spacing="2">'+esc(eyebrow.slice(0,43).toUpperCase())+'</text><text x="'+(w-48)+'" y="'+(h-52)+'" font-family="Arial,sans-serif" font-size="13" font-weight="700" fill="'+c.fg+'" text-anchor="end">F / 0'+(variant+1)+'</text>'}
  function draw(o){
    o=o||{};var d=dimension(o.ratio),w=d[0],h=d[1],c=palettes[o.palette]||palettes.ink,v=n(o.variant||0,0,2),title=String(o.headline||'MAKE IT MATTER').toUpperCase().slice(0,70),sub=String(o.subtitle||'An idea made visible.').slice(0,160),eyebrow=String(o.eyebrow||'FORMA / ART DIRECTION').slice(0,85);
    var mobileTall=(h/w>1.5),landscape=(w/h>1.4),scale=w/800,txt=Math.round((landscape?79:mobileTall?98:104)*scale),headlineY=h*(landscape?.31:mobileTall?.29:.30);
    var capacity=landscape?19:mobileTall?11:13,lines=wrap(title,capacity,4),row=txt*.88;
    var out='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(title)+'">';
    out+=base(c,w,h);
    if(v===0){
      var margin=48,usable=w-margin*2;for(var i=0;i<=6;i++){var xx=margin+i*usable/6;out+='<line x1="'+xx+'" y1="0" x2="'+xx+'" y2="'+h+'" stroke="'+c.fg+'" opacity=".07"/>'}
      out+='<rect x="48" y="44" width="14" height="14" fill="'+c.accent+'"/><text x="75" y="57" font-size="13" font-weight="700" font-family="Arial" fill="'+c.fg+'">INDEPENDENT IMAGE CULTURE</text>';
      out+='<text x="'+(w-48)+'" y="57" text-anchor="end" font-family="Arial" font-size="13" font-weight="700" fill="'+c.fg+'">2026 / NO. 01</text>';
      out+='<line x1="48" x2="'+(w-48)+'" y1="94" y2="94" stroke="'+c.fg+'" stroke-width="2"/>';
      var fs=Math.min(txt,(h*.47)/Math.max(1,lines.length)/.87);
      out+=textLines(lines,48,headlineY,fs,fs*.9,c.fg,{spacing:'-0.07em'});
      var fy=Math.max(headlineY+lines.length*fs*.9+25,h*.63);
      if(fy>h-200)fy=h-195;
      out+='<rect x="48" y="'+(fy-10)+'" width="'+(w*.18)+'" height="7" fill="'+c.accent+'"/>';
      out+='<text x="48" y="'+(fy+50)+'" font-size="'+(16*scale)+'" font-weight="600" font-family="Arial" fill="'+c.fg+'">'+esc(sub.slice(0,65))+'</text>';
      out+='<text x="48" y="'+(fy+78)+'" font-size="'+(13*scale)+'" font-family="Arial" fill="'+c.fg+'" opacity=".75">'+esc(sub.slice(65,125))+'</text>';
      out+='<text x="'+(w-48)+'" y="'+(h*.82)+'" text-anchor="end" font-size="'+(135*scale)+'" font-weight="800" font-family="Arial" fill="'+c.accent+'">01</text>';
    }else if(v===1){
      out+='<rect x="'+(w*.06)+'" y="'+(h*.08)+'" width="'+(w*.88)+'" height="'+(h*.84)+'" fill="'+c.accent+'"/>';
      out+='<g transform="translate('+(-w*.05)+' '+(h*.08)+') rotate(-8 '+(w*.5)+' '+(h*.3)+')">';
      var fs2=Math.min(txt*1.4,h*.58/Math.max(1,lines.length));
      out+=textLines(lines,w*.11,h*.25,fs2,fs2*.83,c.fg,{spacing:'-.09em'});
      out+='</g>';
      out+='<rect x="'+(w*.09)+'" y="'+(h*.65)+'" width="'+(w*.82)+'" height="'+(h*.16)+'" fill="'+c.fg+'"/>';
      out+='<text x="'+(w*.12)+'" y="'+(h*.7)+'" fill="'+c.bg+'" font-size="'+Math.round(21*scale)+'" font-weight="700" font-family="Arial">'+esc(sub.slice(0,40))+'</text>';
      out+='<text x="'+(w*.12)+'" y="'+(h*.745)+'" fill="'+c.bg+'" font-size="'+Math.round(16*scale)+'" font-family="Arial">'+esc(sub.slice(40,95))+'</text>';
      out+='<text x="'+(w*.09)+'" y="'+(h*.11)+'" fill="'+c.fg+'" font-size="'+Math.round(15*scale)+'" font-weight="800" font-family="Arial">F / EXPERIMENT 002</text>';
    }else{
      var cx=w*.61,cy=h*.39,r=Math.min(w*.33,h*.29);
      out+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+c.accent+'"/><circle cx="'+cx+'" cy="'+cy+'" r="'+(r*.6)+'" fill="'+c.bg+'"/><rect x="'+(w*.18)+'" y="'+(h*.16)+'" width="'+(w*.12)+'" height="'+(h*.64)+'" fill="'+c.fg+'"/>';
      var fs3=Math.min(txt*1.06,h*.49/Math.max(lines.length,1)*1.15);
      out+='<g transform="translate('+(-w*.04)+' '+(h*.11)+')">'+textLines(lines,w*.2,h*.32,fs3,fs3*.88,c.fg,{spacing:'-.08em'})+'</g>';
      out+='<rect x="'+(w*.10)+'" y="'+(h*.77)+'" width="'+(w*.8)+'" height="'+Math.max(32,h*.03)+'" fill="'+c.accent+'"/>';
      out+='<text x="'+(w*.10)+'" y="'+(h*.73)+'" fill="'+c.fg+'" font-size="'+Math.round(19*scale)+'" font-family="Arial" font-weight="600">'+esc(sub.slice(0,72))+'</text>';
      out+='<text x="'+(w*.1)+'" y="'+(h*.11)+'" font-family="Arial" font-size="'+Math.round(16*scale)+'" font-weight="800" fill="'+c.fg+'">FORM / SPACE / MOTION</text>';
    }
    out+=footer(c,w,h,v,eyebrow)+'</svg>';return out;
  }
  function download(blob,filename){var a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url)},1000)}
  function saveSVG(svg,filename){download(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),filename||'forma-layout.svg')}
  function savePNG(svg,filename){return new Promise(function(resolve,reject){var blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();img.onload=function(){try{var c=document.createElement('canvas');c.width=Math.min(3000,img.naturalWidth*2);c.height=Math.min(3600,img.naturalHeight*2);var ctx=c.getContext('2d');ctx.drawImage(img,0,0,c.width,c.height);c.toBlob(function(png){URL.revokeObjectURL(url);if(!png){reject(new Error('PNG export unavailable'));return}download(png,filename||'forma-layout.png');resolve()},'image/png')}catch(err){URL.revokeObjectURL(url);reject(err)}};img.onerror=function(){URL.revokeObjectURL(url);reject(new Error('Could not render SVG for PNG export'))};img.src=url})}
  window.FormaDesign={render:draw,derived:derived,savePNG:savePNG,saveSVG:saveSVG,palettes:palettes,dimension:dimension};
})();