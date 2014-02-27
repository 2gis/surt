(function(window, undefined) {
    // var surt = window.surt || {};

    /*
     * Generates text from kit
     * @kit - kit in standart format
     * @returns - text generated from kit
     */
    function kit2text(kit) {
        var text = '';

        if (kit) {
            for (var i = 0 ; i < kit.length ; i++) {
                if (i > 0) {
                    text += ' ';
                }

                text += kit[i].text;
            }
        }

        return text;
    }

    /**
     * @kit - old kit of tokens
     * @text - new user query
     * @return - new kit based on old kit tokens and new text 
     */
    var parser = function(kit, oriText) {
        var newKit = [],
            trim = this.trim;

        /*
         * Pushing token to newKit and remove text of token from text
         * text.indexOf(token.text) === 0!!!
         */
        function pushToken(token) {
            if (token.type == 'text' && newKit.length && newKit[newKit.length - 1].type == 'text') { // Объединение соседних текстовых токенов
                newKit[newKit.length - 1].text += ' ' + token.text;
            } else {
                newKit.push(token);
            }
            text = trim(text.replace(token.text, ''));
        }

        var text = oriText;
        if (this.delimiter) {
            text = text.replace(new RegExp(this.delimiter, 'g'), ' ');
        }
        text = text.replace(new RegExp('  ', 'g'), ' '); // ', ' -> '  ' -> ' '

        if (kit2text(kit) === text) return kit;

        // Cycle by kit (each token)
        if (kit) {
            for (var i = 0 ; i < kit.length ; i++) {
                var index = text.indexOf(kit[i].text),
                    beforeChar = text[index - 1],
                    afterChar = text[index + kit[i].text.length];

                if ((afterChar !== ' ' && afterChar !== undefined) || // После найденной подстрокой не пробел и не конец строки - это не токен
                    (beforeChar !== ' ' && beforeChar !== undefined)) { // Или перед найденной подстрокой
                    index = -1;
                }

                if (index == 0) {
                    pushToken(kit[i]);
                } else if (index > 0) {
                    var newPlainText = trim(text.substring(0, index));

                    pushToken({
                        text: newPlainText,
                        type: 'text'
                    });

                    pushToken(kit[i]);
                }
            }
        }

        // Last undefined token
        text = trim(text);
        if (text) {
            pushToken({
                text: text,
                type: 'text'
            });
        }

        return newKit;
    };

    // Заменяет подстроки partial в тексте html минуя внутренности тегов html
    parser.replace = function(html) {
        function escape(text) {
            return String(text).replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
        }

        var partial = escape(this.text());
        /* jshint -W044 */
        partial = '((>[^<]*|^[^<>]*))(' + partial + ')([\w -]*)';
        /* jshint +W044 */

        return html.replace(new RegExp(partial, "i"), '$1<span class="' + this.params.selectionCls + '">$3</span>$4');
    };

    if (typeof module != "undefined") {
        module.exports = parser;
    } else {
        $.fn.surt.fn.parser = parser;
    }
})(this);