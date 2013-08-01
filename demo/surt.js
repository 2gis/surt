/*! surt 01-08-2013 */
!function(a){function b(a){var b=new RegExp(d,"g");return a.replace(b," ")}var c,d=String.fromCharCode(160),e=function(b){function d(a,b){if(!a||1!=a.nodeType)throw new Error("Surt: html element "+b+" not found or it has wrong nodeType")}if(b=b||{},c=a.jQuery||b.$){b&&b.root||!this||!this[0]||1!=this[0].nodeType||(b.root=this[0]);try{if(b.root=c(b.root)[0],d(b.root,"params.root"),b.input&&(b.input=c(b.input)[0]),b.input||(b.input=c('[contenteditable="true"]',b.root)),d(b.input,"params.input"),"true"==c(b.root).attr("data-surt-inited"))throw new Error("Surt: already initialized");ret=new e.fn.constructor(b,c)}catch(f){return console.warn(f.name+": ",f.message),void 0}return ret}};e.fn={constructor:function(a,b){function c(){clearTimeout(g._upTimer),g._upTimer=setTimeout(function(){g._pressedKeys=0},300)}function d(){var a=g.args();a.kit=g.suggest[g._activeSuggest],g.set(a),g.restoreCursor(g.text().length)}function f(a){return 37==a||39==a||16==a||17==a||18==a||91==a||35==a||36==a||13==a}var g=this;a=a||{},this.$=b,this.params=a,this.parser=e.parser,this.inputNode=b(a.input)[0],this.root=b(a.root)[0],this.suggestNode=b(a.suggest)[0],this.cloneNode=b(a.clone)[0],this.autocompleteNode=b(a.autocomplete)[0],this._pressedKeys=0,this.kit=[],this._activeSuggest=-1,b(this.root).attr("data-surt-inited",!0),b(this.inputNode).on("keyup",function(c){var d=c.keyCode;return g._pressedKeys--,f(d)?!0:(40==d&&b(".surt").hasClass(a.suggestCls),38==d||40==d||32==d&&g.getCursor()>=g.text().length?!1:(g.parse(),a.change&&a.change(c,g.args()),void 0))}).on("keydown input paste",function(e){var h=e.keyCode;if(32==h&&g.getCursor()>=g.text().length)return!g.trailingSpace&&g.kit.length&&(b(g.inputNode).append(" "),g.parse(),a.change&&a.change(e,g.args()),g.restoreCursor(g.getCursor()+1)),!1;if("keydown"!=e.type||f(h)||(g._pressedKeys++,c()),f(h)&&(g._pressedKeys=0),13==h)return b(g.root).hasClass(a.suggestCls)&&b("."+a.suggestItemCurrentCls).length&&d(),!1;if(40==h){var i=0;return g._activeSuggest>=0&&(i=g._activeSuggest<g.suggest.length-1?g._activeSuggest+1:0),g.markSuggest(i),!1}if(38==h){var i=g.suggest.length-1;return g._activeSuggest>=0&&(i=g._activeSuggest>0?g._activeSuggest-1:g.suggest.length-1),g.markSuggest(i),!1}if(39==h){var j=g.text().length;if(b(g.root).hasClass(a.suggestCls)&&b(g.root).hasClass(a.autocompleteCls)&&g.getCursor()>=j){var k=g.args();k.kit=g.suggest[0],g.set(k),g.restoreCursor(g.text().length)}}}).on("paste",function(){setTimeout(function(){g.parse()},0)}).on("focus",function(){b(g.root).addClass(g.params.stateFocusCls)}).on("blur",function(){b(g.root).removeClass(g.params.stateFocusCls)}),b(document).on("click",function(a){b(a.target).closest(g.root).length||b(g.root).removeClass(g.params.suggestCls).removeClass(g.params.autocompleteCls),a.stopPropagation()}).on("click","."+g.params.suggestItemCls,function(){var c=b("."+a.suggestItemCls),d=c.index(b(this)),e=g.args();e.kit=g.suggest[d],g.set(e)}).on("click","."+g.params.tokenCloseCls,function(){b(this).parent().remove(),g.parse()})},dispose:function(){c(this.root).attr("data-surt-inited","disposed"),clearTimeout(this._upTimer)},get:function(){return this.kit},set:function(a){this._pressedKeys>0||(a=a||{},this.kit=a.kit||[],this.suggest=a.suggest||[],this.update())},setKit:function(a){this.kit=this.kit||a,this.update()},update:function(){this.saveCursor();for(var a=[],b=[],e=this.params.tokenCls,f=this.params.textCls||e,g=0;g<this.kit.length;g++){var h=this.kit[g].text.trim();if("text"==this.kit[g].type)f&&(h='<div class="'+f+'">'+h+"</div>");else if(e){var i=this.params.tokenCloseCls,j=i?'<div class="'+i+'"></div>':"";h='<div class="'+e+" "+e+"_type_"+this.kit[g].type+'">'+h+j+"</div>"}a.push(h)}a=a.join(" "),this.trailingSpace&&(a+=d),this.inputNode.innerHTML=a;for(var g=0;g<this.suggest.length;g++){for(var k=[],l=0;l<this.suggest[g].length;l++){var h=this.suggest[g][l].text.trim();"text"!=this.suggest[g][l].type?(e&&(h='<div class="'+e+" "+e+"_type_"+this.suggest[g][l].type+'">'+h+"</div>"),k.push(h)):(f&&(h='<div class="'+f+'">'+h+"</div>"),k.push(h))}k=k.join(" "),b.push('<li class="'+this.params.suggestItemCls+'">'+k+"</li>"),this._activeSuggest=-1}if(b=b.join(""),this.suggestNode&&(b?c(this.root).addClass(this.params.suggestCls):c(this.root).removeClass(this.params.suggestCls),this.suggestNode.innerHTML=b),this.suggest.length&&this.suggest[0].length&&this.kit.length&&this.cloneNode){var m,n,o=this.kit[this.kit.length-1].text,p=this.kit.length-1;this.trailingSpace&&p++,m=this.suggest[0].length>p?this.suggest[0][p].text:"",n=!m.toLowerCase().indexOf(o.toLowerCase()),c(this.root).hasClass(this.params.suggestCls)&&n?(this.cloneNode.innerHTML=this.inputNode.innerHTML,this.autocompleteNode.innerHTML=m.slice(o.length),c(this.root).addClass(this.params.autocompleteCls)):c(this.root).removeClass(this.params.autocompleteCls)}else c(this.root).removeClass(this.params.autocompleteCls);this.restoreCursor()},query:function(a){var c="";a=a||this.kit;for(var d=0;d<a.length;d++)d>0&&(c+=" "),c+=a[d].text;return b(c)},text:function(){return b(c(this.inputNode).text())},args:function(){var a={};return a.kit=this.kit,a.suggest=this.suggest,a.text=this.text(),a},parse:function(){var a=this.text();this.trailingSpace=" "===a[a.length-1],newKit=this.parser(this.kit,a),this.kit=newKit},markSuggest:function(a){var b=c("."+this.params.suggestItemCls),d=this.params.suggestItemCurrentCls;b.removeClass(d).eq(a).addClass(d),this._activeSuggest=a},minimize:function(){c(this.root).removeClass(this.params.suggestCls)}},e.fn.constructor.prototype=e.fn,a.surt=e,"undefined"!=typeof module&&(module.exports=e),e.version="0.2.0"}(this),function(a,b){function c(a){for(var b="",c=0;c<a.length;c++)c>0&&(b+=" "),b+=a[c].text;return b}var d=a.surt||{},e=function(a,d){function e(a){"text"==a.type&&f.length&&"text"==f[f.length-1].type?f[f.length-1].text+=" "+a.text:f.push(a),d=d.replace(a.text,"").trim()}var f=[];if(c(a)===d)return a;for(var g=0;g<a.length;g++){var h=d.indexOf(a[g].text),i=d[h-1],j=d[h+a[g].text.length];if((" "!==j&&j!==b||" "!==i&&i!==b)&&(h=-1),0==h)e(a[g]);else if(h>0){var k=d.substring(0,h).trim();e({text:k,type:"text"}),e(a[g])}}return d&&e({text:d,type:"text"}),f};d.parser=e,"undefined"!=typeof module&&(module.exports=e)}(this),function(a){function b(a,b){for(var c=0,d=0;d<a.childNodes.length;d++){var e=$(a.childNodes[d]).text().length;if(c+=e,c>=b)return{child:a.childNodes[d],n:b-(c-e)}}return 0>b&&(c=0),{child:a.childNodes[a.childNodes.length-1],n:c}}var c=a.surt||{};c.fn=c.fn||{},c.fn.getCursor=function(){if(a.getSelection){var b=a.getSelection();if(b.anchorNode){for(var c=b.getRangeAt(0),d=c.startContainer,e=c.startOffset,f=d,g=e;f&&f!=this.inputNode;){for(var h,i=f.previousSibling;i;)h=$(i).text(),g+=h.length,i=i.previousSibling;f=f.parentNode}return g}}},c.fn.saveCursor=function(){return this.cursorPos=this.getCursor(),this.cursorPos},c.fn.restoreCursor=function(c){if(a.getSelection){var d=document.createRange(),e=a.getSelection(),f=this.inputNode;for(c=c||this.cursorPos;f&&1==f.nodeType;)obj=b(f,c),f=obj.child,c=obj.n;f&&3==f.nodeType&&(c=Math.min(c,this.$(f).text().length),c=Math.max(c,0),d.setStart(f,c),d.collapse(!0),e.removeAllRanges(),e.addRange(d)),this.inputNode.focus()}}}(this);