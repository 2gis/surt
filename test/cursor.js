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

    before(function() {
        $('.wrapper').html(originalHTML);
        suggest = surt({
            root: '.surt',
            input: '.surt__input',
            suggest: '.surt__suggests'
        });
    });

    it('Выставляет кастомную позицию курсора', function() {
        suggest.set(data);

        suggest.restoreCursor(2);

        var N = suggest.saveCursor();
        assert(N == 2, 'Курсор выставляется в позицию');
    });
});