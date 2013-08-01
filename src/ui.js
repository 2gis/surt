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
            this.$ = $;
            this.params = params;
            this.parser = surt.parser;
            this.inputNode = $(params.input)[0];
            this.root = $(params.root)[0];
            this.suggestNode = $(params.suggest)[0];
            this.cloneNode = $(params.clone)[0];
            this.autocompleteNode = $(params.autocomplete)[0];

            this.kit = [];

            this._activeSuggest = -1;

            // К этому месту считаем, что инициализация прошла успешно
            $(this.root).attr('data-surt-inited', true);

            function resetTimer() {
                clearTimeout(self._upTimer);
                self._upTimer = setTimeout(function() {
                    self._pressedKeys = 0;
                }, 300);
            }

            function pickSuggest() {
                var data = self.args();

                data.kit = self.suggest[self._activeSuggest];
                self.set(data);
                self.restoreCursor(self.text().length); // Крайне правое положение
            }

            // Если нажата не буква - возвращает true
            function isControlKey(key) {
                return key == 37 || key == 39 || key == 16 || key == 17 || key == 18 || key == 91 || key == 35 || key == 36;
            }

            // Навешиваем все необходимые события
            $(this.inputNode)
                .on('keyup', function(e){
                    var key = e.keyCode;

                    self._pressedKeys--;
                    //if (self._pressedKeys < 0) self._pressedKeys = 0;

                    // Пропускаем клавиши Left, Right, Shift, Left Ctrl, Right Ctrl, Cmd, End, Home без колбека
                    if (isControlKey(key)) return true;

                    if (key == 40 && $('.surt').hasClass(params.suggestCls) ) {
                        // var currentItem = 0; стрелка вниз
                    }

                    if (key == 38 || key == 40) return false;

                    self.parse();
                    params.change && params.change(e, self.args());
                })
                .on('keydown input paste', function(e) {
                    var key = e.keyCode;

                    if ( e.type == 'keydown' && !isControlKey(key) ) { // При нажатии на символ
                        self._pressedKeys++;
                        resetTimer();
                    }

                    // Enter
                    if (key == 13) {
                        if ( $(self.root).hasClass(params.suggestCls) && $('.' + params.suggestItemCurrentCls).length ) {
                            pickSuggest();
                        } else {
                            // Здесь сабмит
                        }

                        return false;
                    }

                    // Стрелка вниз
                    if (key == 40) {
                        var index = 0;
                        if (self._activeSuggest >= 0)
                            index = self._activeSuggest < self.suggest.length - 1 ? self._activeSuggest + 1 : 0;

                        self.markSuggest(index);

                        return false;
                    }

                    // Стрелка вверх
                    if (key == 38) {
                        var index = self.suggest.length - 1;

                        if (self._activeSuggest >= 0) {
                            index = self._activeSuggest > 0 ? self._activeSuggest - 1 : self.suggest.length - 1;
                        }

                        self.markSuggest(index);

                        return false;
                    }

                    // Стрелка вправо
                    if (key == 39) {
                        var length = self.text().length;
                        // Если выставлены модификаторы, и если курсор в крайне правом положении, делаем сет с новыми данными (довершаем автокомплит)
                        if ( $(self.root).hasClass( params.suggestCls ) && $(self.root).hasClass( params.autocompleteCls ) && self.getCursor() >= length ) {
                            var data = self.args();

                            data.kit = self.suggest[0];
                            self.set(data);
                            self.restoreCursor(self.text().length); // != length
                        }
                    }
                })
                .on('paste', function(e) {
                    setTimeout(function(){
                        self.parse();
                    }, 0);
                })
                .on('focus', function() {
                    $(self.root).addClass(self.params.stateFocusCls);
                })
                .on('blur', function() {
                    $(self.root).removeClass(self.params.stateFocusCls);
                })

            $(document)
                .on('click', function(e) {
                    if ( !$(e.target).closest(self.root).length ) 
                        $(self.root).removeClass( self.params.suggestCls ).removeClass( self.params.autocompleteCls );

                    e.stopPropagation();
                })
                .on('click', '.' + self.params.suggestItemCls, function(e) {
                    var suggestsItems = $('.' + params.suggestItemCls),
                        index = suggestsItems.index( $(this) ),
                        data = self.args();

                    data.kit = self.suggest[ index ];
                    self.set(data);
                })
                .on('click', '.' + self.params.tokenCloseCls, function() {
                    $(this).parent().remove();
                    self.parse();
                });
        },

        dispose: function() {
            $(this.root).attr('data-surt-inited', 'disposed');
            clearTimeout(this._upTimer);
        },

        // Возвращает текущий кит
        get: function() {
            return this.kit;
        },

        // Устанавливает новые данные (set - единственная точка входа на новые данные)
        set: function(data) {

            if (this._pressedKeys) return; // Если на момент входа в функцию пользователь уже нажал новую клавишу - сетить бессмысленно

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
                cls = this.params.tokenCls,
                textCls = this.params.textCls || cls;

            for (var i = 0 ; i < this.kit.length ; i++) {
                var html = this.kit[i].text.trim();

                if ( this.kit[i].type != "text" ) {
                    if (cls) {
                        var kitClose = this.params.tokenCloseCls;
                        var kitCloseHTML = !!kitClose ? '<div class="' + kitClose + '"></div>' : '';

                        html = '<div class="' + cls + ' ' + cls + '_type_' + this.kit[i].type + '">' + html + kitCloseHTML + '</div>';
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
                this._activeSuggest = -1;
            }
            suggestHTML = suggestHTML.join('');
            if (this.suggestNode) {
                if (suggestHTML) $(this.root).addClass(this.params.suggestCls);
                else $(this.root).removeClass(this.params.suggestCls);
                this.suggestNode.innerHTML = suggestHTML;
            }

            // Автокомплит
            if (this.suggest.length && this.suggest[0].length && this.kit.length && this.cloneNode) {
                var lastKitText = this.kit[this.kit.length - 1].text, // Неполный токен, который надо сагестировать
                    kitPos = this.kit.length - 1, // Номер крайнего токена, который будет при вводе следующего символа
                    suggestText, // Текст сагеста для крайнего текстового токена
                    isAutocomplete; // Текст сагеста являеся автокомплитом

                if (this.trailingSpace) { // На левой границе второго (нового) токена - то есть первый уже окуклился, и выводить комплит на первый токен сагеста уже не надо
                    kitPos++;
                }
                suggestText = (this.suggest[0].length > kitPos) ? this.suggest[0][kitPos].text : '';
                isAutocomplete = !suggestText.toLowerCase().indexOf( lastKitText.toLowerCase() );

                if ($(this.root).hasClass(this.params.suggestCls) && isAutocomplete) {
                    this.cloneNode.innerHTML = this.inputNode.innerHTML;
                    this.autocompleteNode.innerHTML = suggestText.slice( lastKitText.length );
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
            data.suggest = this.suggest; // Почему был пустой объект? Договорились что была ошибка
            data.text = this.text();

            return data;
        },

        // Вычисляем новый кит
        parse: function() {
            var text = this.text();

            this.trailingSpace = text[text.length - 1] === ' ';
            newKit = this.parser( this.kit, text );
            this.kit = newKit;
        },

        markSuggest: function(index) {
            var suggestsItems = $('.' + this.params.suggestItemCls),
                currentCls = this.params.suggestItemCurrentCls;

            suggestsItems
                .removeClass(currentCls)
                .eq(index)
                .addClass(currentCls);

            this._activeSuggest = index;
        },

        minimize: function() {
            $(this.root).removeClass(this.params.suggestCls);
        }
    };

    surt.fn.constructor.prototype = surt.fn;

    window.surt = surt;

    if (typeof module != "undefined") {
        module.exports = surt;
    }

    surt.version = '0.2.0';

    // if ($ && $.fn) {
    //     $.fn.surt = surt;
    // }
})(this);