describe('Позиция курсора.', function() {
    var data = {
        kit: [{
            text: 'Ресторан',
            type: 'text'
        }],
        suggest: [
        [{
                text: 'Ресторан',
                type: 'text'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }, {
                text: 'кухня',
                type: 'attr'
            }
        ], [{
                text: 'Ресторан',
                type: 'text'
            }, {
                text: 'Wi-Fi',
                type: 'filter'
            }, {
                text: 'Абра ка дабра',
                type: 'attr'
            }]
        ]
    };

    beforeEach(function() {
        $('.wrapper_common').html(originalHTML);
        suggest = surt({
            root: '.surt',
            input: '.surt__input',
            suggest: '.surt__suggests',
            suggestItemCls: 'surt__suggests-item',
            suggestCls: 'surt_dropdown_true',
            tokenCls: 'surt__token',
            textCls: 'surt__text'
        });
    });

    it('Выставляет кастомную позицию курсора', function() {
        suggest.set(data);

        suggest.restoreCursor(2);

        var N = suggest.saveCursor();
        assert(N == 2, 'Курсор выставляется в позицию');
    });

    it('Выставляет кастомную позицию курсора в конец', function() {
        suggest.set(data);

        suggest.restoreCursor(99999);

        var N = suggest.saveCursor();
        assert(N == 8, 'Курсор выставляется в крайнюю позицию если индекс слишком высокий');
    });

    // it('Выставляет кастомную позицию курсора в начало', function() {
    //     suggest.set(data);

    //     suggest.restoreCursor(-1);

    //     var N = suggest.saveCursor();
    //     assert(N == 0, 'Курсор выставляется в крайнюю позицию если индекс слишком высокий');
    // });
});