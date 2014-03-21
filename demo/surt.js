/*! surt 21-03-2014 */
!function(a,b){function c(a){var b=new RegExp(e,"g");return a.replace(b," ")}function d(a,b){var c=!0;if(a=a||[],b=b||[],!a.length||!b.length)return!(a.length||b.length);if(a.length==b.length){for(var d=0;d<a.length;d++)c=c&&a[d].text==b[d].text&&a[d].type==b[d].type;return c&&a.length==b.length}}var e=String.fromCharCode(160),f={input:".surt__input",suggest:".surt__suggests",suggestItemCls:"surt__suggests-item",aunt:99},g=function(a){function b(a,b){if(!a||1!=a.nodeType)throw new Error("Surt: html element "+b+" not found or it has wrong nodeType")}var c;a=a||{};for(var d in f)a[d]||(a[d]=f[d]);if(a.root=this[0],a.root=$(a.root)[0],b(a.root,"params.root"),a.input&&(a.input=$(a.input,a.root)[0]),a.input||(a.input=$('[contenteditable="true"]',a.root)),b(a.input,"params.input"),"true"==$(a.root).attr("data-surt-inited"))throw new Error("Surt: already initialized");return c=new g.fn.constructor(a)};g.fn={constructor:function(a){function c(){clearTimeout(f._upTimer),f._upTimer=setTimeout(function(){f._pressedKeys=0},300)}function d(c,d){var e=f.args(),g=f.params.selectionCls?e.suggest:b;e.kit=f.suggest[f._activeSuggest],f.set({kit:e.kit,suggest:g},!0),a.pick&&a.pick(e.kit,c,d),f.markSuggest(-1)}function e(a){return 37==a||39==a||16==a||17==a||18==a||91==a||35==a||36==a||13==a||8==a}var f=this,g=a.root;a=a||{},this.params=a,this.inputNode=$(a.input,g)[0],this.root=$(a.root,g)[0],this.suggestNode=$(a.suggest,g)[0],this.cloneNode=$(a.clone,g)[0],this.hintNode=$(a.hint,g)[0],this.delimiter=a.delimiter||"",this.placeholder=a.placeholder||"",this._submitEvents=a.events||["enter"],this._pressedKeys=0,this._time=(new Date).getTime(),this._events={},this.kit=[],this._activeSuggest=-1,$(this.root).attr("data-surt-inited",!0),this.updateHint(),$(this.inputNode).on("keyup.surt",function(b){var c,g=b.keyCode;if(27!=g&&(f._pressedKeys--,f._pressedKeys<0&&(f._pressedKeys=0),40!=g&&38!=g||!$(f.root).hasClass(a.suggestCls))){if(f.suggest&&f.suggest[f._activeSuggest]&&!e(g)){var h=f.text(),i=h.charAt(h.length-1);d(!1,b);var j=f.text()+f.delimiter+" "+i;f.text(j),f.restoreCursor(j.length)}f.updateInput(),f.updateHint(),c=f.args(),a.change&&13!=g&&a.change(b,c)}}).on("keydown.surt input.surt paste.surt",function(b){var g,h,i=b.keyCode;if("keydown"!=b.type||e(i)||(f._pressedKeys++,c()),e(i)?f._pressedKeys=0:$(f.root).removeClass(f.params.placeholderCls),13==i)return b.preventDefault(),$(f.root).hasClass(a.suggestCls)&&$(f.root).find("."+a.suggestItemCurrentCls).length&&d(!0,b),f.params.submit&&-1!=$.inArray("enter",f._submitEvents)&&f.params.submit(b),$(f.root).removeClass(a.suggestCls),$(f.root).removeClass(a.autocompleteCls),f.markSuggest(-1),!1;if(40==i)return g=0,f._activeSuggest>=0&&f.suggest&&(g=f._activeSuggest<f.suggest.length-1?f._activeSuggest+1:0),f.markSuggest(g),!1;if(38==i)return g=f.suggest&&f.suggest.length-1,f._activeSuggest>=0&&f.suggest&&(g=f._activeSuggest>0?f._activeSuggest-1:f.suggest.length-1),f.markSuggest(g),!1;if(39==i){var j=f.text().length;if(f.getCursor()>=j&&f.suggest){var k=$(f.root).hasClass(f.params.autocompleteCls)||-1!=f._activeSuggest,l=-1==f._activeSuggest?0:f._activeSuggest;k&&(h=f.args(),h.kit=f.suggest[l],f.set(h,!0),f.params.submit&&-1!=$.inArray("auto",f._submitEvents)&&f.params.submit(b),f.suggest&&f.suggest.length&&f.params.complete&&f.params.complete())}}27==i&&($(f.root).removeClass(f.params.suggestCls),b.preventDefault())}).on("paste.surt",function(){setTimeout(function(){f.parse()},0)}).on("focus.surt click.surt",function(){var a=!$(f.root).hasClass(f.params.suggestCls);$(f.root).addClass(f.params.stateFocusCls),f.suggest&&f.suggest.length&&$(f.root).addClass(f.params.suggestCls),f.updateHint(),a&&f.params.show&&f.params.show(f._suggestExist)}).on("blur.surt",function(){$(f.root).removeClass(f.params.stateFocusCls),$(f.root).removeClass(f.params.readyCls),$(f.root).removeClass(f.params.autocompleteCls),$(f.root).removeClass(f.params.suggestCls)}),$(this.root).on("mousedown.surt","."+f.params.suggestItemCls,function(b){var c=$("."+a.suggestItemCls),e=c.index($(this));if(f.suggest&&f.suggest[e]){var g=-1!=$.inArray("click",f._submitEvents);f._activeSuggest=e,d(g,b),f.params.submit&&g?f.params.submit(b):f.params.change&&f.params.change(b,f.args()),$(b.target).closest(f.params.suggestItemCls).length||$(f.root).removeClass(f.params.suggestCls).removeClass(f.params.autocompleteCls)}})},semanticChanged:function(a){return!d(a,this.kit)},get:function(){return this.kit},set:function(a,c){if(a=a||{},!(this._pressedKeys>0)){a.kit&&a.kit.length===b&&(a.kit=[a.kit]),this.saveCursor();var e=d(a.kit,this.kit);a.kit&&(this.kit=a.kit),(!e||c)&&this.updateKit(c),a.suggest&&(this.suggest=a.suggest,this.updateSuggest()),this.updateHint(),this.restoreCursor()}},setKit:function(a){this.kit=a,this.updateKit()},update:function(){this.updateKit(),this.updateSuggest(),this.updateHint()},updateInput:function(){var a=this.parse(),b=this.brick(a),c=this.getTail(b);(this.semanticChanged(b)||c)&&(this.setKit(b),c&&"text"!=this.params.inputMode&&($(this.inputNode).append(c.replace(" ","&nbsp;")),this.restoreCursor(999)))},updateKit:function(a){var b=[],c=this.params.tokenCls,d=this.params.textCls||c,e="",f="";if(this.kit){this.saveCursor();for(var g=0;g<this.kit.length;g++){var h=this.trim(this.kit[g].text);this.textMode()||("text"==this.kit[g].type&&d?(e='<div class="'+d+'">',f="</div>"):c&&(e='<div class="'+c+" "+"_type_"+this.kit[g].type+'">',f="</div>"),h=e+h+f),b.push(h)}b=b.join(this.delimiter+" "),("text"!=this.params.inputMode||a)&&(this.html(b),this.restoreCursor())}},updateSuggest:function(){var a,b=[],c=this.params.tokenCls,d=this.params.textCls||c,e=!this._suggestExist;if(this._suggestExist=!(!this.suggest||!this.suggest.length),this.suggest){var f=!(e^this._suggestExist);f&&this.params.show&&this.params.show(this._suggestExist);for(var g=0;g<this.suggest.length;g++){for(var h=[],i=0;i<this.suggest[g].length;i++){var j=this.suggest[g][i].html||this.suggest[g][i].text;j=this.trim(j),this.params.selectionCls&&(j=this.parser.replace.call(this,j)),"text"!=this.suggest[g][i].type?(c&&(j='<div class="'+c+" "+"_type_"+this.suggest[g][i].type+'">'+j+"</div>"),h.push(j)):(d&&(j='<div class="'+d+'">'+j+"</div>"),h.push(j))}a=h.length,h=h.join(this.delimiter+" ");var k="";this.params.suggestItemCountCls&&(k=" "+this.params.suggestItemCountCls+a),b.push('<li class="'+this.params.suggestItemCls+k+'">'+h+"</li>"),this._activeSuggest=-1}a=b.length,b=b.join(""),this.suggestNode&&(b?$(this.root).addClass(this.params.suggestCls):$(this.root).removeClass(this.params.suggestCls),this.suggestNode.innerHTML=b)}},updateHint:function(){this.updateAutocomplete(),this.text()||($(this.root).addClass(this.params.placeholderCls).removeClass(this.params.autocompleteCls),this.updatePlaceholder())},updateAutocomplete:function(){function a(){$(e.hintNode).html(""),$(e.cloneNode).html(""),$(e.root).removeClass(e.params.autocompleteCls)}var b=-1==this._activeSuggest?0:this._activeSuggest,c=this.suggest&&this.suggest.length&&this.suggest[b],d=this.text(),e=this;if(this.hintNode)if($(this.root).removeClass(this.params.placeholderCls),this.kit&&this.kit.length&&this.cloneNode)if(c&&c.length){var f,g,h=(this.kit[this.kit.length-1].text,0);if(f=[],this.suggest[0].length>h)for(var i=h;i<this.suggest[b].length;i++)f.push(this.suggest[b][i].text);f=f.join(this.delimiter+" "),f==d?$(this.root).addClass(this.params.readyCls):(g=0==f.toLowerCase().indexOf(d.toLowerCase()),$(this.root).removeClass(this.params.readyCls)),this.hintNode.innerHTML=f.slice(d.length),this.cloneNode.innerHTML=this.html(),$(this.root).hasClass(this.params.suggestCls)&&g&&f.length<this.params.aunt?$(this.root).addClass(this.params.autocompleteCls):a()}else a();else a()},updatePlaceholder:function(a){a=a||this.placeholder,$(this.hintNode).html(this.placeholder)},query:function(a){var b="";a=a||this.kit;for(var d=0;d<a.length;d++)d>0&&(b+=" "),b+=a[d].text;return c(b)},text:function(a){return a?(this.html(a),void 0):c($(this.inputNode).text()||$(this.inputNode).val())},html:function(a){return a?("INPUT"==this.inputNode.tagName?$(this.inputNode).val(a):$(this.inputNode).html(a),void 0):$(this.inputNode).html()||this.text()},args:function(){var a={};return a.kit=this.kit,a.suggest=this.suggest||[],a.text=this.text(),a},parse:function(a){var b=a||this.text();return this.trailingSpace=" "===b[b.length-1],newKit=this.parser(this.kit,b)},invalidate:function(a){var b=this.parse(a);this.kit=b},brick:function(a){var b=!0,c=this.text(),d=[];if(a)for(var e=0;e<a.length;e++){var f=this.suggest&&this.suggest[0]&&this.suggest[0][e];b=b&&f&&a[e].text.toLowerCase()==f.text.toLowerCase(),d.push(f)}return b&&c[c.length-1]==this.delimiter?d:a},markSuggest:function(a){var c=$("."+this.params.suggestItemCls),d=this.params.suggestItemCurrentCls;a===b&&(a=this._activeSuggest),c.removeClass(d),a>=0&&(c.eq(a).addClass(d),this._activeSuggest=a,this.updateHint()),this._activeSuggest=a},getTail:function(a){var b,c=this.text(),d=[];if(a=a||this.kit)for(var e=0;e<a.length;e++)d.push(a[e].text);return d=d.join(this.delimiter+" "),0==c.indexOf(d)&&(b=c.substr(d.length,c.length)),b},minimize:function(){$(this.root).removeClass(this.params.suggestCls)},dispose:function(){$(this.root).attr("data-surt-inited","disposed"),$(this.root).off("surt"),clearTimeout(this._upTimer)},trim:function(a){return String.prototype.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},textMode:function(){return"INPUT"==this.inputNode.tagName||"text"==this.params.inputMode}},g.fn.constructor.prototype=g.fn,$.fn.surt=g,g.version="0.3.0"}(this),function(a,b){function c(a){var b="";if(a)for(var c=0;c<a.length;c++)c>0&&(b+=" "),b+=a[c].text;return b}var d=function(a,d){function e(a){"text"==a.type&&f.length&&"text"==f[f.length-1].type?f[f.length-1].text+=" "+a.text:f.push(a),h=g(h.replace(a.text,""))}var f=[],g=this.trim,h=d;if(this.delimiter&&(h=h.replace(new RegExp(this.delimiter,"g")," ")),h=h.replace(new RegExp("  ","g")," "),c(a)===h)return a;if(a)for(var i=0;i<a.length;i++){var j=h.indexOf(a[i].text),k=h[j-1],l=h[j+a[i].text.length];if((" "!==l&&l!==b||" "!==k&&k!==b)&&(j=-1),0==j)e(a[i]);else if(j>0){var m=g(h.substring(0,j));e({text:m,type:"text"}),e(a[i])}}return h=g(h),h&&e({text:h,type:"text"}),f};d.replace=function(a){function b(a){return String(a).replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}var c=b(this.text());return c="((>[^<]*|^[^<>]*))("+c+")([w -]*)",a.replace(new RegExp(c,"i"),'$1<span class="'+this.params.selectionCls+'">$3</span>$4')},"undefined"!=typeof module?module.exports=d:$.fn.surt.fn.parser=d}(this),function(){function a(a,b){for(var c=0,d=0;d<a.childNodes.length;d++){var e=$(a.childNodes[d]).text().length;if(c+=e,c>=b)return{child:a.childNodes[d],n:b-(c-e)}}return 0>b&&(c=0),{child:a.childNodes[a.childNodes.length-1],n:c}}var b=$.fn.surt;b.fn.getCursor=function(){var a;if("INPUT"==this.inputNode.tagName)a=this.inputNode.selectionEnd;else{if(!window.getSelection)return;var b=window.getSelection();if(!b.anchorNode)return;var c=b.getRangeAt(0),d=c.startContainer,e=c.startOffset,f=d;for(a=e;f&&f!=this.inputNode;){for(var g,h=f.previousSibling;h;)g=$(h).text(),a+=g.length,h=h.previousSibling;f=f.parentNode}}return a},b.fn.saveCursor=function(){return this.cursorPos=this.getCursor(),this._lastPos=this.cursorPos==this.text().length,this.cursorPos},b.fn.restoreCursor=function(b){if(window.getSelection){var c,d=this,e=b,f=document.createRange(),g=window.getSelection(),h=this.inputNode;if(c=this._lastPos?this.text().length:this.cursorPos,e=e||c,"INPUT"!=this.inputNode.tagName)for(;h&&1==h.nodeType;)obj=a(h,e),h=obj.child,e=obj.n;h&&3==h.nodeType&&(e=Math.min(e,$(h).text().length),e=Math.max(e,0),f.setStart(h,e),f.collapse(!0),g.removeAllRanges(),g.addRange(f)),b>=this.text().length-1&&setTimeout(function(){d.inputNode.scrollLeft=99999,d.inputNode.selectionStart=e,d.inputNode.selectionEnd=e},0)}}}();