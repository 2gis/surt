(function(window, undefined) {
    var $,
        space = String.fromCharCode(160);

    function spaces(text) {
        var re = new RegExp(space, "g"); // Заменяем неразрывные пробелы на пробел
        
        return text.replace(re, " ");
    };

    var surt = function(params) {
        params = params || {};

        $ = window.jQuery || params.$;

        if (!$) return;

        // Обработка режима плагина jQuery
        if (!(params && params.root) && this && this[0] && this[0].nodeType == 1) {
            params.root = this[0];
        }

        function validateNode(node, name) {
            if (!(node && node.nodeType == 1)) {
                throw new Error('Surt: html element ' + name + ' not found or it has wrong nodeType');
            }
        }

        try {
            params.root = $(params.root)[0];

            validateNode(params.root, 'params.root');
            if (params.input) {
                params.input = $(params.input)[0];
            }
            if (!params.input) {
                params.input = $('[contenteditable="true"]', params.root);
            }
            validateNode(params.input, 'params.input');
            
            if ($(params.root).attr('data-surt-inited') == 'true') {
                throw new Error('Surt: already initialized');

                return;
            }

            ret = new surt.fn.constructor(params, $);
        } catch (e) {
            console.warn(e.name + ': ', e.message);

            return;
        }

        return ret;
    };

    surt.fn = {
        // Создает объект surt
        constructor: function(params, $) {
            var self = this;

            params = params || {};
            this.params = params;
            this.parser = surt.parser;
            this.inputNode = $(params.input)[0];
            this.root = $(params.root)[0];
            this.suggestNode = $(params.suggest)[0];
            this.cloneNode = $(params.clone)[0];
            this.autocompleteNode = $(params.autocomplete)[0];

            this.kit = [];

            // К этому месту считаем, что инициализация прошла успешно
            $(this.root).attr('data-surt-inited', true);

            // Навешиваем все необходимые события
            $(this.inputNode)
                .on('keyup', function(e){
                    var key = e.keyCode;

                    // Пропускаем клавиши Left, Right, Shift, Left Ctrl, Right Ctrl, Cmd, End, Home без колбека
                    if (key == 37 || key == 39 || key == 16 || key == 17 || key == 18 || key == 91 || key == 35 || key == 36 ) return true;

                    if (key == 40 && $('.surt').hasClass(params.suggestCls) ) {
                        // var currentItem = 0; стрелка вниз
                    }

                    self.parse();
                    params.change && params.change(e, self.args());
                })
                .on('keydown input paste', function(e) {
                    if (e.keyCode == 13) return false; // Enter
                })
                .on('paste', function(e) {
                    setTimeout(function(){
                        self.parse();
                        //params.change && params.change( e, self.args() );
                    }, 0);
                })
                .on('focus', function() {
                    $('.surt').addClass('surt_state_focus');
                })
                .on('blur', function() {
                    $('.surt').removeClass('surt_state_focus');
                });
        },

        dispose: function() {
            $(this.root).attr('data-surt-inited', 'disposed');
        },

        // Возвращает текущий кит
        get: function() {
            return this.kit;
        },

        // Устанавливает новые данные (set - единственная точка входа на новые данные)
        set: function(data) {
            data = data || {};
            this.kit = data.kit || [];
            this.suggest = data.suggest || [];
            this.update();
        },

        // Обновляет UI
        update: function() {
            // Здесь все манипуляции с дом-деревом
            this.saveCursor();

            var inputHTML = [],
                suggestHTML = [],
                cls = this.params.kitCls,
                textCls = this.params.textCls || cls;

            for (var i = 0 ; i < this.kit.length ; i++) {
                var html = this.kit[i].text.trim();

                if ( this.kit[i].type != "text" ) {
                    if (cls) {
                        html = '<div class="' + cls + ' ' + cls + '_type_' + this.kit[i].type + '">' + html + '</div>';
                    }

                    inputHTML.push(html);
                } else {
                    if (textCls) {
                        html = '<div class="' + textCls + '">' + html + '</div>';
                    }

                    inputHTML.push(html);
                }
            }

            inputHTML = inputHTML.join(' ');
            if (this.trailingSpace) inputHTML += space;
            this.inputNode.innerHTML = inputHTML;

            for (var i = 0 ; i < this.suggest.length ; i++) {
                var kit = [];

                for (var j = 0 ; j < this.suggest[i].length ; j++) {
                    var html = this.suggest[i][j].text.trim();

                    if ( this.suggest[i][j].type != "text" ) {
                        if (cls) {
                            html = '<div class="' + cls + ' ' + cls + '_type_' + this.suggest[i][j].type + '">' + html + '</div>';
                        }

                        kit.push(html);
                    } else {
                        if (textCls) {
                            html = '<div class="' + textCls + '">' + html + '</div>';
                        }

                        kit.push(html);
                    }
                        
                }

                kit = kit.join(' ');
                suggestHTML.push('<li class="' + this.params.suggestItemCls + '">' + kit + '</li>');
            }
            suggestHTML = suggestHTML.join('');
            if (this.suggestNode) {
                if (suggestHTML) $(this.root).addClass(this.params.suggestCls);
                else $(this.root).removeClass(this.params.suggestCls);
                this.suggestNode.innerHTML = suggestHTML;
            }

            if (this.suggest.length && this.suggest[0].length && this.kit.length) {

                var lastNodeText = this.kit[this.kit.length - 1].text,
                    firstSuggestText = this.suggest[0][this.suggest[0].length - 1].text;
                var isAutocomplete = !firstSuggestText.toLowerCase().indexOf( lastNodeText.toLowerCase() );

                if ($(this.root).hasClass(this.params.suggestCls) && isAutocomplete) {
                    this.cloneNode.innerHTML = this.inputNode.innerHTML;
                    this.autocompleteNode.innerHTML = firstSuggestText.slice( lastNodeText.length );
                    $(this.root).addClass( this.params.autocompleteCls );
                } else {
                    $(this.root).removeClass( this.params.autocompleteCls );
                }

            } else {
                $(this.root).removeClass( this.params.autocompleteCls );
            }

            this.restoreCursor();
        },

        // Возвращает текст из поисковой строки
        query: function(kit) {
            var text = '';
            kit = kit || this.kit;

            for (var i = 0 ; i < kit.length ; i++) {
                if (i > 0) text += ' ';
                text += kit[i].text;
            }

            return spaces(text);
        },

        text: function() {
            return spaces($(this.inputNode).text());
        },

        // Возвращает текущую версию с данными
        args: function() {
            var data = {};

            data.kit = this.kit;
            data.suggest = {};
            data.text = this.text();

            return data;
        },

        // Вычисляем новый кит
        parse: function() {
            var text = this.text();

            this.trailingSpace = text[text.length - 1] === ' ';
            newKit = this.parser( this.kit, text );
            this.kit = newKit;
        }
    };

    surt.fn.constructor.prototype = surt.fn;

    window.surt = surt;

    if (typeof module != "undefined") {
        module.exports = surt;
    }

    surt.version = '0.1.0';

    // if ($ && $.fn) {
    //     $.fn.surt = surt;
    // }
})(this);