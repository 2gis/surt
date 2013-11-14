/*! surt 14-11-2013 */
!function(a,b){function c(a){var b=new RegExp(f,"g");return a.replace(b," ")}function d(a,b){var c=!0;if(a=a||[],b=b||[],!a.length||!b.length)return!(a.length||b.length);if(a.length==b.length){for(var d=0;d<a.length;d++)c=c&&a[d].text==b[d].text&&a[d].type==b[d].type;return c&&a.length==b.length}}var e,f=String.fromCharCode(160),g={input:".surt__input",suggest:".surt__suggests",suggestItemCls:"surt__suggests-item",aunt:99},h=function(b){function c(a,b){if(!a||1!=a.nodeType)throw new Error("Surt: html element "+b+" not found or it has wrong nodeType")}b=b||{};for(var d in g)b[d]||(b[d]=g[d]);if(e=a.jQuery||b.$){b&&b.root||!this||!this[0]||1!=this[0].nodeType||(b.root=this[0]);try{if(b.root=e(b.root)[0],c(b.root,"params.root"),b.input&&(b.input=e(b.input,b.root)[0]),b.input||(b.input=e('[contenteditable="true"]',b.root)),c(b.input,"params.input"),"true"==e(b.root).attr("data-surt-inited"))throw new Error("Surt: already initialized");ret=new h.fn.constructor(b,e)}catch(f){return console.warn(f.name+": ",f.message),void 0}return ret}};h.fn={constructor:function(a,c){function d(){clearTimeout(g._upTimer),g._upTimer=setTimeout(function(){g._pressedKeys=0},300)}function e(c,d){var e=g.args(),f=g.params.selectionCls?e.suggest:b;e.kit=g.suggest[g._activeSuggest],g.set({kit:e.kit,suggest:f},!0),a.pick&&a.pick(e.kit,c,d),g.markSuggest(-1)}function f(a){return 37==a||39==a||16==a||17==a||18==a||91==a||35==a||36==a||13==a||8==a}var g=this,h=a.root;a=a||{},this.$=c,this.params=a,this.inputNode=c(a.input,h)[0],this.root=c(a.root,h)[0],this.suggestNode=c(a.suggest,h)[0],this.cloneNode=c(a.clone,h)[0],this.autocompleteNode=c(a.autocomplete,h)[0],this.delimiter=a.delimiter||"",this._pressedKeys=0,this._time=(new Date).getTime(),this._events={},this.kit=[],this._activeSuggest=-1,c(this.root).attr("data-surt-inited",!0),c(this.inputNode).on("keyup",function(b){var d,h=b.keyCode;if(27!=h&&(g._pressedKeys--,g._pressedKeys<0&&(g._pressedKeys=0),40!=h&&38!=h||!c(g.root).hasClass(a.suggestCls))){if(g.suggest&&g.suggest[g._activeSuggest]&&!f(h)){var i=g.text(),j=i.charAt(i.length-1);e(!1,b);var k=g.text()+g.delimiter+" "+j;g.text(k),g.restoreCursor(k.length)}g.updateInput(),g.updateAutocomplete(),d=g.args(),a.change&&13!=h&&a.change(b,d)}}).on("keydown input paste",function(b){var h,i,j=b.keyCode;if("keydown"!=b.type||f(j)||(g._pressedKeys++,d()),f(j)&&(g._pressedKeys=0),13==j)return b.preventDefault(),c(g.root).hasClass(a.suggestCls)&&c("."+a.suggestItemCurrentCls).length&&e(!0,b),g.params.submit&&g.params.submit(),c(g.root).removeClass(a.suggestCls),c(g.root).removeClass(a.autocompleteCls),g.markSuggest(-1),!1;if(40==j)return h=0,g._activeSuggest>=0&&g.suggest&&(h=g._activeSuggest<g.suggest.length-1?g._activeSuggest+1:0),g.markSuggest(h),!1;if(38==j)return h=g.suggest&&g.suggest.length-1,g._activeSuggest>=0&&g.suggest&&(h=g._activeSuggest>0?g._activeSuggest-1:g.suggest.length-1),g.markSuggest(h),!1;if(39==j){var k=g.text().length;if(g.getCursor()>=k&&g.suggest){var l=c(g.root).hasClass(g.params.autocompleteCls)||-1!=g._activeSuggest,m=-1==g._activeSuggest?0:g._activeSuggest;l&&(i=g.args(),i.kit=g.suggest[m],g.set(i,!0),g.suggest&&g.suggest.length&&g.params.complete&&g.params.complete())}}27==j&&(c(g.root).removeClass(g.params.suggestCls),b.preventDefault())}).on("paste",function(){setTimeout(function(){g.parse()},0)}).on("focus click",function(){var a=!c(g.root).hasClass(g.params.suggestCls);c(g.root).addClass(g.params.stateFocusCls),c(g.root).addClass(g.params.suggestCls),g.updateAutocomplete(),a&&g.params.show&&g.params.show(g._suggestExist)}).on("blur",function(){c(g.root).removeClass(g.params.stateFocusCls),c(g.root).removeClass(g.params.readyCls),c(g.root).removeClass(g.params.autocompleteCls),c(g.root).removeClass(g.params.suggestCls)}),this._events.click=function(b){var d=c("."+a.suggestItemCls),f=d.index(c(this));g._activeSuggest=f,e(!1,b),g.params.change&&g.params.change(b,g.args()),c(b.target).closest(g.params.suggestItemCls).length||c(g.root).removeClass(g.params.suggestCls).removeClass(g.params.autocompleteCls)},c(this.root).on("mousedown","."+g.params.suggestItemCls,g._events.click)},semanticChanged:function(a){return!d(a,this.kit)},get:function(){return this.kit},set:function(a,c){if(a=a||{},!(this._pressedKeys>0)){a.kit&&a.kit.length===b&&(a.kit=[a.kit]),this.saveCursor();var e=d(a.kit,this.kit);a.kit&&(this.kit=a.kit),(!e||c)&&this.updateKit(c),a.suggest&&(this.suggest=a.suggest,this.updateSuggest()),this.updateAutocomplete(),this.restoreCursor()}},setKit:function(a){this.kit=a,this.updateKit()},update:function(){this.updateKit(),this.updateSuggest(),this.updateAutocomplete()},updateInput:function(){var a=this.parse(),b=this.brick(a),c=this.getTail(b);(this.semanticChanged(b)||c)&&(this.setKit(b),c&&"text"!=this.params.inputMode&&(e(this.inputNode).append(c.replace(" ","&nbsp;")),this.restoreCursor(999)))},updateKit:function(a){var b=[],c=this.params.tokenCls,d=this.params.textCls||c,e="",f="";if(this.kit){this.saveCursor();for(var g=0;g<this.kit.length;g++){var h=this.trim(this.kit[g].text);this.textMode()||("text"==this.kit[g].type&&d?(e='<div class="'+d+'">',f="</div>"):c&&(e='<div class="'+c+" "+c+"_type_"+this.kit[g].type+'">',f="</div>"),h=e+h+f),b.push(h)}b=b.join(this.delimiter+" "),("text"!=this.params.inputMode||a)&&(this.html(b),this.restoreCursor())}},updateSuggest:function(){var a,b=[],c=this.params.tokenCls,d=this.params.textCls||c,f=!this._suggestExist;if(this._suggestExist=!(!this.suggest||!this.suggest.length),this.suggest){var g=!(f^this._suggestExist);g&&this.params.show&&this.params.show(this._suggestExist);for(var h=0;h<this.suggest.length;h++){for(var i=[],j=0;j<this.suggest[h].length;j++){var k=this.suggest[h][j].html||this.suggest[h][j].text;k=this.trim(k),this.params.selectionCls&&(k=this.parser.replace.call(this,k)),"text"!=this.suggest[h][j].type?(c&&(k='<div class="'+c+" "+c+"_type_"+this.suggest[h][j].type+'">'+k+"</div>"),i.push(k)):(d&&(k='<div class="'+d+'">'+k+"</div>"),i.push(k))}a=i.length,i=i.join(this.delimiter+" ");var l="";this.params.suggestItemCountCls&&(l=" "+this.params.suggestItemCountCls+a),b.push('<li class="'+this.params.suggestItemCls+l+'">'+i+"</li>"),this._activeSuggest=-1}a=b.length,b=b.join(""),this.suggestNode&&(b?e(this.root).addClass(this.params.suggestCls):e(this.root).removeClass(this.params.suggestCls),this.suggestNode.innerHTML=b)}},updateAutocomplete:function(){function a(){f.autocompleteNode.innerHTML="",e(f.root).removeClass(f.params.autocompleteCls)}var b=-1==this._activeSuggest?0:this._activeSuggest,c=this.suggest&&this.suggest.length&&this.suggest[b],d=this.text(),f=this;if(this.autocompleteNode)if(this.kit&&this.kit.length&&this.cloneNode)if(c&&c.length){var g,h,i=(this.kit[this.kit.length-1].text,0);if(g=[],this.suggest[0].length>i)for(var j=i;j<this.suggest[b].length;j++)g.push(this.suggest[b][j].text);g=g.join(this.delimiter+" "),g==d?e(this.root).addClass(this.params.readyCls):(h=0==g.toLowerCase().indexOf(d.toLowerCase()),e(this.root).removeClass(this.params.readyCls)),this.autocompleteNode.innerHTML=g.slice(d.length),this.cloneNode.innerHTML=this.html(),e(this.root).hasClass(this.params.suggestCls)&&h&&g.length<this.params.aunt?e(this.root).addClass(this.params.autocompleteCls):a()}else a();else a()},query:function(a){var b="";a=a||this.kit;for(var d=0;d<a.length;d++)d>0&&(b+=" "),b+=a[d].text;return c(b)},text:function(a){return a?(this.html(a),void 0):c(e(this.inputNode).text()||e(this.inputNode).val())},html:function(a){return a?("INPUT"==this.inputNode.tagName?e(this.inputNode).val(a):e(this.inputNode).html(a),void 0):e(this.inputNode).html()||this.text()},args:function(){var a={};return a.kit=this.kit,a.suggest=this.suggest||[],a.text=this.text(),a},parse:function(a){var b=a||this.text();return this.trailingSpace=" "===b[b.length-1],newKit=this.parser(this.kit,b)},invalidate:function(a){var b=this.parse(a);this.kit=b},brick:function(a){var b=!0,c=this.text(),d=[];if(a)for(var e=0;e<a.length;e++){var f=this.suggest&&this.suggest[0]&&this.suggest[0][e];b=b&&f&&a[e].text.toLowerCase()==f.text.toLowerCase(),d.push(f)}return b&&c[c.length-1]==this.delimiter?d:a},markSuggest:function(a){var c=e("."+this.params.suggestItemCls),d=this.params.suggestItemCurrentCls;a===b&&(a=this._activeSuggest),c.removeClass(d),a>=0&&(c.eq(a).addClass(d),this._activeSuggest=a,this.updateAutocomplete()),this._activeSuggest=a},getTail:function(a){var b,c=this.text(),d=[];if(a=a||this.kit)for(var e=0;e<a.length;e++)d.push(a[e].text);return d=d.join(this.delimiter+" "),0==c.indexOf(d)&&(b=c.substr(d.length,c.length)),b},minimize:function(){e(this.root).removeClass(this.params.suggestCls)},dispose:function(){e(this.root).attr("data-surt-inited","disposed"),e(this.root).off("mousedown","."+this.params.suggestItemCls,this._events.click),clearTimeout(this._upTimer)},trim:function(a){return String.prototype.trim?a.trim():a.replace(/^\s+|\s+$/g,"")},textMode:function(){return"INPUT"==this.inputNode.tagName||"text"==this.params.inputMode}},h.fn.constructor.prototype=h.fn,a.surt=h,"undefined"!=typeof module&&(module.exports=h),h.version="0.2.4"}(this),function(a,b){function c(a){var b="";if(a)for(var c=0;c<a.length;c++)c>0&&(b+=" "),b+=a[c].text;return b}var d=function(a,d){function e(a){"text"==a.type&&f.length&&"text"==f[f.length-1].type?f[f.length-1].text+=" "+a.text:f.push(a),h=g(h.replace(a.text,""))}var f=[],g=this.trim,h=d;if(this.delimiter&&(h=h.replace(new RegExp(this.delimiter,"g")," ")),h=h.replace(new RegExp("  ","g")," "),c(a)===h)return a;if(a)for(var i=0;i<a.length;i++){var j=h.indexOf(a[i].text),k=h[j-1],l=h[j+a[i].text.length];if((" "!==l&&l!==b||" "!==k&&k!==b)&&(j=-1),0==j)e(a[i]);else if(j>0){var m=g(h.substring(0,j));e({text:m,type:"text"}),e(a[i])}}return h=g(h),h&&e({text:h,type:"text"}),f};d.replace=function(a){function b(a){return String(a).replace(/([.?*+^$[\]\\(){}|-])/g,"\\$1")}var c=b(this.text());return c="((>[^<]*|^[^<>]*))("+c+")([w -]*)",a.replace(new RegExp(c,"i"),'$1<span class="'+this.params.selectionCls+'">$3</span>$4')},surt=a.surt||{},surt.fn=surt.fn||{},surt.fn.parser=d,"undefined"!=typeof module&&(module.exports=d)}(this),function(a){function b(a,b){for(var c=0,d=0;d<a.childNodes.length;d++){var e=$(a.childNodes[d]).text().length;if(c+=e,c>=b)return{child:a.childNodes[d],n:b-(c-e)}}return 0>b&&(c=0),{child:a.childNodes[a.childNodes.length-1],n:c}}var c=a.surt||{};c.fn=c.fn||{},c.fn.getCursor=function(){var b;if("INPUT"==this.inputNode.tagName)b=this.inputNode.selectionEnd;else{if(!a.getSelection)return;var c=a.getSelection();if(!c.anchorNode)return;var d=c.getRangeAt(0),e=d.startContainer,f=d.startOffset,g=e;for(b=f;g&&g!=this.inputNode;){for(var h,i=g.previousSibling;i;)h=$(i).text(),b+=h.length,i=i.previousSibling;g=g.parentNode}}return b},c.fn.saveCursor=function(){return this.cursorPos=this.getCursor(),this._lastPos=this.cursorPos==this.text().length,this.cursorPos},c.fn.restoreCursor=function(c){if(a.getSelection){var d,e=document.createRange(),f=a.getSelection(),g=this.inputNode;for(d=this._lastPos?this.text().length:this.cursorPos,c=c||d;g&&1==g.nodeType;)obj=b(g,c),g=obj.child,c=obj.n;g&&3==g.nodeType&&(c=Math.min(c,this.$(g).text().length),c=Math.max(c,0),e.setStart(g,c),e.collapse(!0),f.removeAllRanges(),f.addRange(e)),this.inputNode.focus()}}}(this);