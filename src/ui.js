(function(window, undefined) {
    var $;

    var surt = function(params) {
        $ = window.jQuery || params.$;

        if (!$) return;

        return new surt.fn.constructor(params, $);
    };

    surt.fn = {
        // Создает объект surt
        constructor: function(params, $) {
            this.params = params;
            this.parser = surt.parser;

            this.kit = [];

            // Навешиваем все необходимые события
            $(params.input).on('keydown', function(e) {
                //
            });
        },

        // Возвращает текущий кит
        get: function() {
            return this.kit;
        },

        // Устанавливает новый кит (только в этом месте)
        set: function(data) {
            this.kit = data.kit;
            this.suggest = data.suggest;
            this.update();

            // Событие change
            if (this.change) {
                this.change();
            }
        },

        // Возвращает текст из поисковой строки
        query: function() {
            return this.parser();
        },

        // Обновляет UI
        update: function() {
            // Здесь все манипуляции с дом-деревом
        }
    };

    surt.fn.constructor.prototype = surt.fn;

    window.surt = surt;

    if (typeof module != undefined) {
        module.exports = surt;
    }

    surt.version = '0.1.0';

    // if ($ && $.fn) {
    //     $.fn.surt = surt;
    // }
})(this);