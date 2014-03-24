describe('Scroll. ', function() {
    describe('Textmode. ', function() {
        var suggest;
        var params = {
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                placeholder: 'Рестораны, автомобили, пиво',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete',
                placeholderCls: '_placeholder',
                inputMode: 'text'
            };

        beforeEach(function() {
            suggest = $('.surt').surt(params);
        });

        it('Input scrolled to right when long suggest picked', function() {
            suggest.set({
                suggest: [[{
                    text: 'Input scrolled to right when long suggest picked Input scrolled to right when long suggest picked Input scrolled to right when long suggest picked',
                    type: 'text'
                }], [{
                    text: 'Input scrolled to right when long suggest picked Input scrolled to right when long suggest picked Input scrolled to right when long suggest picked',
                    type: 'text'
                }]]
            });

            var e = $.Event('keydown');
            e.keyCode = 40; // Наводим на первый сагест
            $('.surt__input').focus().trigger(e);
            e = $.Event('keydown');
            e.keyCode = 39; // Автокомплитим
            $('.surt__input').focus().trigger(e);

            var scrollWidth = $('.surt__input')[0].scrollWidth;
            var width = $('.surt__input')[0].clientWidth;
            var left = $('.surt__input')[0].scrollLeft;
            assert(scrollWidth - width <= left, 'Scroll position should be at the very end');
        });
    });
});