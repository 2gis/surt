(function(window, undefined) {
    var $;

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

            this.kit = [];

            // К этому месту считаем, что инициализация прошла успешно
            $(this.root).attr('data-surt-inited', true);

            // Навешиваем все необходимые события
            $(this.inputNode)
                .on('keyup', function(e){
                    var key = e.keyCode;

                    // Пропускаем клавиши Left, Right, Shift, Left Ctrl, Right Ctrl, Cmd, End, Home без колбека
                    if (key == 37 || key == 39 || key == 16 || key == 17 || key == 18 || key == 91 || key == 35 || key == 36 ) return true;

                    if (key == 40 && $('.surt').hasClass('surt_dropdown_true') ) {
                        // var currentItem = 0; стрелка вниз
                    }

                    // var text = self.inputNode.innerHTML;
                    //     console.log('=|' + text + '|');

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
                suggestHTML = [];

            for (var i = 0 ; i < this.kit.length ; i++) {
                // inputHTML.push('<div class="surt__par surt__par_type_' + this.kit[i].type + '">' + this.kit[i].text + '</div>');
                if ( this.kit[i].type != "text" )
                    inputHTML.push('<div class="surt__par surt__par_type_' + this.kit[i].type + '">' + this.kit[i].text + '</div>');
                else 
                    inputHTML.push('<span class="surt__text">' + this.kit[i].text + '</span>');
            }

            inputHTML = inputHTML.join(' ');
            this.inputNode.innerHTML = inputHTML;

            for (var i = 0 ; i < this.suggest.length ; i++) {
                var kit = [];

                for (var j = 0 ; j < this.suggest[i].length ; j++) {
                    if ( this.suggest[i][j].type != "text" )
                        kit.push('<div class="surt__par surt__par_type_' + this.suggest[i][j].type + '">' + this.suggest[i][j].text + '</div>');
                    else 
                        kit.push('<span class="surt__text">' + this.suggest[i][j].text + '</span>');
                }

                kit = kit.join(' ');
                suggestHTML.push('<li class="surt__suggests-item">' + kit + '</li>');
            }
            suggestHTML = suggestHTML.join('');
            if (this.suggestNode) {
                if (suggestHTML) $(this.root).addClass('surt_dropdown_true');
                else $(this.root).removeClass('surt_dropdown_true');
                this.suggestNode.innerHTML = suggestHTML;
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

            return text;
        },

        // Возвращает текущую версию с данными
        args: function() {
            var data = {};

            data.kit = this.kit;
            data.suggest = {};
            data.text = this.query();

            return data;
        },

        // Вычисляем новый кит
        parse: function() {
            var text = $(this.inputNode).text(),
                newKit = this.parser( this.kit, text );

            // console.log('text' + text + 'text', newKit);
            
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