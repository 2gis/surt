describe('Performance.', function() {
    it.skip('Memory leak', function() {
        var i = 0,
            suggest = [];

        function set() {
            var n = suggest.length - 1;

            if (n >= 0) suggest[n].dispose();
            // suggest[suggest.length - 1] = null;

            $('.wrapper_common').html(simpleHTML);

            var su = $('.wrapper_common .surt').surt({
                input: '.surt__input',
                suggest: '.surt__suggests',
                suggestItemCls: 'surt__suggests-item',
                suggestItemCurrentCls: 'surt__suggests-item_state_current',
                suggestCls: 'surt_dropdown_true',
                tokenCls: 'surt__token',
                textCls: 'surt__text',
                clone: '.surt__clone-main',
                autocomplete: '.surt__clone-hint',
                autocompleteCls: 'surt_autocomplete_true',
                selectionCls: 'surt__selection'
            });
            suggest.push(su);

            for (j = 0 ; i < 100 ; i++) {
                su.set({
                    kit: [{
                        text: 'Ре' + j,
                        type: 'text' + j
                    }],
                    suggest: [[{
                        text: 'Ресторан' + j,
                        type: 'rubric' + j
                    }]]
                });
            }

            i++;

            if (i < 1000) {
                setTimeout(set, 0);
            } else {
                console.log('end');
            }
        }

        set();
    });
});