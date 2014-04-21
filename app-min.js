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
        this.filter = doc.getElementById('filter')
        this.small = doc.getElementById('small')
        this.mini = doc.getElementById('mini')
        this.data = null

        this.init()
    }

    Island.prototype.handleEvent = function(event) {
        if (event.currentTarget.id == 'large' && event.target.className == 'item') {
            Bear.utils.loadScript('data/' + event.target.getAttribute('data-id') + '.js', function(script) {
                script.parentNode.removeChild(script)
                script = null
            })
        } else if (event.currentTarget.id == 'filter' && event.target.className == 'item') {
            var smallHTML = this.getSmallHTML(this.data, event.target.getAttribute('data-filter'), event.target.innerHTML)
            smallHTML && (this.small.innerHTML = '<ul>' + smallHTML + '</ul>')
        } else if (event.currentTarget.id == 'small' && event.target.className == 'item') {
            var tagid = event.target.getAttribute('data-id')
            if (tagid) {
                this.small.setAttribute('data-currentid', tagid)
                Bear.utils.loadScript('data/article' + (Math.floor(tagid / 20) * 20 + 20) + '.js', function(script) {
                    script.parentNode.removeChild(script)
                    script = null
                }) 
            }
        }
    }

    Island.prototype.getSmallHTML = function(data, key, value) {
        var html = ''
        var part = ''

        for (var i = 0, l = data.list.length; i < l; i++) {
            part += '<li class="item"'
            if (data.list[i].id) {
                part += ' data-id="' + data.list[i].id + '"'
            }
            part += '>' + data.list[i].name
            if (data.list[i].link) {
                part += '<a class="link" href="' + data.list[i].link + '">&#8674;</a>'
            }
            part += '</li>'
            if (key && value && data.list[i][key] != value) {
                part = ''
            }
            html += part
            part = ''           
        }
        
        return html
    }

    Island.prototype.proxy = function(fn, context) {
        return function(event) {
            return fn.apply(context, arguments)
        }
    }

    Island.prototype.init = function() {
        this.large.addEventListener('click', this.proxy(this.handleEvent, this), false)
        this.filter.addEventListener('click', this.proxy(this.handleEvent, this), false)
        this.small.addEventListener('click', this.proxy(this.handleEvent, this), false)
    }

    Island.prototype.jsonpCallback = function(data) {
        if (data.type == 'post') {
            var currentid = this.small.getAttribute('data-currentid')
            for (var i = 0, l = data.list.length; i < l; i++) {
                if (data.list[i].tagid == currentid) {
                    var articles = data.list[i].article
                    var articlesHTML = ''
                    for (var i = 0, l = articles.length; i < l; i++) {
                        switch (articles[i].type) {
                            case 'picture':
                                articlesHTML += '<article class="module-picture"><img src="' + articles[i].content + '"></article>'
                                break
                        }
                    }
                    this.mini.innerHTML = articlesHTML
                    break
                }
            }
        } else {
            var smallHTML = this.getSmallHTML(data, null, null)

            var filterHTML = ''
            if (data.filter) {
                if (data.filter.area) {
                    for (var i = 0, l = data.filter.area.length; i < l; i++) {
                        filterHTML += '<li class="item" data-filter="area">' + data.filter.area[i] + '</li>'
                    }
                }
            }

            if (filterHTML) {
                this.filter.innerHTML = '<ul>' + filterHTML + '</ul>'
            } else {
                this.filter.innerHTML = ''
            }
            if (smallHTML) {
                this.small.innerHTML = '<ul>' + smallHTML + '</ul>'
            } else {
                this.small.innerHTML = ''
            }

            this.data = data
        }
    }

    Bear.island = function(element) {
        if (!element.island) {
            element.island = new Island()
        }
        return element.island
    }
}(Bear, document);

Bear.island(document.getElementById('loveandpeace'))
