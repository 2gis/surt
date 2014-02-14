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

        if (N < 0) { // При отрицательной позиции ставим курсор в начало
            sum = 0;
        }
        
        return {
            child: node.childNodes[node.childNodes.length - 1],
            n: sum
        };
    }

    // Возвращает позицию курсора
    surt.fn.getCursor = function() {
        var N;

        // Цикл вверх по родителям, вплоть до node
        if (this.inputNode.tagName == 'INPUT') {
            N = this.inputNode.selectionEnd;
        } else {
            if (!window.getSelection) return; // IE8-

            var selection = window.getSelection();

            if ( !selection.anchorNode ) return; // No selection at all

            var range = selection.getRangeAt(0),
                container = range.startContainer, // Returns the Node within which the Range starts.
                offset = range.startOffset, // Returns a number representing where in the startContainer the Range starts.
                child = container; // Может быть текстовая нода, наверняка

            N = offset;

            while (child && child != this.inputNode) {
                var sibling = child.previousSibling,
                    text;
                
                while (sibling) {
                    text = $(sibling).text();
                    N += text.length; // К позиции курсора внутри child прибавляем позицию самого child
                    sibling = sibling.previousSibling;
                }

                child = child.parentNode;
            }
        }

        return N;
    };

    // Сохраняет позицию курсора
    surt.fn.saveCursor = function() {
        this.cursorPos = this.getCursor();

        this._lastPos = this.cursorPos == this.text().length;

        return this.cursorPos;
    };

    surt.fn.restoreCursor = function(ccp) {
        if (!window.getSelection) return; // IE8-

        var self = this,
            n = ccp;

        // if (!node || typeof N == 'undefined') return;

        // if (self.inputNode.focus) {
        //     setTimeout(function() {
        //         self.inputNode.blur(); // f webkit
        //         self.inputNode.focus(); // Костыль для возвращения фокуса в инпут
        //     }, 0);
        // }

        var range = document.createRange(),
            selection = window.getSelection(),
            targetNode = this.inputNode,
            pos;
        
        pos = this._lastPos ? this.text().length : this.cursorPos;
        n = n || pos;
        
        // Цикл вниз по детям для поиска текстовой ноды куда надо выставить курсор
        if (this.inputNode.tagName != 'INPUT') {
            while (targetNode && targetNode.nodeType == 1) {
                obj = findPosChild(targetNode, n);
                targetNode = obj.child;
                n = obj.n;
            }
        }
        
        if (targetNode && targetNode.nodeType == 3) {
            n = Math.min(n, this.$(targetNode).text().length);
            n = Math.max(n, 0);
            range.setStart(targetNode, n); // Sets the start position of a Range.
            range.collapse(true); // Collapses the Range to one of its boundary points.
            selection.removeAllRanges(); // Removes all ranges from the selection.
            selection.addRange(range); // A range object that will be added to the selection.
        }

        if (ccp >= this.text().length - 1) {
            setTimeout(function() {
                // Chrome scroll to the end
                self.inputNode.scrollLeft = 99999;

                // Firefox scroll to the end
                self.inputNode.selectionStart = n;
                self.inputNode.selectionEnd = n;
            }, 0);
        }
        
        // this.inputNode.focus();
    };
})(this);