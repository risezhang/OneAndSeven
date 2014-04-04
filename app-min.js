var Bear = {};

Bear.utils = (function(doc) {
    var obj = {}

    obj.loadScript = function(url, callback) {
        var script = doc.createElement('script')

        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null
                    callback(script)
                }
            };
        } else {
            script.onload = function () {
                callback(script)
            }
        }

        script.src = url
        doc.body.appendChild(script)
    }

    obj.loadScriptString = function(code, callback) {
        var script = doc.createElement('script')
        try {
            script.appendChild(doc.createTextNode(code))
        } catch(ex) {
            script.text = code
        }
        doc.body.appendChild(script)
        callback(script)
    }

    return obj
})(document);

+function(Bear, doc) {
    var Island = function() {
        this.large = doc.getElementById('large')
        this.small = doc.getElementById('small')
        this.mini = doc.getElementById('mini')

        this.init()
    }

    Island.prototype.handleEvent = function(event) {
        if (event.currentTarget.id == 'large' && event.target.className == 'item') {
            Bear.utils.loadScript('data/' + event.target.getAttribute('data-id') + '.js', function(script) {
                script.parentNode.removeChild(script)
                script = null
            })
        }
    }

    Island.prototype.proxy = function(fn, context) {
        return function(event) {
            fn.apply(context, arguments)
        }
    }

    Island.prototype.init = function() {
        this.large.addEventListener('click', this.proxy(this.handleEvent, this), false)
    }

    Island.prototype.jsonpCallback = function(data) {
        var html = ''
        for (var i = 0, l = data.list.length; i < l; i++) {
            html += '<li class="item">' + data.list[i].name
            if (data.list[i].link) {
                html += '<a class="link" href="' + data.list[i].link + '">&#8674;</a>'
            }
            html += '</li>'
        }
        document.getElementById('small').innerHTML = '<ul>' + html + '</ul>'
    }

    Bear.island = function(element) {
        if (!element.island) {
            element.island = new Island()
        }
        return element.island
    }
}(Bear, document);

Bear.island(document.getElementById('loveandpeace'))
