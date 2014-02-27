describe('Инициализация.', function() { // При кривой инициализации конструктор должен возвращать undefined
    beforeEach(function() {
        $('.wrapper_common').html(originalHTML);
    });

    it('По-умолчанию', function() {
        var suggest;

        try {
            suggest = $('.nonono').surt();
        } catch (e) {}

        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('С пустым объектом параметров', function() {
        var suggest;

        try {
            suggest = $('.nonono').surt({});
        } catch (e) {}
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Root + input в параметрах, root нет на странице', function() {
        var suggest;

        try {
            suggest = $('.nonono').surt({
                input: '.nonono'
            });
        } catch (e) {}
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Root + input в параметрах, input нет на странице', function() {
        var suggest;

        try {
            suggest = $('.surt').surt({
                input: '.nonono'
            });
        } catch (e) {}
        
        assert(!suggest, 'При кривой инициализации вместо объекта конструктор должен возвращать undefined');
    });

    it('Root + input в параметрах, и он есть на странице (успешная инициализация)', function() {
        var suggest = $('.surt').surt({
                input: '.surt__input'
            }),
            root = $(suggest.root);
        
        assert(suggest, 'Конструктор, при успешной инициалихации, возвращает объект сагеста');
        assert(root.data('surt-inited') == true, 'При успешной инициализации должен быть выставлен атрибут data-surt-inited в true');

        suggest.dispose();
        assert(root.attr('data-surt-inited') == 'disposed', 'Dispose должен удалять data-surt-inited');
    });

    it('Повторная инициализация', function() {
        var suggest = $('.surt').surt({
                input: '.surt__input'
            }),
            second;

        try {
            suggest = $('.surt').surt({
                input: '.surt__input'
            });
        } catch (e) {}
        
        assert.ok(suggest);
        assert(!second, 'При повторной инициализации конструктор должен возвращать undefined');

        suggest.dispose();
    });
});