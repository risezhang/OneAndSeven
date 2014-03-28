var Bear = {};

Bear.utils = (function() {
    var obj = {}
    obj.loadScript = function(url, callback) {
        var doc = document
        var script = doc.createElement('script')

        if (script.readyState) { // IE
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
        var doc = document
        var script = doc.createElement('script')
        try { // Safari 3.0 之前的版本不能正确地支持 text 属性
            script.appendChild(doc.createTextNode(code))
        } catch(ex) { // IE 将<script>视为一个特殊的元素，不允许 DOM 访问其子节点
            script.text = code
        }
        doc.body.appendChild(script)
        callback(script)
    }

    return obj
})();

var jsonpCallback = function(data) {
    var html = ''
    for (var i = 0, l = data.list.length; i < l; i++) {
        if (data.list[i].link) {
            html += '<li class="item">' + data.list[i].name + '<a class="link" href="' + data.list[i].link + '">&#8674;</a></li>'
        } else {
            html += '<li class="item">' + data.list[i].name + '</li>'
        }
    }
    document.getElementById('small').innerHTML = '<ul>' + html + '</ul>'
};

+function(Bear) {
    var doc = document

    var Island = function() {
        this.large = doc.getElementById('large')
        this.small = doc.getElementById('small')
        this.mini = doc.getElementById('mini')
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
            return fn.apply(context, arguments)
        }
    }
    Island.prototype.init = function() {
        this.large.addEventListener('click', this.proxy(this.handleEvent, this), false)
    }

    var island = new Island()
    island.init()
}(Bear);
