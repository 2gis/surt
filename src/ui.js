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
            this.delimiter = params.delimiter || ''; // Разделитель токенов, между правой границей токена и следующим за ним пробелом
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

            // Выбрать сагест и принудительно затолкать его в инпут
            function pickSuggest() {
                var data = self.args();

                data.kit = self.suggest[self._activeSuggest];

                self.set({
                    kit: data.kit
                }, true);
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
                    var key = e.keyCode,
                        data;

                    self._pressedKeys--;
                    //if (self._pressedKeys < 0) self._pressedKeys = 0;
                    
                    if (isControlKey(key)) return true;

                    if ((key == 40 || key == 38) && $(self.root).hasClass(params.suggestCls) ) {
                        return;
                    }

                    self.updateInput();
                    self.updateAutocomplete();

                    data = self.args();

                    if (params.change) {
                        params.change(e, data);
                    }
                })
                .on('keydown input paste', function(e) { // input paste
                    var key = e.keyCode,
                        index,
                        data;

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
                        e.preventDefault();

                        if ( $(self.root).hasClass(params.suggestCls) && $('.' + params.suggestItemCurrentCls).length ) {
                            pickSuggest();
                        } else {
                            // Здесь сабмит
                            if (self.params.submit) {
                                self.params.submit();
                            }
                        }
                        // Удаляем сагесты и автокомплит
                        $(self.root).removeClass(params.suggestCls);
                        $(self.root).removeClass(params.autocompleteCls);
                        self.markSuggest(-1); // Снятие выделения с сагеста
                        // self.set({ 
                        //     suggest: []
                        // });

                        return false;
                    }

                    // Стрелка вниз
                    if (key == 40) {
                        // console.log('down');
                        index = 0;

                        if (self._activeSuggest >= 0) {
                            index = self._activeSuggest < self.suggest.length - 1 ? self._activeSuggest + 1 : 0;
                        }

                        self.markSuggest(index);

                        return false;
                    }

                    // Стрелка вверх
                    if (key == 38) {
                        // console.log('up');
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
                        if ( $(self.root).hasClass(params.suggestCls) && $(self.root).hasClass(params.autocompleteCls) && self.getCursor() >= length ) {
                            data = self.args();
                            data.kit = self.suggest[0];
                            self.set(data, true);
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
                    $(self.root).removeClass(self.params.readyCls);
                });

            this._events.click = function() {
                var suggestsItems = $('.' + params.suggestItemCls),
                    index = suggestsItems.index( $(this) ),
                    data = self.args();

                data.kit = self.suggest[index];
                self.set(data, true);
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

        // true если новый кит по смыслу отличается от текущего
        semanticChanged: function(kit) {
            return !kitsAreEqual(kit, this.kit);
        },

        // Возвращает текущий кит
        get: function() {
            return this.kit;
        },

        // Устанавливает новые данные (set - единственная точка входа на новые данные ORLY)
        set: function(data, force) {
            data = data || {};

            if (this._pressedKeys > 0) return; // Если на момент входа в функцию пользователь уже нажал новую клавишу - сетить бессмысленно

            if (data.kit && data.kit.length === undefined) { // not an array
                data.kit = [data.kit];
            }

            var same = kitsAreEqual(data.kit, this.kit);

            if (data.kit) this.kit = data.kit;
            this.suggest = data.suggest;

            this.saveCursor();
            this.updateSuggest();

            if (!same || force) this.updateKit(force);
            this.updateAutocomplete();

            this.restoreCursor();
        },

        // Устанавливает только данные поисоковй строки
        setKit: function(kit) {
            // if (kitsAreEqual(kit, this.kit)) return;

            this.kit = kit;
            this.updateKit();
        },

        // Обновляет UI
        update: function() {
            this.updateKit();
            this.updateSuggest();
            this.updateAutocomplete();
        },

        // Обновляет инпут по смыслам, включая хвост
        updateInput: function() {
            var parsedKit = this.parse(),
                newKit = this.brick(parsedKit),
                tail = this.getTail(newKit); // Возвращает нетокенные ошметки, типа ", "

            if (this.semanticChanged(newKit) || tail) {
                this.setKit(newKit);
                
                if (tail && this.params.inputMode != 'text') {
                    $(this.inputNode).append(tail.replace(' ', '&nbsp;'));
                    this.restoreCursor(999);
                }
            }
        },

        // Обновляет html в инпуте
        // force - обновляет код в инпуте в любом случае
        updateKit: function(force) {
            var inputHTML = [],
                tokenCls = this.params.tokenCls,
                textCls = this.params.textCls || tokenCls,
                left = '',
                right = '';

            if (this.kit) {
                this.saveCursor();

                for (var i = 0 ; i < this.kit.length ; i++) {
                    var html = this.kit[i].text.trim();

                    if (this.params.inputMode != 'text') {
                        if (this.kit[i].type == "text" && textCls) {
                            left = '<div class="' + textCls + '">';
                            right = '</div>';
                        } else if (tokenCls) {
                            left = '<div class="' + tokenCls + ' ' + tokenCls + '_type_' + this.kit[i].type + '">';
                            right = '</div>';
                        }
                        html = left + html + right;
                    }
                    // После всех токенов, кроме крайне правого, выставлять разделитель (если он есть)
                    // if (i != this.kit.length - 1) {
                    //     html += this.delimiter;
                    // }

                    inputHTML.push(html);
                }

                inputHTML = inputHTML.join(this.delimiter + ' ');
                // if (this.trailingSpace) inputHTML += space;
                if (this.params.inputMode != 'text' || force) {
                    this.html(inputHTML);
                    // this.inputNode.innerHTML = inputHTML;
                    this.restoreCursor();
                }
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

                    kit = kit.join(this.delimiter + ' ');
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
            var active = self._activeSuggest || 0, // Индекс текущего сагеста
                su = this.suggest && this.suggest.length && this.suggest[active], // Текущий сагест
                text = this.text();

            // Автокомплит
            if (this.kit && this.kit.length && this.cloneNode) {
                if (su && su.length) { // Сагест есть, его надо затолкать в автокомплит
                    var lastKitText = this.kit[this.kit.length - 1].text, // Неполный токен, который надо сагестировать
                        kitPos = 0, //= this.kit.length - 1, // Номер крайнего токена, который будет при вводе следующего символа
                        suggestText, // Результат преобразования текущего сагеста в текст, как если бы он был в инпуте и мы взяли бы text()
                        isAutocomplete; // Текст в строке пока совпадает с сагестом, и имеет смысл его автокомплитить

                    // if (this.trailingSpace) { // На левой границе второго (нового) токена - то есть первый уже окуклился, и выводить комплит на первый токен сагеста уже не надо
                    //     kitPos++;
                    // }
                    // Преобразуем текущий сагест в текст
                    suggestText = [];
                    if (this.suggest[0].length > kitPos) {
                        for (var i = kitPos ; i < this.suggest[0].length ; i++) {
                            suggestText.push(this.suggest[0][i].text);
                        }
                    }
                    suggestText = suggestText.join(this.delimiter + ' ');
                    if (suggestText == text) { // Автокомплит полностью набран, пора нажимать ентер
                        $(this.root).addClass(this.params.readyCls);
                    } else {
                        isAutocomplete = suggestText.toLowerCase().indexOf(text.toLowerCase()) == 0;
                        $(this.root).removeClass(this.params.readyCls);
                    }

                    this.autocompleteNode.innerHTML = suggestText.slice(text.length);
                    this.cloneNode.innerHTML = this.html();
                    if ($(this.root).hasClass(this.params.suggestCls) && isAutocomplete) {
                        $(this.root).addClass(this.params.autocompleteCls);
                    } else {
                        $(this.root).removeClass(this.params.autocompleteCls);
                    }
                } else { // Сагестов нет, удаляем текст из автокомплита
                    this.autocompleteNode.innerHTML = '';
                    $(this.root).removeClass(this.params.autocompleteCls);
                }
            } else {
                $(this.root).removeClass(this.params.autocompleteCls);
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

        // Возвращает или устанавливает текст в инпут
        text: function(text) {
            if (!text) {
                return spaces($(this.inputNode).text() || $(this.inputNode).val());
            } else {
                this.html(text);
            }
        },

        // Возвращает или устанавливает html в инпут
        html: function(html) {
            if (!html) {
                return $(this.inputNode).html() || this.text();
            } else {
                if (this.inputNode.tagName == 'INPUT') {
                    $(this.inputNode).val(html);
                } else {
                    $(this.inputNode).html(html);
                }
            }
        },

        // Возвращает текущую версию с данными
        args: function() {
            var data = {};

            data.kit = this.kit;
            data.suggest = this.suggest || []; // Почему может быть undefined?
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

        // Окукливает токены если в конце стоит разделитель и они точно совпадают с первым сагестом
        brick: function(kit) {
            var sameText = true,
                text = this.text(),
                newKit = [];

            if (kit) {
                for (var i = 0 ; i < kit.length ; i++) {
                    var sToken = this.suggest && this.suggest[0] && this.suggest[0][i];
                    sameText = sameText && sToken && kit[i].text.toLowerCase() == sToken.text.toLowerCase();
                    newKit.push(sToken);
                }
            }

            if (sameText && text[text.length - 1] == this.delimiter) {
                return newKit;
            } else {
                return kit;
            }
        },

        // Выставляет класс текущности на кит сагеста номер index, и удаляет его с остальных
        markSuggest: function(index) {
            var suggestsItems = $('.' + this.params.suggestItemCls),
                currentCls = this.params.suggestItemCurrentCls;

            suggestsItems.removeClass(currentCls); // Удаляем со всех сагестов класс текущности
            if (index >= 0) {
                suggestsItems.eq(index).addClass(currentCls); // Если индекс не отрицательный - добавляем класс на текущий кит сагеста
                this._activeSuggest = index;
            }
        },

        // Возвращает нетокенные ошметки типа ", "
        getTail: function(kit) {
            var text = this.text(),
                kitText = [],
                tail;

            kit = kit || this.kit;

            if (kit) {
                for (var i = 0 ; i < kit.length ; i++) {
                    kitText.push(kit[i].text);
                }
            }
            kitText = kitText.join(this.delimiter + ' ');

            if (text.indexOf(kitText) == 0) {
                tail = text.substr(kitText.length, text.length);
            }
            // console.log('text', text, kitText, tail);

            return tail;
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

    surt.version = '0.2.3';

    // if ($ && $.fn) {
    //     $.fn.surt = surt;
    // }
})(this);