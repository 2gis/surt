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
            this.input = $(params.input)[0];

            this.kit = [];
            // this.query = '';

            // Навешиваем все необходимые события
            $(params.input)
                .on('keyup', function(e){
                    var key = e.keyCode;

                    // Пропускаем клавиши Left, Right, Shift, Left Ctrl, Right Ctrl, Cmd, End, Home без колбека
                    if (key==37 || key==39 || key==16 || key==17 || key==18 || key==91 || key==35 || key==36 ) return true;

                    if (key==40 && $('.surt').hasClass('surt_dropdown_true') ) {
                        // var currentItem = 0; стрелка вниз
                    }

                    // this.set(data);
                })
                .on('keydown input paste', function(e) {
                    if (e.keyCode == 13) return false; // Enter
                })
                .on('input paste', function(e) {
                    setTimeout(function(){
                        
                    }, 0);
                })
                .on('focus', function() {
                    $('.surt').addClass('surt_state_focus');
                })
                .on('blur', function() {
                    $('.surt').removeClass('surt_state_focus');
                });

        },

        // Возвращает текущий кит
        get: function() {
            return this.kit;
        },

        // Устанавливает новые данные (set - единственная точка входа на новые данные)
        set: function(data) {
            this.kit = data.kit;
            this.suggest = data.suggest;
            this.update();

            // Событие change
            if (this.change) {
                this.change();
            }
        },

        
        // query: function() {
        //     return this.parser();
        // },

        // Обновляет UI
        update: function() {
            // Здесь все манипуляции с дом-деревом
            // this.cursor.save();

            var output = '';

            for (var i = 0; i < this.kit.length; i++) 
                output += '<div class="surt__par surt__par_type_' + this.kit[i].type + '">' + this.kit[i].text + '</div> ';

            this.input.innerHTML = output;
            // console.log(this);
            // this.query;
            // this.cursor.restore();
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