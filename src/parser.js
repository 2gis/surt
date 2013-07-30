(function(window, undefined) {
    var surt = window.surt || {};

    /*
     * Generates text from kit
     * @kit - kit in standart format
     * @returns - text generated from kit
     */
    function kit2text(kit) {
        var text = '';

        for (var i = 0 ; i < kit.length ; i++) {
            if (i > 0) {
                text += ' ';
            }

            text += kit[i].text;
        }

        return text;
    }

    /**
     * @kit - old kit of tokens
     * @text - new user query
     * @return - new kit based on old kit tokens and new text 
     */
    var parser = function(kit, text) {
        var newSet = [];

        /*
         * Pushing token to newSet and remove text of token from text
         * text.indexOf(token.text) === 0!!!
         */
        function pushToken(token) {
            newSet.push(token);
            text = text.replace(token.text, '').trim();
        }

        if (kit2text(kit) === text) return kit;

        // Cycle by kit (each token)
        for (var i = 0 ; i < kit.length ; i++) {
            var index = text.indexOf(kit[i].text);

            if (index == 0) {
                pushToken(kit[i]);
            } else if (index > 0) {
                var newPlainText = text.substring(0, index).trim();
                pushToken({
                    text: newPlainText,
                    type: 'text'
                });
                pushToken(kit[i]);
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

    if (typeof module != "undefined") {
        module.exports = parser;
    }
})(this);