// Режим работы сагестера "без кирпичей" (простой текстовый сагестер но с запоминанием типов в коде)
describe('Разделитель токенов.', function() {
    it('Последовательное заполнение инпута вручную.', function() {
        var suggester = $('.wrapper_delimiter .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true',
                readyCls: 'surt_ready_true',
                delimiter: ',',
                change: function(e, data) {
                    // console.log('data', data);
                    // suggester.set({
                    //     kit: data.kit,
                    //     suggest: data.suggest,
                    //     trailing: data.trailing
                    // });
                },
                submit: function() {
                    // alert('[eq');
                    console.log('qwe');
                }
            }),
            suggest = [[{
                text: 'Rest',
                type: 'rubric'
            }, {
                text: 'wifi',
                type: 'filter'
            }]],
            autocomplete,
            e;

        suggester.set({
            kit: [{
                text: 'Res',
                type: 'text'
            }],
            suggest: suggest
        });
        autocomplete = $('.wrapper_delimiter .surt__clone-hint').text();
        assert(autocomplete == 't, wifi', 'Автокомплит содержит кусок первого токена и запятую');
        

        // Эмулируем ввод буквы t
        $('.wrapper_delimiter .surt__input').append('t');
        e = jQuery.Event('keyup');
        $('.wrapper_delimiter .surt__input').trigger(e);
        autocomplete = $('.wrapper_delimiter .surt__clone-hint').text();
        assert(autocomplete == ', wifi', 'Автокомплит содержит запятую ' + autocomplete);

        // Эмулируем ввод запятой
        $('.wrapper_delimiter .surt__input').append(',');
        e = jQuery.Event('keyup');
        $('.wrapper_delimiter .surt__input').trigger(e);
        autocomplete = $('.wrapper_delimiter .surt__clone-hint').text();
        assert(autocomplete == ' wifi', 'Автокомплит, после нажатия на запятую, уже не содержит её');
        suggester.restoreCursor(99);

        // suggest.parse();
        // suggest.set({
        //     kit: suggest.kit,
        //     suggest: sugg
        // });
        // suggest.restoreCursor(9);
        // // var e = jQuery.Event('paste');
        // // e.keyCode = 32; // Space
        // // $('.surt__input').trigger(e);
        // assert(!$('.surt').hasClass('surt_autocomplete_true'));
        // suggest.dispose();
    });

});