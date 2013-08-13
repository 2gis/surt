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
        assert(x == 1);
        suggest.dispose();
    });

    describe('Автокомплит.', function() {
        it('В отсутствии автокомплита (во входных параметрах) нажатие стрелки вправо не приводит к автокомплиту', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input'
            });

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

            var e = jQuery.Event('keydown'),
                html = $('.surt__input').html();

            e.keyCode = 39;
            $('.surt__input').trigger(e);

            assert(html == $('.surt__input').html());
            suggest.dispose();
        });

        it('При не крайне правой позиции курсора нажатие стрелки вправо не приводит к автокомплиту', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

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

            var e = jQuery.Event('keydown'),
                html = $('.surt__input').html();

            suggest.restoreCursor(1);
            e.keyCode = 39;
            $('.surt__input').trigger(e);

            assert(html == $('.surt__input').html());
            suggest.dispose();
        });

        it('При крайне правой позиции курсора нажатие стрелки вправо приводит к автокомплиту', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

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

            var e = jQuery.Event('keydown');

            e.keyCode = 39;
            $('.surt__input').trigger(e);

            assert($('.surt__input').html() == '<div class="surt__token surt__token_type_rubric">Ресторан</div>');
            suggest.dispose();
        });

        it('Если в ПС уже есть токен (идет набор второго токена), а в первом сагесте только 1 токен, автокомплита не будет', function() {
            var suggest = surt({
                    root: '.surt',
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: 'surt_dropdown_true',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    autocomplete: '.surt__clone-hint',
                    autocompleteCls: 'surt_autocomplete_true'
                }),
                sugg = [[{
                        text: 'Ресторан крона',
                        type: 'text'
                }]];

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'rubric'
                }],
                suggest: sugg
            });
            // Эмулируем ввод пробела
            $('.surt__input').append(' ');
            suggest.parse();
            suggest.set({
                kit: suggest.kit,
                suggest: sugg
            });
            suggest.restoreCursor(9);
            // var e = jQuery.Event('paste');
            // e.keyCode = 32; // Space
            // $('.surt__input').trigger(e);
            assert(!$('.surt').hasClass('surt_autocomplete_true'));
            suggest.dispose();
        });

        it('При нажатии вправо автокомплит подставляется а курсор уходит в крайне правое положение', function() {
            var suggest = surt({
                    root: '.surt',
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: 'surt_dropdown_true',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    autocomplete: '.surt__clone-hint',
                    autocompleteCls: 'surt_autocomplete_true'
                });

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

            var e = jQuery.Event('keydown');

            e.keyCode = 39;
            $('.surt__input').trigger(e);

            var pos = suggest.getCursor(),
                html = $('.surt__input').html(),
                complete = $('.surt__clone-main').html();

            assert(pos == $('.surt__input').text().length);
            console.log('complete', complete);
            assert(html == '<div class="surt__token surt__token_type_rubric">Ресторан</div>', 'В инпут попадает первый сагест');
            assert(complete == html, 'В комплите выставляется строго содержимое инпута');
            suggest.dispose();
        });
    });

    describe('Выбор сагестов.', function() {
        it('Нажатие вниз + enter приводит к выбору первого сагеста', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ре',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            var e = jQuery.Event('keydown');

            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down

            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e); // Enter

            assert($('.surt__input').html() == '<div class="surt__token surt__token_type_rubric">Ресторан</div>');
            suggest.dispose();
        });

        it('2 нажатия вниз + enter приводит к выбору второго сагеста', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ре',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            var e = jQuery.Event('keydown');

            e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down

            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e); // Enter

            assert($('.surt__input').html() == '<div class="surt__token surt__token_type_filter">wifi</div>');
            suggest.dispose();
        });

        it('2 нажатия вниз + нажатие вверх + enter приводит к выбору первого сагеста', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ре',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            var e = jQuery.Event('keydown');

            e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown');
            e.keyCode = 38;
            $('.surt__input').trigger(e); // Up

            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e); // Enter

            assert($('.surt__input').html() == '<div class="surt__token surt__token_type_rubric">Ресторан</div>');
            suggest.dispose();
        });

        it('Вниз + вверх + вниз + enter приводит к выбору первого сагеста', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ре',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            var e = jQuery.Event('keydown');

            e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown');
            e.keyCode = 38;
            $('.surt__input').trigger(e); // Up
            e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down

            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e); // Enter

            assert($('.surt__input').html() == '<div class="surt__token surt__token_type_rubric">Ресторан</div>');
            suggest.dispose();
        });

        it('Клик по первому сагесту приводит к его выбору', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ре',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            var e;

            e = jQuery.Event('click');
            $('.surt__suggests-item').eq(0).trigger(e); // Click

            assert($('.surt__input').html() == '<div class="surt__token surt__token_type_rubric">Ресторан</div>');
            suggest.dispose();
        });

        it('Клик по второму сагесту приводит к его выбору', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ре',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }], [{
                    text: 'Кафе',
                    type: 'attr'
                }]
            ]});

            var e;

            e = jQuery.Event('click');
            $('.surt__suggests-item').eq(1).trigger(e); // Click

            assert($('.surt__input').html() == '<div class="surt__token surt__token_type_filter">wifi</div>');
            suggest.dispose();
        });

        it('Клик по первому сагесту, когда текст в инпуте совпадает с ним, приводит к его выбору', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }]
            ]});

            var e;

            e = jQuery.Event('click');
            $('.surt__suggests-item').eq(0).trigger(e); // Click

            var html = $('.surt__input').html();

            assert(html == '<div class="surt__token surt__token_type_rubric">Ресторан</div>', 'В инпуте html = ' + html);
            assert(!$('.surt').hasClass('surt_dropdown_true'), 'Выпадашка закрылась');
            suggest.dispose();
        });

        it('Клик по первому сагесту, когда токен в инпуте совпадает с ним, приводит к его выбору', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            suggest.set({
                kit: [{
                    text: 'Ресторан',
                    type: 'rubric'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }]
            ]});

            var e;

            e = jQuery.Event('click');
            $('.surt__suggests-item').eq(0).trigger(e); // Click

            var html = $('.surt__input').html();

            assert(html == '<div class="surt__token surt__token_type_rubric">Ресторан</div>', 'В инпуте html = ' + html);
            assert(!$('.surt').hasClass('surt_dropdown_true'), 'Выпадашка закрылась');
            suggest.dispose();
        });
    });

    describe('Набор текста.', function() {
        it('Нажатие пробела после слова в режиме незаполнения кита', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true'
            });

            var e = jQuery.Event('keydown');

            $('.surt__input').html('Ресторан');
            suggest.restoreCursor(8);

            e.keyCode = 32;
            $('.surt__input').trigger(e); // Down

            e = jQuery.Event('keydown');
            e.keyCode = 32;
            $('.surt__input').trigger(e); // Enter

            var text = $('.surt__input').html();

            assert(text == 'Ресторан&nbsp;', 'Пробел добавился в текст: ' +  '|Ресторан&nbsp;| == |' + text + '|');
            suggest.dispose();
        });
    });
});