(function(window, undefined) {
var
    $,
    space = String.fromCharCode(160),
    defaultParams = {
        input: '.surt__input',
        suggest: '.surt__suggests',
        suggestItemCls: 'surt__suggests-item'
    };

    function spaces(text) {
        var re = new RegExp(space, "g"); // Заменяем неразрывные пробелы на пробел

        return text.replace(re, " ");
    }

    function kitsAreEqual(kit1, kit2) {
        var result = true;

        kit1 = kit1 || [];
        kit2 = kit2 || [];

        if (!kit1.length || !kit2.length) return !(kit1.length || kit2.length);

        if (kit1.length != kit2.length) return;

        for (var i = 0 ; i < kit1.length ; i++) {
            result = result && (kit1[i].text == kit2[i].text) && (kit1[i].type == kit2[i].type);
        }

        return result && (kit1.length == kit2.length);
    }

    var surt = function(params) {
        params = params || {};

        for (var key in defaultParams) {
            if (!params[key]) {
                params[key] = defaultParams[key];
            }
        }

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
                params.input = $(params.input, params.root)[0];
            }
            if (!params.input) {
                params.input = $('[contenteditable="true"]', params.root);
            }
            validateNode(params.input, 'params.input');

            if ($(params.root).attr('data-surt-inited') == 'true') {
                throw new Error('Surt: already initialized');
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
            var self = this,
                root = params.root;

            params = params || {};
            this.$ = $;
            this.params = params;
            this.parser = surt.parser;
            this.inputNode = $(params.input, root)[0];
            this.root = $(params.root, root)[0];
            this.suggestNode = $(params.suggest, root)[0];
            this.cloneNode = $(params.clone, root)[0];
            this.autocompleteNode = $(params.autocomplete, root)[0];
            this._pressedKeys = 0;
            this._time = new Date().getTime();
            this._events = {};

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
                // Left, Right, Shift, Left Ctrl, Right Ctrl, Cmd, End, Home, Enter
                return key == 37 || key == 39 || key == 16 || key == 17 || key == 18 || key == 91 || key == 35 || key == 36 || key == 13;
            }

            // Навешиваем все необходимые события
            $(this.inputNode)
                .on('keyup', function(e){
                    var key = e.keyCode;

                    self._pressedKeys--;
                    //if (self._pressedKeys < 0) self._pressedKeys = 0;
                    
                    if (isControlKey(key)) return true;

                    if (key == 40 && $('.surt').hasClass(params.suggestCls) ) {
                        // var currentItem = 0; стрелка вниз
                    }

                    if (key == 38 || key == 40 || (key == 32 && self.getCursor() >= self.text().length)) return false;

                    var newKit = self.parse(),
                        data = self.args();

                    data.kit = newKit;
                    if (params.change) {
                        params.change(e, data);
                    }
                })
                .on('keydown input paste', function(e) { // input paste
                    var key = e.keyCode,
                        index,
                        data;

                    // Пробел
                    if (key == 32 && self.getCursor() >= self.text().length) {
                        if (!self.trailingSpace/* && self.kit.length*/) {
                            $(self.inputNode).append('&nbsp;');

                            var newKit = self.parse();
                            
                            data = self.args();
                            data.kit = newKit;
                            if (params.change) {
                                params.change(e, data);
                            }
                            self.restoreCursor(self.getCursor() + 1);
                        }

                        return false;
                    }

                    // Прочие буквы
                    if ( e.type == 'keydown' && !isControlKey(key) ) { // При нажатии на символ
                        self._pressedKeys++;
                        resetTimer();
                    }

                    // Для контрол-клавиш блокировки быть не должно
                    if (isControlKey(key)) {
                        self._pressedKeys = 0;
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
                        index = 0;

                        if (self._activeSuggest >= 0) {
                            index = self._activeSuggest < self.suggest.length - 1 ? self._activeSuggest + 1 : 0;
                        }

                        self.markSuggest(index);

                        return false;
                    }

                    // Стрелка вверх
                    if (key == 38) {
                        index = self.suggest.length - 1;

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
                            data = self.args();
                            data.kit = self.suggest[0];
                            self.set(data);
                            self.restoreCursor(self.text().length); // != length
                        }
                    }
                })
                .on('paste', function() {
                    setTimeout(function(){
                        self.parse();
                    }, 0);
                })
                .on('focus', function() {
                    $(self.root).addClass(self.params.stateFocusCls);
                })
                .on('blur', function() {
                    $(self.root).removeClass(self.params.stateFocusCls);
                });

            this._events.click = function() {
                var suggestsItems = $('.' + params.suggestItemCls),
                    index = suggestsItems.index( $(this) ),
                    data = self.args();

                data.kit = self.suggest[ index ];
                self.set(data);
            };

            $(this.root)
                .on('click', function(e) {
                    if (!$(e.target).closest(self.root).length) {
                        $(self.root).removeClass(self.params.suggestCls).removeClass(self.params.autocompleteCls);
                    }

                    e.stopPropagation();
                })
                .on('click', '.' + self.params.suggestItemCls, self._events.click);
        },

        // Возвращает текущий кит
        get: function() {
            return this.kit;
        },

        // Устанавливает новые данные (set - единственная точка входа на новые данные)
        set: function(data) {
            data = data || {};

            if (this._pressedKeys > 0) return; // Если на момент входа в функцию пользователь уже нажал новую клавишу - сетить бессмысленно

            if (data.kit && data.kit.length === undefined) { // not an array
                data.kit = [data.kit];
            }

            var same = kitsAreEqual(data.kit, this.kit);

            this.kit = data.kit;
            this.suggest = data.suggest || [];

            this.saveCursor();
            this.updateSuggest();

            if (!same) this.updateKit();
            this.updateAutocomplete();

            this.restoreCursor();
        },

        // Устанавливает только данные поисоковй строки
        // setKit: function(kit) {
        //     if (kitsAreEqual(kit, this.kit)) return;

        //     this.kit = kit;
        //     this.updateKit();
        // },

        // Обновляет UI
        update: function() {
            // Здесь все манипуляции с дом-деревом
            this.saveCursor();

            this.updateKit();
            this.updateSuggest();
            this.updateAutocomplete();

            this.restoreCursor();
        },

        // Обновляет html в инпуте
        updateKit: function() {
            var inputHTML = [],
                tokenCls = this.params.tokenCls,
                textCls = this.params.textCls || tokenCls;

            if (this.kit) {
                for (var i = 0 ; i < this.kit.length ; i++) {
                    var html = this.kit[i].text.trim();

                    if (this.kit[i].type == "text" && this.params.inputMode != 'text') {
                        if (textCls) {
                            html = '<div class="' + textCls + '">' + html + '</div>';
                        }
                    } else if (tokenCls && this.params.inputMode != 'text') {
                        var kitClose = this.params.tokenCloseCls,
                            kitCloseHTML = !!kitClose ? '<div class="' + kitClose + '"></div>' : '';

                        html = '<div class="' + tokenCls + ' ' + tokenCls + '_type_' + this.kit[i].type + '">' + html + kitCloseHTML + '</div>';
                    }

                    inputHTML.push(html);
                }

                inputHTML = inputHTML.join(' ');
                if (this.trailingSpace) inputHTML += space;
                this.inputNode.innerHTML = inputHTML;
            }
        },

        // Обновляет HTML в выпадашке сагестов
        updateSuggest: function() {
            var suggestHTML = [],
                tokenCls = this.params.tokenCls,
                textCls = this.params.textCls || tokenCls;

            if (this.suggest) {
                for (var i = 0 ; i < this.suggest.length ; i++) {
                    var kit = [];

                    for (var j = 0 ; j < this.suggest[i].length ; j++) {
                        var html = this.suggest[i][j].text.trim();

                        if ( this.suggest[i][j].type != "text" ) {
                            if (tokenCls) {
                                html = '<div class="' + tokenCls + ' ' + tokenCls + '_type_' + this.suggest[i][j].type + '">' + html + '</div>';
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
            }
        },

        // Обновляет html в автокомплите
        updateAutocomplete: function() {
            // Автокомплит
            if (this.suggest && this.suggest.length && this.suggest[0].length && this.kit && this.kit.length && this.cloneNode) {
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
            newKit = this.parser(this.kit, text);
            // this.kit = newKit; // ?

            return newKit;
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
        },

        dispose: function() {
            $(this.root).attr('data-surt-inited', 'disposed');
            $(this.root).off('click', '.' + this.params.suggestItemCls, this._events.click);
            clearTimeout(this._upTimer);
        }
    };

    surt.fn.constructor.prototype = surt.fn;

    window.surt = surt;

    if (typeof module != "undefined") {
        module.exports = surt;
    }

    surt.version = '0.2.2';

    // if ($ && $.fn) {
    //     $.fn.surt = surt;
    // }
})(this);
(function(window, undefined) {
    var surt = window.surt || {};

    /*
     * Generates text from kit
     * @kit - kit in standart format
     * @returns - text generated from kit
     */
    function kit2text(kit) {
        var text = '';

        if (kit) {
            for (var i = 0 ; i < kit.length ; i++) {
                if (i > 0) {
                    text += ' ';
                }

                text += kit[i].text;
            }
        }

        return text;
    }

    /**
     * @kit - old kit of tokens
     * @text - new user query
     * @return - new kit based on old kit tokens and new text 
     */
    var parser = function(kit, text) {
        var newKit = [];

        /*
         * Pushing token to newKit and remove text of token from text
         * text.indexOf(token.text) === 0!!!
         */
        function pushToken(token) {
            if (token.type == 'text' && newKit.length && newKit[newKit.length - 1].type == 'text') { // Объединение соседних текстовых токенов
                newKit[newKit.length - 1].text += ' ' + token.text;
            } else {
                newKit.push(token);
            }
            text = text.replace(token.text, '').trim();
        }

        if (kit2text(kit) === text) return kit;

        // Cycle by kit (each token)
        if (kit) {
            for (var i = 0 ; i < kit.length ; i++) {
                var index = text.indexOf(kit[i].text),
                    beforeChar = text[index - 1],
                    afterChar = text[index + kit[i].text.length];

                if ((afterChar !== ' ' && afterChar !== undefined) || // После найденной подстрокой не пробел и не конец строки - это не токен
                    (beforeChar !== ' ' && beforeChar !== undefined)) { // Или перед найденной подстрокой
                    index = -1;
                }

                if (index == 0) {
                    pushToken(kit[i]);
                } else if (index > 0) {
                    var newPlainText = text.substring(0, index).trim();

                    pushToken({
                        text: newPlainText,
                        type: 'text'
                    });

                    pushToken(kit[i]);
                }
            }
        }

        // Last undefined token
        if (text) {
            pushToken({
                text: text,
                type: 'text'
            });
        }

        return newKit;
    };

    surt.parser = parser;

    if (typeof module != "undefined") {
        module.exports = parser;
    }
})(this);
// Cursor positioning in content editable container
(function(window, undefined) {
    var surt = window.surt || {};

    surt.fn = surt.fn || {};

    /*
     * Находит ребенка и позицию внутри него по заданной ноде и позиции внутри этой ноды
     * @node - нода, в которой известна текстовая позиция курсора
     * @N - текстовая позиция курсора
     * @return {
            child - прямой потомок node, внутри которого оказался курсор (включая текстовые)
            n - номер текстовой позиции в child
        }
     */
    function findPosChild(node, N) {
        var sum = 0;
        
        for (var i = 0 ; i < node.childNodes.length ; i++) {
            var length = $(node.childNodes[i]).text().length;

            sum += length;
            if (sum >= N) {
                return {
                    child: node.childNodes[i],
                    n: N - (sum - length)
                };
            }
        }

        if (N < 0) { // При отрицательной позиции ставим курсор в начало
            sum = 0;
        }
        
        return {
            child: node.childNodes[node.childNodes.length - 1],
            n: sum
        };
    }

    // Возвращает позицию курсора
    surt.fn.getCursor = function() {
        if (!window.getSelection) return; // IE8-

        var selection = window.getSelection();

        if ( !selection.anchorNode ) return; // No selection at all

        var range = selection.getRangeAt(0),
            container = range.startContainer, // Returns the Node within which the Range starts.
            offset = range.startOffset, // Returns a number representing where in the startContainer the Range starts.
            child = container; // Может быть текстовая нода, наверняка
        
        // Цикл вверх по родителям, вплоть до node
        var N = offset;
        while (child && child != this.inputNode) {
            var sibling = child.previousSibling,
                text;
            
            while (sibling) {
                text = $(sibling).text();
                N += text.length; // К позиции курсора внутри child прибавляем позицию самого child
                sibling = sibling.previousSibling;
            }

            child = child.parentNode;
        }

        return N;
    };

    // Сохраняет позицию курсора
    surt.fn.saveCursor = function() {
        this.cursorPos = this.getCursor();

        return this.cursorPos;
    };

    surt.fn.restoreCursor = function(n) {
        if (!window.getSelection) return; // IE8-

        // if (!node || typeof N == 'undefined') return;

        var range = document.createRange(),
            selection = window.getSelection(),
            targetNode = this.inputNode;
        
        n = n || this.cursorPos;
        
        // Цикл вниз по детям для поиска текстовой ноды куда надо выставить курсор
        while (targetNode && targetNode.nodeType == 1) {
            obj = findPosChild(targetNode, n);
            targetNode = obj.child;
            n = obj.n;
        }
        
        if (targetNode && targetNode.nodeType == 3) {
            n = Math.min(n, this.$(targetNode).text().length);
            n = Math.max(n, 0);
            range.setStart(targetNode, n); // Sets the start position of a Range.
            range.collapse(true); // Collapses the Range to one of its boundary points.
            selection.removeAllRanges(); // Removes all ranges from the selection.
            selection.addRange(range); // A range object that will be added to the selection.
        }
        
        this.inputNode.focus();
    };
})(this);