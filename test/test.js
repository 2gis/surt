var originalHTML = '<div class="surt surt_dropdown_true"><div class="surt__wrap"><div class="surt__input" contenteditable="true"></div><div class="surt__clone"><span class="surt__clone-main"></span><span class="surt__clone-hint"></span></div><ul class="surt__suggests"></ul></div></div>'

describe('Инициализация.', function() { // При кривой инициализации конструктор должен возвращать undefined
    beforeEach(function() {
        $('.wrapper').html(originalHTML);
    });

    it('По-умолчанию', function() {
        var suggest = surt();

        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('С пустым объектом параметров', function() {
        var suggest = surt({});
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('С пустым объектом параметров', function() {
        var suggest = surt({});
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Только с инпутом в параметрах, которого нет на странице', function() {
        var suggest = surt({
            input: '.nonono'
        });
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Только с root в параметрах, которого нет на странице', function() {
        var suggest = surt({
            root: '.nonono'
        });
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Root + input в параметрах, root нет на странице', function() {
        var suggest = surt({
            root: '.nonono',
            input: '.nonono'
        });
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Root + input в параметрах, input нет на странице', function() {
        var suggest = surt({
            root: '.surt',
            input: '.nonono'
        });
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Root + input в параметрах, и он есть на странице (успешная инициализация)', function() {
        var suggest = surt({
                root: '.surt',
                input: '.surt__input'
            }),
            root = $(suggest.root);
        
        assert(suggest, 'Конструктор, при успешной инициалихации, возвращает объект сагеста');
        assert(root.data('surt-inited') == true, 'При успешной инициализации должен быть выставлен атрибут data-surt-inited в true');

        suggest.dispose();
        assert(root.attr('data-surt-inited') == 'disposed', 'Dispose должен удалять data-surt-inited');
    });

    it('Повторная инициализация', function() {
        var suggest = surt({
                root: '.surt',
                input: '.surt__input'
            }),
            second = surt({
                root: '.surt',
                input: '.surt__input'
            });
        
        assert.ok(suggest);
        console.log('second', second);
        assert(!second, 'При повторной инициализации конструктор должен возвращать undefined');


        suggest.dispose();
    });
});

describe('События.', function() {
    beforeEach(function() {
        $('.wrapper').html(originalHTML);
    });

    it('Параметр change', function() {
        var x = 0;

        function callback() {
            x++;
        }

        var suggest = surt({
            root: '.surt',
            input: '.surt__input',
            change: callback
        });

        $('.surt__input').trigger('keyup');

        suggest.dispose();
    });
});

describe('HTML.', function() {
    before(function() {
        $('.wrapper').html(originalHTML);
        suggest = surt({
            root: '.surt',
            input: '.surt__input'
        });
    });

    var suggest;

    function getHTML() {
        return $('.surt__input').html() + $('.surt__clone-main').html() + $('.surt__clone-hint').html() + $('.surt__suggests').html();
    }

    it('Объект данных undefined', function() {
        suggest.set();

        var html = getHTML();
        assert(html == '', 'В отсутствии данных сагест не генерирует html');
    });

    it('Пустой объек данных', function() {
        suggest.set({});

        var html = getHTML();
        assert(html == '', 'В отсутствии данных сагест не генерирует html');
    });

    it('Пустые кит и сагест', function() {
        suggest.set({
            kit: [],
            suggest: []
        });

        var html = getHTML();
        assert(html == '', 'В отсутствии данных сагест не генерирует html');
    });
});



















