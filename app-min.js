+function() {
    var doc = document

    var Island = function() {
        this.large = doc.getElementById('large')
        this.small = doc.getElementById('small')
        this.mini = doc.getElementById('mini')
    }
    Island.prototype.getJSON = function(url, callback) {
        var xhr = new XMLHttpRequest()
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
                    callback(xhr.responseText)
                }
            }
        }
        xhr.open('get', url, true)
        xhr.send(null)
    }
    Island.prototype.setSmall = function(data) {
        var html = ''
        for (var i = 0, l = data.list.length; i < l; i++) {
            html += '<li>' + data.list.name + '</li>'
        }
        this.small.innerHTML = '<ul>' + html + '</ul>'
    }
    Island.prototype.getSmall = function(id) {
        this.getJSON('data/' + id + '.json', this.setSmall)
    }
    Island.prototype.handleEvent = function(event) {
        if (event.currentTarget.id == 'large' && event.target.className == 'item') {
            this.getSmall(event.target.getAttribute('data-id'))
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
}();
