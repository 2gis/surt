describe('События.', function() {
    beforeEach(function() {
        $('.wrapper_common').html(originalHTML);
        $('.wrapper_input').html(simpleHTML);
    });

    it('Параметр change', function() {
        var x = 0;

        function callback() {
            x++;
        }

        var suggest = $('.surt').surt({
            input: '.surt__input',
            change: callback
        });

        $('.surt__input').trigger('keyup');

        suggest.dispose();
        assert(x == 1);
        suggest.dispose();
    });

    describe('Автокомплит.', function() {
        it('При не крайне правой позиции курсора нажатие стрелки вправо не приводит к автокомплиту (html mode)', function() {
            function test(params) {
                var suggest = $(params.root).surt(params);

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
                    html = $('.wrapper_common .surt__input').html();

                suggest.restoreCursor(1);
                e.keyCode = 39;
                $('.surt__input').trigger(e);

                var text = $('.wrapper_common .surt__input').html();

                assert(html == text, 'Значение в инпуте совпадает со значением до нажатия вправо');
                suggest.dispose();
            }

            test({
                root: '.wrapper_common .surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
            });
        });

        it('При не крайне правой позиции курсора нажатие стрелки вправо не приводит к автокомплиту (text mode & input)', function() {
            var completed;
            var suggest = $('.wrapper_input .surt').surt({
                input: '.surt__input',
                inputMode: 'text',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete',
                readyCls: 'surt_ready_true',
                stateFocusCls: '_focus',
                delimiter: ',',
                complete: function() {
                    completed = true;
                }
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

            $('.wrapper_input .surt__input').val('Ре');

            var e = jQuery.Event('keydown'),
                html = $('.wrapper_input .surt__input').val();

            suggest.restoreCursor(1);
            e.keyCode = 39;
            $('.wrapper_input .surt__input').trigger(e);

            var text = $('.wrapper_input .surt__input').val();

            // assert(html == text);
            // Странные дела, перед этой правкой complete должен был вызываться
            assert(!completed, 'Был вызван метод complete');
            suggest.dispose();
        });

        it('При крайне правой позиции курсора нажатие стрелки вправо приводит к автокомплиту', function() {
            var suggest = $('.surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
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

            assert($('.surt__input').html() == '<div class="surt__token _type_rubric">Ресторан</div>');
            suggest.dispose();
        });

        it('При нажатии вправо автокомплит подставляется а курсор уходит в крайне правое положение', function() {
            var suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete'
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
            $('.wrapper_common .surt__input').trigger(e);

            var pos = suggest.getCursor(),
                html = $('.wrapper_common .surt__input').html(),
                complete = $('.wrapper_common .surt__clone-main').html();

            assert(pos == $('.surt__input').text().length, 'Позиция выставилась в крайне правое положение ' + pos + '|' + $('.surt__input').text().length);
            assert(html == '<div class="surt__token _type_rubric">Ресторан</div>', 'В инпут попадает первый сагест');
            suggest.dispose();
        });

        it('При вызове метода submit автокомплит изчезает', function() {
            var suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete'
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

            e.keyCode = 13;
            $('.surt__input').trigger(e);

            var pos = suggest.getCursor(),
                text = $('.surt__input').text(),
                complete = $('.surt__clone-hint').html();

            assert(pos == $('.surt__input').text().length);
            assert(text == 'Ре', 'В инпуте остался текст');

            assert(!$('.wrapper_common .surt').hasClass('_autocomplete'), 'Комплит спрятан');
            suggest.dispose();
        });

        it('Нажатие вниз приводит к заполнению в автокомплите второго сагеста', function() {
            var suggest = $('.wrapper_common .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
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
                    text: 'Рестораны и кафе',
                    type: 'filter'
                }]]
            });

            // var e = jQuery.Event('keydown');

            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down

            assert($('.wrapper_common .surt__clone-hint').html() == 'стораны и кафе');

            e = jQuery.Event('keydown'); e.keyCode = 39; $('.surt__input').trigger(e); // Right
            assert($('.wrapper_common .surt__input').html() == '<div class="surt__token _type_filter">Рестораны и кафе</div>', 'В инпут выставился именно второй сагест');
            suggest.dispose();
        });

        it('Выбор сагеста и нажатие вправо приводит к его попаданию в поле даже когда не начинается с текста в инпуте', function() {
            var suggest = $('.wrapper_common .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
            });

            suggest.set({
                kit: [{
                    text: 'ест',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'Рестораны и кафе',
                    type: 'filter'
                }]]
            });

            // var e = jQuery.Event('keydown');

            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down

            // assert($('.wrapper_common .surt__clone-hint').html() == '', 'В автокомплите нет текста');

            e = jQuery.Event('keydown'); e.keyCode = 39; $('.surt__input').trigger(e); // Right
            assert($('.wrapper_common .surt__input').html() == '<div class="surt__token _type_filter">Рестораны и кафе</div>', 'В инпут выставился именно второй сагест ' + $('.wrapper_common .surt__input').html());
            suggest.dispose();
        });

        it('При удалении текста модификатор автокомплита не выставляется', function() {
            var suggest = $('.wrapper_common .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
            });

            suggest.set({
                kit: [{
                    text: 'ест',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'Рестораны и кафе',
                    type: 'filter'
                }]]
            });

            $('.surt__input').text('');

            $('.wrapper_simple .surt__input').focus();
            $('.wrapper_common .surt__input').focus();

            var e;
            e = jQuery.Event('keyup'); $('.surt__input').trigger(e);

            assert(!$('.wrapper_common .surt').hasClass('_autocomplete'), 'Класса автокомплита не должно быть');
            suggest.dispose();
        });

        it('Если первый сагест не начинается с текста в инпуте - класс автокомплита не выставляется, текст тоже', function() {
            var suggest = $('.wrapper_common .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
            });

            suggest.set({
                kit: [{
                    text: 'ест',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'Рестораны и кафе',
                    type: 'filter'
                }]]
            });

            $('.wrapper_simple .surt__input').focus();
            $('.wrapper_common .surt__input').focus();

            assert(!$('.wrapper_common .surt').hasClass('_autocomplete'), 'Класса автокомплита не должно быть');
            assert(!$('.wrapper_common .surt__clone-hint').text(), 'Текста в автокомплите не должно быть');
            suggest.dispose();
        });

        it('Если сагесты есть, есть активный сагест, но он не подходит для автокомплита, нажатие вправо не приводит к автокомплиту', function() {
            var suggest = $('.wrapper_input .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
            });

            suggest.set({
                kit: [{
                    text: 'ест',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'Рестораны и кафе',
                    type: 'filter'
                }]]
            });

            var e = jQuery.Event('keydown');
            e.keyCode = 39; // Right arrow
            $('.surt__input').trigger(e);

            assert($('.wrapper_input .surt__input').val() == 'ест', 'Текст в инпуте не изменился');

            suggest.dispose();
        });

        it('В автокомплит не выводится ничего если суммарно текст длиннее aunt', function() {
            var suggest = $('.wrapper_input .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete',
                aunt: 3
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
                    text: 'Рестораны и кафе',
                    type: 'filter'
                }]]
            });

            var e = jQuery.Event('keydown');
            e.keyCode = 40; // Down
            $('.surt__input').trigger(e);
            e = jQuery.Event('keydown');
            e.keyCode = 40; // Down
            $('.surt__input').trigger(e);

            assert($('.wrapper_input .surt__clone-hint').text() == '', 'Текста в автокомплитере нет');
            suggest.dispose();
        });
    });

    describe('Выбор сагестов.', function() {
        it('Нажатие вниз + enter приводит к выбору первого сагеста и сабмиту', function() {
            var x = 0,
                y = 0,
                submit = false,
                shown,
                suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    submit: function() {
                        x += y + 1;
                    },
                    pick: function(kit, c) {
                        y += 10;
                        submit = c;
                    },
                    show: function(s) {
                        shown = s;
                    }
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

            assert($('.surt__input').html() == '<div class="surt__token _type_rubric">Ресторан</div>');
            assert(y == 10, 'Был вызван метод pick');
            assert(submit, 'Был вызван метод pick причем второй аргумент был true');
            assert(x == 11, 'Был вызван метод submit');
            assert(submit === true, 'Был вызван метод show');
            suggest.dispose();
        });

        it('Удаление сагестов и их повторное заполнение приводит к повторному срабатыванию show', function() {
            var shown = 0,
                suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    show: function(s) {
                        if (s) {
                            shown++;
                        }
                    }
                });

            $('.surt__input').focus();

            suggest.set({
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            assert(shown === 1, 'Был вызван метод show 1 раз: ' + shown);

            suggest.set({
                suggest: []
            });

            suggest.set({
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            assert(shown === 2, 'Был вызван метод show второй раз');

            suggest.dispose();
        });

        it('Фокус на поле при пустом сагесте не приводит к show', function() {
            var x = 0,
                y = 0,
                submit = false,
                shown = 0,
                suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    show: function(s) {
                        if (s) {
                            shown++;
                        }
                    }
                });

            $('.surt__input').focus();

            suggest.set({
                suggest: []
            });

            $('.surt__input').blur().focus();

            assert(shown === 0, 'show не был вызван ни разу');

            suggest.dispose();
        });

        it('Установка сагеста [] приводит к его удалению', function() {
            var shown,
                suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    show: function(e) {
                        shown = e;
                    }
                });

            suggest.set({
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'wifi',
                    type: 'filter'
                }]]
            });

            assert($('.wrapper_common .surt__suggests-item').length > 0, 'После установки есть два итема сагеста ' + $('.wrapper_common .surt__suggests-item').length);
            assert(shown, 'Был вызван show с параметром true');

            suggest.set({
                suggest: []
            });

            assert($('.wrapper_common .surt__suggests-item').length == 0, 'После установки [] у сагеста нет ни одного итема (мы удалили их) ' + $('.wrapper_common .surt__suggests-item').length);
            assert(!shown, 'Был вызван show с параметром false');

            suggest.dispose();
        });

        it('2 нажатия вниз + enter приводит к выбору второго сагеста', function() {
            var suggest = $('.wrapper_common .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
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
            $('.wrapper_common .surt .surt__suggests').append('dima');

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

            assert($('.wrapper_common .surt__input').html() == '<div class="surt__token _type_filter">wifi</div>', 'В инпут помещен html из второго сагеста');
            assert($('.wrapper_common .surt__suggests').html() == '<li class="surt__suggests-item"><div class="surt__token _type_rubric">Ресторан</div></li><li class="surt__suggests-item"><div class="surt__token _type_filter">wifi</div></li>dima', 'HTML из сагестов не перезаписан (производительность)');
            suggest.dispose();
        });

        it('2 нажатия вниз + нажатие вверх + enter приводит к выбору первого сагеста', function() {
            var x = 0,
                suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    change: function() {
                        x++;
                    }
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
            $('.wrapper_common .surt .surt__suggests').append('dima');

            var e = jQuery.Event('keydown');
            // debugger

            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down keydown
            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down
            e = jQuery.Event('keydown'); e.keyCode = 40; $('.surt__input').trigger(e); // Down keydown
            e = jQuery.Event('keydown'); e.keyCode = 38; $('.surt__input').trigger(e); // Up keydown
            e = jQuery.Event('keyup');   e.keyCode = 38; $('.surt__input').trigger(e); // Up keyup

            assert(x === 0, 'change при нажатии вверх-вниз не вызвался');

            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e); // Enter

            assert($('.surt__input').html() == '<div class="surt__token _type_rubric">Ресторан</div>', 'HTML совпадает: ' + $('.surt__input').html());
            assert($('.wrapper_common .surt__suggests').html() == '<li class="surt__suggests-item"><div class="surt__token _type_rubric">Ресторан</div></li><li class="surt__suggests-item"><div class="surt__token _type_filter">wifi</div></li>dima', 'HTML из сагестов не перезаписан');
            suggest.dispose();
        });

        it('Вниз + вверх + вниз + enter приводит к выбору первого сагеста', function() {
            var suggest = $('.surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
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

            assert($('.surt__input').html() == '<div class="surt__token _type_rubric">Ресторан</div>');
            suggest.dispose();
        });

        it('Клик по первому сагесту приводит к его выбору, а второй аргумент в pick - false', function() {
            var submit,
                suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    pick: function(a, c) {
                        submit = c;
                    }
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

            e = jQuery.Event('mousedown');
            $('.surt__suggests-item').eq(0).trigger(e); // Click

            assert($('.surt__input').html() == '<div class="surt__token _type_rubric">Ресторан</div>');
            assert(!submit, 'Второй аргумент в pick - false');
            suggest.dispose();
        });

        it('Клик по второму сагесту приводит к его выбору', function() {
            var suggest = $('.surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
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

            e = jQuery.Event('mousedown');
            $('.surt__suggests-item').eq(1).trigger(e); // Click

            assert($('.surt__input').html() == '<div class="surt__token _type_filter">wifi</div>');
            suggest.dispose();
        });

        it('Клик по первому сагесту, когда текст в инпуте совпадает с ним, приводит к его выбору', function() {
            function test(params) {
                var suggest = $(params.root).surt(params);

                suggest.set({
                    kit: [{
                        text: 'Рестора',
                        type: 'text'
                    }],
                    suggest: [[{
                        text: 'Ресторан',
                        type: 'rubric'
                    }]
                ]}, true);
                var text = $('.surt__input').text();

                assert($('.wrapper_common .surt').hasClass('_dropdown'), 'Выпадашка открылась');
                assert(!$('.wrapper_delimiter .surt').hasClass('_dropdown'), 'Выпадашка на соседнем инпуте не открылась');

                var e;

                e = jQuery.Event('mousedown');
                $('.wrapper_common .surt__suggests-item').eq(0).trigger(e); // Click

                text = $('.surt__input').text();

                assert(text == 'Ресторан', 'after: В инпуте text = ' + text);
                assert(!$('.wrapper_common .surt').hasClass('_dropdown'), 'Выпадашка закрылась');
                
                suggest.dispose();
            }

            test({
                root: '.wrapper_common .surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint'
            });

            // В текстовом режиме
            test({
                root: '.wrapper_common .surt',
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                inputMode: 'text'
            });
        });

        it('Клик по enter не приводит к вызову change', function() {
            var x,
                suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    change: function() {
                        x++;
                    }
                });

            var e;

            e = jQuery.Event('keyup');
            e.keyCode = 13; // Enter
            x = 0;
            $('.surt__input').trigger(e);
            assert(x === 0, 'Функция change не выполнилась');
            suggest.dispose();
        });

        it('Клико-выбор сагеста приводит к вызову change', function() {
            var x,
                suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    change: function() {
                        x++;
                    }
                });

            suggest.set({
                kit: [{
                    text: 'Рестора',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }]
            ]}, true);

            x = 0;

            var e;
            e = jQuery.Event('mousedown');
            $('.surt__suggests-item').eq(0).trigger(e); // Click
            
            assert(x === 1, 'Функция change выполнилась');
            suggest.dispose();
        });

        it('Нажатие кнопки вниз когда сагеста нет', function() {
            var x,
                suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    change: function() {
                        x++;
                    }
                });

            suggest._activeSuggest = 0; // Не установлено при каких обстоятельствах на начальном этапе оно выставляется, но факт

            x = 0;

            var e;
            e = jQuery.Event('keydown');
            e.keyCode = 40; // Down
            $('.wrapper_common .surt__input').trigger(e);
            e = jQuery.Event('keydown');
            e.keyCode = 39; // Down
            $('.wrapper_common .surt__input').trigger(e);
            e = jQuery.Event('keydown');
            e.keyCode = 38; // Down
            $('.wrapper_common .surt__input').trigger(e);
            
            suggest.dispose();
        });

        // it('Нажатие вниз 1 раз + наведение мышью на второй сагест приводит к его активации и деактивации первого', function() {
        //     var suggest = surt({
        //             root: '.surt',
        //             input: '.surt__input',
        //             suggest: '.surt__suggests',
        //             suggestItemCls: 'surt__suggests-item',
        //             suggestItemCurrentCls: 'surt__suggests-item_state_current',
        //             suggestCls: '_dropdown',
        //             tokenCls: 'surt__token',
        //             textCls: 'surt__text',
        //             clone: '.surt__clone-main',
        //             hint: '.surt__clone-hint',
        //             autocompleteCls: '_autocomplete'
        //         });

        //     suggest.set({
        //         kit: [{
        //             text: 'Ре',
        //             type: 'text'
        //         }],
        //         suggest: [[{
        //             text: 'Ресторан',
        //             type: 'rubric'
        //         }], [{
        //             text: 'Резиденция',
        //             type: 'rubric'
        //         }], [{
        //             text: 'Река',
        //             type: 'rubric'
        //         }]]
        //     });

        //     var e = jQuery.Event('keydown');
        //     e.keyCode = 40;
        //     $('.surt__input').trigger(e); // Down

        //     assert($('.surt__suggests-item').eq(0).hasClass('surt__suggests-item_state_current'), 'После нажатия вниз самый первый сагест становится активным');
        //     assert($('.surt__clone-hint').text() == 'сторан', 'Автокомплит принадлежит первому сагесту');

        //     e = jQuery.Event('mousemove');
        //     $('.surt__suggests-item').eq(1).trigger(e); // Hover

        //     assert(!$('.surt__suggests-item').eq(0).hasClass('surt__suggests-item_state_current'), 'После ховера первый сагест перестает быть активным');
        //     assert($('.surt__suggests-item').eq(1).hasClass('surt__suggests-item_state_current'), 'После ховера второй сагест становится активным');
        //     assert($('.surt__clone-hint').text() == 'зиденция', 'Автокомплит принадлежит второму сагесту');

        //     suggest.dispose();
        // });

        // it('Наведение мыши на второй сагест + нажатие вниз приводит к активации третьего сагеста', function() {
        //     var suggest = surt({
        //             root: '.surt',
        //             input: '.surt__input',
        //             suggest: '.surt__suggests',
        //             suggestItemCls: 'surt__suggests-item',
        //             suggestItemCurrentCls: 'surt__suggests-item_state_current',
        //             suggestCls: '_dropdown',
        //             tokenCls: 'surt__token',
        //             textCls: 'surt__text',
        //             clone: '.surt__clone-main',
        //             hint: '.surt__clone-hint',
        //             autocompleteCls: '_autocomplete'
        //         });

        //     suggest.set({
        //         kit: [{
        //             text: 'Ре',
        //             type: 'text'
        //         }],
        //         suggest: [[{
        //             text: 'Ресторан',
        //             type: 'rubric'
        //         }], [{
        //             text: 'Резиденция',
        //             type: 'rubric'
        //         }], [{
        //             text: 'Река',
        //             type: 'rubric'
        //         }]]
        //     });

        //     var e;

        //     e = jQuery.Event('mousemove');
        //     $('.surt__suggests-item').eq(1).trigger(e); // Hover

        //     assert($('.surt__suggests-item').eq(1).hasClass('surt__suggests-item_state_current'), 'После ховера на второй, второй активируется');
        //     assert(!$('.surt__suggests-item').eq(0).hasClass('surt__suggests-item_state_current'), 'После ховера на второй, первый деактивируется');
        //     assert(!$('.surt__suggests-item').eq(2).hasClass('surt__suggests-item_state_current'), 'После ховера на второй, третий деактивируется');
        //     assert($('.surt__clone-hint').text() == 'зиденция', 'Автокомплит принадлежит второму сагесту');

        //     e = jQuery.Event('keydown');
        //     e.keyCode = 40;
        //     $('.surt__input').trigger(e); // Down

        //     assert(!$('.surt__suggests-item').eq(0).hasClass('surt__suggests-item_state_current'), 'После нажатия внис со второго на третий, первый деактивируется');
        //     assert(!$('.surt__suggests-item').eq(1).hasClass('surt__suggests-item_state_current'), 'После нажатия внис со второго на третий, второй деактивируется');
        //     assert($('.surt__suggests-item').eq(2).hasClass('surt__suggests-item_state_current'), 'После нажатия внис со второго на третий, третий активируется');
        //     assert($('.surt__clone-hint').text() == 'ка', 'Автокомплит принадлежит третьему сагесту');

        //     suggest.dispose();
        // });

        it('Наведение мыши на второй сагест + enter приводит к сабмиту второг сагеста', function() {
            var submit,
                suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    submit: function(data) {
                        submit = true;
                    }
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
                    text: 'Резиденция',
                    type: 'rubric'
                }], [{
                    text: 'Река',
                    type: 'rubric'
                }]]
            });

            var e;

            e = jQuery.Event('mousemove');
            $('.surt__suggests-item').eq(1).trigger(e); // Hover

            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.surt__input').trigger(e); // Enter

            assert(submit, 'Был вызван сабмит');

            suggest.dispose();
        });

        it('Если дошли до сагеста и продолжили ввод - сагест должен подставиться + пробел', function() {
            var suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete'
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
                    text: 'Резиденция',
                    type: 'rubric'
                }], [{
                    text: 'Река',
                    type: 'rubric'
                }]]
            });

            var e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down

            e = jQuery.Event('keyup');
            e.keyCode = 65; // a
            $('.surt__input').trigger(e); // Up

            text = $('.surt__input').text();

            assert(text == 'Ресторан е', 'сагест подставился');

            suggest.dispose();
        });

        it('Если дошли до сагеста и продолжили ввод - сагест должен подставиться + пробел, но на backspace реакции быть не должно', function() {
            var suggest = $('.surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete'
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
                    text: 'Резиденция',
                    type: 'rubric'
                }], [{
                    text: 'Река',
                    type: 'rubric'
                }]]
            });

            var e = jQuery.Event('keydown');
            e.keyCode = 40;
            $('.surt__input').trigger(e); // Down

            e = jQuery.Event('keyup');
            e.keyCode = 8; // Backspace
            $('.surt__input').trigger(e);

            text = $('.surt__input').text();

            assert(text == 'Ре', 'сагест не подставился, текст в инпуте: ' + text);

            suggest.dispose();
        });
    });

    describe('Набор текста.', function() {
        it('keyup по cmd должен инициировать обновление кита', function() {
            var suggest = $('.surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
            });

            var e;

            // CMD
            $('.surt__input').text('рестораны');
            e = jQuery.Event('keyup');
            e.keyCode = 91;
            $('.surt__input').eq(0).trigger(e);
            assert(suggest.kit.length == 1);
            $('.surt__input').text('');
            e = jQuery.Event('keyup');
            e.keyCode = 91;
            $('.surt__input').eq(0).trigger(e);
            assert(suggest.kit.length == 0);

            // L ctrl
            $('.surt__input').text('рестораны');
            e = jQuery.Event('keyup');
            e.keyCode = 17;
            $('.surt__input').eq(0).trigger(e);
            assert(suggest.kit.length == 1);
            $('.surt__input').text('');
            e = jQuery.Event('keyup');
            e.keyCode = 17;
            $('.surt__input').eq(0).trigger(e);
            assert(suggest.kit.length == 0);

            // R ctrl
            $('.surt__input').text('рестораны');
            e = jQuery.Event('keyup');
            e.keyCode = 18;
            $('.surt__input').eq(0).trigger(e);
            assert(suggest.kit.length == 1);
            $('.surt__input').text('');
            e = jQuery.Event('keyup');
            e.keyCode = 18;
            $('.surt__input').eq(0).trigger(e);
            assert(suggest.kit.length == 0);

            suggest.dispose();
        });

        it('Если инициализация на инпуте - не должно быть html', function() {
            var suggest = $('.wrapper_input .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: '_dropdown',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                hint: '.surt__clone-hint',
                autocompleteCls: '_autocomplete'
            });

            dima = suggest;

            suggest.set({
                kit: [{
                    text: 'ест',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'Ресторан',
                    type: 'rubric'
                }], [{
                    text: 'Рестораны и кафе',
                    type: 'filter'
                }]]
            });

            assert($('.wrapper_input .surt__input').val() == 'ест');

            suggest.dispose();
        });
    });

    describe('Параметр selectionCls.', function() {
        it('Наличие параметра selectionCls приводит к оборачиванию совпадающих с поиском частей токенов в сагестах этим классом', function() {
            var suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    selectionCls: 'surt__selection'
                });

            // Выставляем текст в диво-инпут
            suggest.set({
                kit: [{
                    text: 'рес',
                    type: 'text'
                }]
            });

            // Заполняем сагест - должно произойти выделение подстрок 'рес' в токенам
            suggest.set({
                suggest: [[{
                    text: 'КрабоРесторан',
                    type: 'text'
                }]]
            });

            var suggestHTML = $('.wrapper_common .surt__suggests').html();

            assert(suggestHTML == '<li class="surt__suggests-item"><div class="surt__text">Крабо<span class="surt__selection">Рес</span>торан</div></li>');
            
            suggest.dispose();
        });

        it('Выбор сагеста приводит к изменению html сагестов при наличии параметра selectionCls', function() {
            var suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    selectionCls: 'surt__selection'
                });

            // Выставляем текст в диво-инпут
            suggest.set({
                kit: [{
                    text: 'рес',
                    type: 'text'
                }]
            });

            // Заполняем сагест - должно произойти выделение подстрок 'рес' в токенам
            suggest.set({
                suggest: [[{
                    text: 'КрабоРесторан',
                    type: 'text'
                }], [{
                    text: 'СуперКрабоРесторан',
                    type: 'text'
                }]]
            });

            var e;

            e = jQuery.Event('mousedown');
            $('.wrapper_common .surt__suggests-item').eq(0).trigger(e);

            var suggestHTML = $('.wrapper_common .surt__suggests').html();
            // console.log('suggestHTML', suggestHTML);
            
            assert(suggestHTML == '<li class="surt__suggests-item"><div class="surt__text"><span class="surt__selection">КрабоРесторан</span></div></li><li class="surt__suggests-item"><div class="surt__text">Супер<span class="surt__selection">КрабоРесторан</span></div></li>');
            suggest.dispose();
        });
    });

    describe('Параметр suggestCls.', function() {
        it('Класс suggestCls убирается когда количество сагестов становится 0', function() {
            var suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: 'surt__suggests-item_state_current',
                    suggestCls: '_dropdown',
                    tokenCls: 'surt__token',
                    textCls: 'surt__text',
                    clone: '.surt__clone-main',
                    hint: '.surt__clone-hint',
                    autocompleteCls: '_autocomplete',
                    selectionCls: 'surt__selection'
                });

            // Выставляем текст в диво-инпут
            suggest.set({
                kit: [{
                    text: 'рес',
                    type: 'text'
                }],
                suggest: [[{
                    text: 'КрабоРесторан',
                    type: 'text'
                }]]
            });

            $('.wrapper_common .surt__input').trigger('focus');

            assert($('.wrapper_common .surt').hasClass('_dropdown'), 'Класс _dropdown должен был навеситься');

            // Заполняем сагест - должно произойти выделение подстрок 'рес' в токенам
            suggest.set({
                suggest: []
            });

            $('.wrapper_common .surt__input').trigger('focus');

            assert(!$('.wrapper_common .surt').hasClass('_dropdown'), 'Класс _dropdown должен был удалиться');

            suggest.dispose();
        });
    });

    it('Enter при наличии элемента с классом suggestItemCurrentCls не приводит к ошибке', function() {
            var suggest = $('.wrapper_common .surt').surt({
                    input: '.surt__input',
                    suggest: '.surt__suggests',
                    suggestItemCls: 'surt__suggests-item',
                    suggestItemCurrentCls: '_current',
                    suggestCls: '_dropdown'
                });

            // Выставляем текст в инпут
            suggest.set({
                kit: [{
                    text: 'рес',
                    type: 'text'
                }]
            });

            $('body').append('<br class="_current">');

            var e;

            e = jQuery.Event('click');
            $('.wrapper_common .surt__input').trigger(e);
            
            e = jQuery.Event('keydown');
            e.keyCode = 13;
            $('.wrapper_common .surt__input').trigger(e);

            assert(true);

            // suggest.dispose();
        });
});
