(function(window, undefined) {
    var surt = window.surt || {};

    /*
     * Generates text from set
     * @set - set in standart format
     * @returns - text generated from set
     */
    function set2text(set) {
        var text = '';

        for (var i = 0 ; i < set.length ; i++) {
            if (i > 0) {
                text += ' ';
            }

            text += set[i].text;
        }

        return text;
    }

    /**
     * @set - old set of tokens
     * @text - new user query
     * @return - new set based on old set tokens and new text 
     */
    var parser = function(set, text) {
        var newSet = [];

        /*
         * Pushing token to newSet and remove text of token from text
         * text.indexOf(token.text) === 0!!!
         */
        function pushToken(token) {
            newSet.push(token);
            text = text.replace(token.text, '').trim();
        }

        if (set2text(set) === text) return set;

        // Cycle by set (each token)
        for (var i = 0 ; i < set.length ; i++) {
            var index = text.indexOf(set[i].text);

            if (index == 0) {
                pushToken(set[i]);
            } else if (index > 0) {
                var newPlainText = text.substring(0, index).trim();
                pushToken({
                    text: newPlainText,
                    type: 'text'
                });
                pushToken(set[i]);
            }
        }

        // Last undefined token
        if (text) {
            pushToken({
                text: text,
                type: 'text'
            })
        }
        
        return newSet;
    };

    surt.parser = parser;

    if (typeof module != undefined) {
        module.exports = parser;
    }
})(this);