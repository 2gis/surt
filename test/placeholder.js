describe('Placeholder.', function() {
    var suggest;
    var params = {
            input: '.surt__input',
            suggest: '.surt__suggests',
            suggestItemCls: 'surt__suggests-item',
            suggestCls: '_dropdown',
            tokenCls: 'surt__token',
            textCls: 'surt__text',
            placeholder: 'Рестораны, автомобили, пиво',
            clone: '.surt__clone-main',
            hint: '.surt__clone-hint',
            autocompleteCls: '_autocomplete',
            placeholderCls: '_placeholder'
        };

    beforeEach(function() {
        suggest = $('.surt').surt(params);
    });

    it('Placeholder is setted and visible on start', function() {
                assert.equal($('.surt__clone-hint').text(), params.placeholder);
        assert($('.surt').hasClass(params.placeholderCls), 'No placeholderCls found');
        assert(!$('.surt').hasClass(params.autocompleteCls), 'autocompleteCls found');
        assert($(params.hint).css('opacity') > 0, 'hint has zero opacity');
    });

    it('Keydown lead to placeholder hiding', function() {
        var e = $.Event('keydown');

        e.keyCode = 100;
        $('.surt__input').trigger(e);
        assert(!$('.surt').hasClass(params.placeholderCls), 'placeholderCls found');
        assert($(params.hint).css('opacity') == 0, 'hint has non zero opacity');
    });

    it('Controlkey keydown do not lead to placeholder hiding', function() {
        var keys = [13, 27, 37, 39, 16, 17, 18, 91, 35, 36, 8],
            e;

        $.each(keys, function(key) {
            e = $.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e);
            assert($('.surt').hasClass(params.placeholderCls), 'no placeholderCls found');
            assert($(params.hint).css('opacity') > 0, 'hint has zero opacity');
        });
    });

    it('Set text leads to autocomplete appearing and placeholder hiding', function() {
        suggest.set({
            kit: [{
                text: 'Ре',
                type: 'text'
            }],
            suggest: [[{
                text: 'Ресторан',
                type: 'rubric'
            }]]
        });

        assert(!$('.surt').hasClass(params.placeholderCls), 'placeholderCls found');
        assert($('.surt').hasClass(params.autocompleteCls), 'No autocompleteCls found');
        assert($(params.hint).css('opacity') > 0, 'hint has zero opacity');

        // Remove text now
        $(params.input).html('');
        suggest.set({
            kit: []
        });
        suggest.update();

        assert($('.surt').hasClass(params.placeholderCls), 'no placeholderCls found');
        assert(!$('.surt').hasClass(params.autocompleteCls), 'autocompleteCls found');
        assert($(params.hint).css('opacity') > 0, 'hint has zero opacity');
        assert.equal($(params.clone).text().length, 0);
    });

    afterEach(function() {
        suggest.dispose();
    });
});