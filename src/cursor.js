// Cursor positioning in content editable container
(function(window, undefined) {
    var surt = window.surt || {};

    surt.fn = surt.fn || {};

    /*
     * Находит ребенка и позицию внутри него по заданной ноде и позиции внутри этой ноды
     * @node - нода, в которой известна текстовая позиция курсора
     * @N - текстовая позиция курсора
     * @return {
            child - прямой потомок node, внутри которого оказался курсор (включая текстовые)
            n - номер текстовой позиции в child
        }
     */
    function findPosChild(node, N) {
        var sum = 0;
        
        for (var i = 0 ; i < node.childNodes.length ; i++) {
            var length = $(node.childNodes[i]).text().length;

            sum += length;
            if (sum >= N) {
                return {
                    child: node.childNodes[i],
                    n: N - (sum - length)
                };
            }
        }

        return {};
    }

    // Сохраняет позицию курсора
    surt.fn.saveCursor = function() {
        if (!window.getSelection) return; // IE8-

        var selection = window.getSelection();

        if ( !selection.anchorNode ) return; // No selection at all

        var range = selection.getRangeAt(0),
            container = range.startContainer, // Returns the Node within which the Range starts.
            offset = range.startOffset, // Returns a number representing where in the startContainer the Range starts.
            child = container; // Может быть текстовая нода, наверняка
        
        // Цикл вверх по родителям, вплоть до node
        var N = offset;
        while (child && child != this.inputNode) {
            var i = 0,
                sibling = child.previousSibling,
                text;
            
            while (sibling) {
                text = $(sibling).text();
                N += text.length; // К позиции курсора внутри child прибавляем позицию самого child
                sibling = sibling.previousSibling;
            };

            child = child.parentNode;
        }

        this.cursorPos = N;

        return N;
    };

    surt.fn.restoreCursor = function(n) {
        if (!window.getSelection) return; // IE8-

        // if (!node || typeof N == 'undefined') return;

        var input = this.inputNode,
            range = document.createRange(),
            selection = window.getSelection(),
            targetNode = this.inputNode;
        
        n = n || this.cursorPos;
        
        // Цикл вниз по детям для поиска текстовой ноды куда надо выставить курсор
        while (targetNode && targetNode.nodeType == 1) {
            obj = findPosChild(targetNode, n);
            targetNode = obj.child;
            n = obj.n;
        }
        
        if (targetNode && targetNode.nodeType == 3) {
            range.setStart(targetNode, n); // Sets the start position of a Range.
            range.collapse(true); // Collapses the Range to one of its boundary points.
            selection.removeAllRanges(); // Removes all ranges from the selection.
            selection.addRange(range); // A range object that will be added to the selection.
        }
        
        input.focus();
    };
})(this);