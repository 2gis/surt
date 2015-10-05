(function(window, undefined) {
var
    space = String.fromCharCode(160),
    defaultParams = {
        input: '.surt__input',
        suggest: '.surt__suggests',
        suggestItemCls: 'surt__suggests-item',
        aunt: 99
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
        var ret;

        params = params || {};

        for (var key in defaultParams) {
            if (!params[key]) {
                params[key] = defaultParams[key];
            }
        }

        params.root = this[0];

        function validateNode(node, name) {
            if (!(node && node.nodeType == 1)) {
                throw new Error('Surt: html element ' + name + ' not found or it has wrong nodeType');
            }
        }

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

        ret = new surt.fn.constructor(params);

        return ret;
    };

    surt.fn = {
        // Создает объект surt
        constructor: function(params) {
            var self = this,
                root = params.root;

            params = params || {};
            this.params = params;
            // this.parser = surt.parser;
            this.inputNode = $(params.input, root)[0];
            this.root = $(params.root, root)[0];
            this.suggestNode = $(params.suggest, root)[0];
            this.cloneNode = $(params.clone, root)[0];
            this.hintNode = $(params.hint, root)[0];
            this.delimiter = params.delimiter || ''; // Разделитель токенов, между правой границей токена и следующим за ним пробелом
            this.placeholder = params.placeholder || '';
            this._submitEvents = params.events || ['enter'];
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
            // submit true если синхронно за выбором следует сабмит
            function pickSuggest(submit, e) {
                var data = self.args(),
                    suggest = self.params.selectionCls ? data.suggest : undefined; // Насильно обновляем сагест если могло поменяться выделение selectionCls

                data.kit = self.suggest[self._activeSuggest];

                self.set({
                    kit: data.kit,
                    suggest: suggest
                }, true);

                if (params.pick) params.pick(data.kit, submit, e);

                self.markSuggest(-1); // Снимаем выделение с сагестов

                self.scroll();
            }

            // Если нажата клавиша, меняющая текст - возвращает true
            function affectsToValue(key) {
                return key == 8 ||                  // backspace
                    key == 32 ||                    // пробел
                    key == 46 ||                    // delete
                    key > 47 && key < 91 ||         // числа, буквы, символы
                    key > 95 && key < 112 ||        // numpad
                    key > 159 && key < 177 ||
                    key > 187 && key < 193 ||
                    key > 218 && key < 223;
            }

            this.updateHint();

            // Навешиваем все необходимые события
            $(this.inputNode)
                .on('keyup.surt', function(e){
                    var key = e.keyCode,
                        data;

                    if (key == 27) return; // Esc

                    self._pressedKeys--;
                    if (self._pressedKeys < 0) self._pressedKeys = 0;

                    if ((key == 40 || key == 38) && $(self.root).hasClass(params.suggestCls) ) {
                        return;
                    }

                    // Если есть активный автокомплит, при дальнейшем наборе его нужно сначала подставить
                    if (self.suggest && self.suggest[self._activeSuggest] && affectsToValue(key)) {
                        var text = self.text(),
                            newChar = text.charAt(text.length - 1);

                        pickSuggest(false, e);

                        var newText = self.text() + self.delimiter + ' ' + newChar;

                        self.text(newText);
                        self.restoreCursor(newText.length);
                    }

                    self.updateInput();
                    self.updateHint();

                    data = self.args();

                    if (params.change && affectsToValue(key)) {
                        params.change(e, data);
                    }
                })
                .on('keydown.surt input.surt paste.surt', function(e) { // input paste
                    var key = e.keyCode,
                        index,
                        data;

                    // Прочие буквы
                    if ( e.type == 'keydown' && affectsToValue(key) ) { // При нажатии на символ
                        self._pressedKeys++;
                        resetTimer();
                    }

                    // Для контрол-клавиш блокировки быть не должно
                    if (!affectsToValue(key)) {
                        self._pressedKeys = 0;
                    } else {
                        $(self.root).removeClass(self.params.placeholderCls);
                    }

                    // Enter
                    if (key == 13) {
                        e.preventDefault();

                        var suggestPicked = $(self.root).hasClass(params.suggestCls) && $(self.root).find('.' + params.suggestItemCurrentCls).length;
                        if (suggestPicked) {
                            pickSuggest(true, e);
                        }
                        // Стандартный сабмит по ентеру
                        if (self.params.submit && $.inArray('enter', self._submitEvents) != -1) {
                            self.params.submit(e, suggestPicked);
                        }
                        // Удаляем сагесты и автокомплит
                        $(self.root).removeClass(params.suggestCls);
                        $(self.root).removeClass(params.autocompleteCls);
                        self.markSuggest(-1); // Снятие выделения с сагеста

                        return false;
                    }

                    // Стрелка вниз
                    if (key == 40) {
                        index = 0;

                        if (self._activeSuggest >= 0 && self.suggest) {
                            index = self._activeSuggest < self.suggest.length - 1 ? self._activeSuggest + 1 : 0;
                        }

                        self.markSuggest(index);

                        return false;
                    }

                    // Стрелка вверх
                    if (key == 38) {
                        index = self.suggest && self.suggest.length - 1;

                        if (self._activeSuggest >= 0 && self.suggest) {
                            index = self._activeSuggest > 0 ? self._activeSuggest - 1 : self.suggest.length - 1;
                        }

                        self.markSuggest(index);

                        return false;
                    }

                    // Стрелка вправо
                    if (key == 39) {
                        var length = self.text().length;

                        // Если курсор в крайне правом положении, делаем сет с новыми данными (довершаем автокомплит)
                        if (self.getCursor() >= length && self.suggest) {
                            var autocompleteActive = $(self.root).hasClass(self.params.autocompleteCls) || self._activeSuggest != -1,
                                active = (self._activeSuggest == -1) ? 0 : self._activeSuggest;

                            if (autocompleteActive) { // Автокомплит есть и его надо подставить
                                data = self.args();
                                data.kit = self.suggest[active];
                                self.set(data, true);
                                // Сабмит на заполнении автокомплита
                                if (self.params.submit && $.inArray('auto', self._submitEvents) != -1) {
                                    self.params.submit(e, true);
                                }
                                if (self.suggest && self.suggest.length && self.params.complete) { // Для статистики
                                    self.params.complete();
                                }
                            }
                        }
                    }

                    // Esc
                    if (key == 27) {
                        $(self.root).removeClass(self.params.suggestCls);
                        e.preventDefault(); /* f opera 12 */
                    }
                })
                .on('paste.surt', function() {
                    setTimeout(function(){
                        self.parse();
                    }, 0);
                })
                .on('focus.surt click.surt', function() {
                    var noBefore = !$(self.root).hasClass(self.params.suggestCls);

                    $(self.root).addClass(self.params.stateFocusCls);
                    if (self.suggest && self.suggest.length) {
                        $(self.root).addClass(self.params.suggestCls);
                    }
                    self.updateHint();

                    if (noBefore) { // Произошла именно инверсия показа сагеста, а не очередной показ
                        if (self.params.show) {
                            self.params.show(self._suggestExist);
                        }
                    }
                })
                .on('blur.surt', function() {
                    $(self.root).removeClass(self.params.stateFocusCls);
                    $(self.root).removeClass(self.params.readyCls);
                    $(self.root).removeClass(self.params.autocompleteCls);
                    $(self.root).removeClass(self.params.suggestCls);
                });

            // this._events.mousemove = function(e) {
            //     var suggestsItems = $('.' + params.suggestItemCls),
            //         index = suggestsItems.index( $(this) );

            //     self.markSuggest(index);
            // };

            $(this.root)
                .on('mousedown.surt', '.' + self.params.suggestItemCls, function(e) {
                    var suggestsItems = $('.' + params.suggestItemCls),
                        index = suggestsItems.index( $(this) );

                    if (!self.suggest || !self.suggest[index]) return; // html illegal append situation

                    var willSubmit = $.inArray('click', self._submitEvents) != -1;

                    self._activeSuggest = index;
                    pickSuggest(willSubmit, e);
                    if (self.params.submit && willSubmit) { // Если пользователь хочет, то клик по сагесту приведёт к поиску, и обновлять сагест уже не надо
                        self.params.submit(e, true);
                    } else if (self.params.change) { // Иначе - стандартное обновление сагеста
                        self.params.change(e, self.args());
                    }

                    if (!$(e.target).closest(self.params.suggestItemCls).length) {
                        $(self.root).removeClass(self.params.suggestCls).removeClass(self.params.autocompleteCls);
                    }
                }); // Почему не клик??
                // .on('mousemove', '.' + self.params.suggestItemCls, self._events.mousemove);
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

            this.saveCursor();

            var same = kitsAreEqual(data.kit, this.kit);

            if (data.kit) this.kit = data.kit;
            if (!same || force) this.updateKit(force);

            if (data.suggest) {
                this.suggest = data.suggest;
                this.updateSuggest();
            }

            this.updateHint();

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
            this.updateHint();
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
                    var html = this.trim(this.kit[i].text); /* f ie8 */

                    if (!this.textMode()) {
                        if (this.kit[i].type == "text" && textCls) {
                            left = '<div class="' + textCls + '">';
                            right = '</div>';
                        } else if (tokenCls) {
                            left = '<div class="' + tokenCls + ' ' + '_type_' + this.kit[i].type + '">';
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
                    this.restoreCursor();
                }
            }
        },

        // Обновляет HTML в выпадашке сагестов
        updateSuggest: function() {
            var suggestHTML = [],
                tokenCls = this.params.tokenCls,
                textCls = this.params.textCls || tokenCls,
                count,
                beforeState = !this._suggestExist;

            this._suggestExist = !!(this.suggest && this.suggest.length);
            if (this.suggest) {
                var inversed = !(beforeState ^ this._suggestExist);

                if (inversed && this.params.show) { // Произошла именно инверсия показа сагеста, а не очередной показ
                    this.params.show(this._suggestExist);
                }

                for (var i = 0 ; i < this.suggest.length ; i++) {
                    var kit = [];

                    for (var j = 0 ; j < this.suggest[i].length ; j++) {
                        var html = this.suggest[i][j].html || this.suggest[i][j].text;

                        html = this.trim(html); /* f ie8 */

                        if (this.params.selectionCls) {
                            html = this.parser.replace.call(this, html);
                            // html = html.replace(new RegExp(espape(this.text()), "i"), '<span class="' + this.params.selectionCls + '">$&</span>');
                        }

                        if ( this.suggest[i][j].type != 'text' ) {
                            if (tokenCls) {
                                html = '<div class="' + tokenCls + ' ' + '_type_' + this.suggest[i][j].type + '">' + html + '</div>';
                            }

                            kit.push(html);
                        } else {
                            if (textCls) {
                                html = '<div class="' + textCls + '">' + html + '</div>';
                            }

                            kit.push(html);
                        }
                    }

                    count = kit.length;
                    kit = kit.join(this.delimiter + ' ');
                    var countMod = '';
                    if (this.params.suggestItemCountCls) {
                        countMod = ' ' + this.params.suggestItemCountCls + count;
                    }
                    suggestHTML.push('<li class="' + this.params.suggestItemCls + countMod + '">' + kit + '</li>');
                    this._activeSuggest = -1;
                }
                count = suggestHTML.length;
                suggestHTML = suggestHTML.join('');
                if (this.suggestNode) {
                    if (suggestHTML) $(this.root).addClass(this.params.suggestCls);
                    else $(this.root).removeClass(this.params.suggestCls);
                    this.suggestNode.innerHTML = suggestHTML;
                }

                // Проверяем ширину сагестов и выставляем модификатор тем, которые шири
                // var suggestWidth = this.suggestNode.clientWidth,
                //     kits = $('.' + this.params.suggestItemCls, this.suggestNode);

                // for (i = 0 ; i < count ; i++) {
                //     if (kits[i].offsetWidth > suggestWidth && this.suggest[i].length > 1 && this.params.suggestItemOverflowedCls) {
                //         $(kits[i]).addClass(this.params.suggestItemOverflowedCls);
                //     }
                // }
            }
        },

        updateHint: function() {
            this.updateAutocomplete();

            if (!this.text()) {
                $(this.root)
                    .addClass(this.params.placeholderCls)
                    .removeClass(this.params.autocompleteCls);
                this.updatePlaceholder();
            }
        },

        // Обновляет html в подсказке как автокомплит
        updateAutocomplete: function() {
            var active = this._activeSuggest == -1 ? 0 : this._activeSuggest, // Индекс текущего сагеста
                su = this.suggest && this.suggest.length && this.suggest[active], // Текущий сагест
                text = this.text(),
                self = this;

            if (!this.hintNode) return;

            $(this.root).removeClass(this.params.placeholderCls);

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
                        for (var i = kitPos ; i < this.suggest[active].length ; i++) {
                            suggestText.push(this.suggest[active][i].text);
                        }
                    }
                    suggestText = suggestText.join(this.delimiter + ' ');
                    if (suggestText == text) { // Автокомплит полностью набран, пора нажимать ентер
                        $(this.root).addClass(this.params.readyCls);
                    } else {
                        isAutocomplete = suggestText.toLowerCase().indexOf(text.toLowerCase()) == 0;
                        $(this.root).removeClass(this.params.readyCls);
                    }

                    this.hintNode.innerHTML = suggestText.slice(text.length);
                    this.cloneNode.innerHTML = this.html();
                    if ($(this.root).hasClass(this.params.suggestCls) && isAutocomplete && suggestText.length < this.params.aunt) {
                        $(this.root).addClass(this.params.autocompleteCls);
                    } else { // Сагесты свернуты, либо текущий не является автокомплитом
                        rmAutocomplete();
                    }
                } else { // Сагестов нет вообще, удаляем текст из автокомплита
                    rmAutocomplete();
                }
            } else { // Кита нет, либо текста нет - автокомплит не нужен
                rmAutocomplete();
            }

            function rmAutocomplete() {
                $(self.hintNode).html('');
                $(self.cloneNode).html('');
                $(self.root).removeClass(self.params.autocompleteCls);
            }
        },

        // Обновляет html в подсказке как плейсхолдер
        updatePlaceholder: function(text) {
            text = text || this.placeholder;

            $(this.hintNode).html(this.placeholder);
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
            var input = $(this.inputNode);

            if (!html) {
                return input.html() || this.text();
            } else {
                if (this.inputNode.tagName == 'INPUT') {
                    input.val(html);
                } else {
                    input.html(html);
                }
                this.scroll();
            }
        },

        // Переводит текст в крайне правое положение, чтоб было видно конец строки текста
        scroll: function() {
            this.inputNode.scrollLeft = this.inputNode.scrollWidth; // pseudo Infinity, which does not supported by Chrome
        },

        // Возвращает текущую версию с данными
        args: function() {
            var data = {};

            data.kit = this.kit;
            data.suggest = this.suggest || []; // Почему может быть undefined?
            data.text = this.text();

            return data;
        },

        // Вычисляем новый кит на основе данных в строке или кастомного текста
        parse: function(ctext) {
            var text = ctext || this.text();

            this.trailingSpace = text[text.length - 1] === ' ';
            newKit = this.parser(this.kit, text);

            return newKit;
        },

        // Проверяет соответствие кита текущей строке в инпуте, или кастомной строке
        invalidate: function(customText) {
            var kit = this.parse(customText);

            this.kit = kit;
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
            var suggestsItems = $('.' + this.params.suggestItemCls, this.params.root),
                currentCls = this.params.suggestItemCurrentCls;

            if (index === undefined) {
                index = this._activeSuggest;
            }

            suggestsItems.removeClass(currentCls); // Удаляем со всех сагестов класс текущности
            if (index >= 0) {
                suggestsItems.eq(index).addClass(currentCls); // Если индекс не отрицательный - добавляем класс на текущий кит сагеста
                this._activeSuggest = index;
                this.updateHint();
            }

            this._activeSuggest = index;
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

            return tail;
        },

        minimize: function() {
            $(this.root).removeClass(this.params.suggestCls);
        },

        dispose: function() {
            $(this.root).attr('data-surt-inited', 'disposed');
            $(this.root).off('surt');
            clearTimeout(this._upTimer);
        },

        trim: function(str) {
            if (String.prototype.trim) {
                return str.trim();
            } else {
                return str.replace(/^\s+|\s+$/g, '');
            }
        },

        // Возвращает true, если работа ведется в текстовом режиме
        textMode: function() {
            return this.inputNode.tagName == 'INPUT' || this.params.inputMode == 'text';
        }
    };

    surt.fn.constructor.prototype = surt.fn;

    $.fn.surt = surt;

    surt.version = '0.3.0';
})(this);
(function(window, undefined) {
    // var surt = window.surt || {};

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
    var parser = function(kit, oriText) {
        var newKit = [],
            trim = this.trim;

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
            text = trim(text.replace(token.text, ''));
        }

        var text = oriText;
        if (this.delimiter) {
            text = text.replace(new RegExp(this.delimiter, 'g'), ' ');
        }
        text = text.replace(new RegExp('  ', 'g'), ' '); // ', ' -> '  ' -> ' '

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
                    var newPlainText = trim(text.substring(0, index));

                    pushToken({
                        text: newPlainText,
                        type: 'text'
                    });

                    pushToken(kit[i]);
                }
            }
        }

        // Last undefined token
        text = trim(text);
        if (text) {
            pushToken({
                text: text,
                type: 'text'
            });
        }

        return newKit;
    };

    // Заменяет подстроки partial в тексте html минуя внутренности тегов html
    parser.replace = function(html) {
        function escape(text) {
            return String(text).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }

        var partial = escape(this.text());
        /* jshint -W044 */
        partial = '((>[^<]*|^[^<>]*))(' + partial + ')([\w -]*)';
        /* jshint +W044 */

        return html.replace(new RegExp(partial, "i"), '$1<span class="' + this.params.selectionCls + '">$3</span>$4');
    };

    if (typeof module != "undefined") {
        module.exports = parser;
    } else {
        $.fn.surt.fn.parser = parser;
    }
})(this);
// Cursor positioning in content editable container
(function() {
    var surt = $.fn.surt;

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
        var N;

        // Цикл вверх по родителям, вплоть до node
        if (this.inputNode.tagName == 'INPUT') {
            N = this.inputNode.selectionEnd;
        } else {
            if (!window.getSelection) return; // IE8-

            var selection = window.getSelection();

            if ( !selection.anchorNode ) return; // No selection at all

            var range = selection.getRangeAt(0),
                container = range.startContainer, // Returns the Node within which the Range starts.
                offset = range.startOffset, // Returns a number representing where in the startContainer the Range starts.
                child = container; // Может быть текстовая нода, наверняка

            N = offset;

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
        }

        return N;
    };

    // Сохраняет позицию курсора
    surt.fn.saveCursor = function() {
        this.cursorPos = this.getCursor();

        this._lastPos = this.cursorPos == this.text().length;

        return this.cursorPos;
    };

    surt.fn.restoreCursor = function(ccp) {
        if (this.textMode()) return;
        if (!window.getSelection) return; // IE8-

        var self = this,
            n = ccp;

        var range = document.createRange(),
            selection = window.getSelection(),
            targetNode = this.inputNode,
            pos;

        pos = this._lastPos ? this.text().length : this.cursorPos;
        n = n || pos;

        // Цикл вниз по детям для поиска текстовой ноды куда надо выставить курсор
        if (this.inputNode.tagName != 'INPUT') {
            while (targetNode && targetNode.nodeType == 1) {
                obj = findPosChild(targetNode, n);
                targetNode = obj.child;
                n = obj.n;
            }
        }

        if (targetNode && targetNode.nodeType == 3) {
            n = Math.min(n, $(targetNode).text().length);
            n = Math.max(n, 0);
            range.setStart(targetNode, n); // Sets the start position of a Range.
            range.collapse(true); // Collapses the Range to one of its boundary points.
            selection.removeAllRanges(); // Removes all ranges from the selection.
            selection.addRange(range); // A range object that will be added to the selection.
        }

        // if (ccp >= this.text().length - 1) {
        //     setTimeout(function() {
        //         // Chrome scroll to the end
        //         self.inputNode.scrollLeft = 99999;

        //         // Firefox scroll to the end
        //         self.inputNode.selectionStart = n;
        //         self.inputNode.selectionEnd = n;
        //     }, 0);
        // }
    };
})();
