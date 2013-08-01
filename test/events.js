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
        });

        it('При не крайне правой позиции курсора нажатие стрелки вправо не приводит к автокомплиту', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                kitCls: 'surt__par',
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
        });

        it('При крайне правой позиции курсора нажатие стрелки вправо приводит к автокомплиту', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                kitCls: 'surt__par',
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

            e.keyCode = 39;
            $('.surt__input').trigger(e);

            assert($('.surt__input').html() == '<div class="surt__par surt__par_type_rubric">Ресторан</div>');
        });

        it('Если в ПС уже есть токен (идет набор второго токена), а в первом сагесте только 1 токен, автокомплита не будет', function() {
            var suggest = surt({
                    root: '.surt',
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: 'surt_dropdown_true',
                    kitCls: 'surt__par',
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
                kitCls: 'surt__par',
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

            var e = jQuery.Event('keydown'),
                html = $('.surt__input').html();

            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down

            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e); // Enter

            assert($('.surt__input').html() == '<div class="surt__par surt__par_type_rubric">Ресторан</div>');
        });

        it('2 нажатия вниз + enter приводит к выбору второго сагеста', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                kitCls: 'surt__par',
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

            assert($('.surt__input').html() == '<div class="surt__par surt__par_type_filter">wifi</div>');
        });

        it('2 нажатия вниз + нажатие вверх + enter приводит к выбору первого сагеста', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                kitCls: 'surt__par',
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

            assert($('.surt__input').html() == '<div class="surt__par surt__par_type_rubric">Ресторан</div>');
        });

        it('Вниз + вверх + вниз + enter приводит к выбору первого сагеста', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                kitCls: 'surt__par',
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

            assert($('.surt__input').html() == '<div class="surt__par surt__par_type_rubric">Ресторан</div>');
        });

        it('Клик по первому сагесту приводит к его выбору', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                kitCls: 'surt__par',
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

            assert($('.surt__input').html() == '<div class="surt__par surt__par_type_rubric">Ресторан</div>');
        });

        it('Клик по второму сагесту приводит к его выбору', function() {
            var suggest = surt({
                root: '.surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                kitCls: 'surt__par',
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

            assert($('.surt__input').html() == '<div class="surt__par surt__par_type_filter">wifi</div>');
        });
    });
});