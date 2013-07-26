$(document).ready(function() {
    var suggest = surt({
        input: '.search__input',
        suggest: '.search__suggests',
        suggestItem: '.search__suggests-item',
        autocomplete: '.search__clone',
        change: function(e) {
            // Изменение текста
            console.log('query', e.query);
        }
    });

    suggest.set([{
        text: 'Ресторан',
        type: 'rubric'
    }, {
        text: 'Wi-Fi',
        type: 'filter'
    }, {
        text: 'лыжи',
        type: 'attr'
    }]);
});