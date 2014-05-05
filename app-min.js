var Bear = {};

Bear.utils = (function(doc) {
    var obj = {}

    obj.jsonp = function(url, callback) {
        var script = document.createElement('script')
        //var callbackName = "jsonp" + (new Date).getTime()
        var callbackName = "jsonp10000000"
        script.type = "text/javascript"
        script.src = url + '&callback=' + callbackName
        window[callbackName] = function(data) {
            callback && callback(data)
        }
        var destroy = function() {
            try {
                delete window[callbackName]
            } catch (a) {
                window[callbackName] = null
            }
            script.parentNode.removeChild(script)
            script = null
        }
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null
                    destroy()
                }
            }
        } else {
            script.onload = function () {
                destroy()
            }
        }
        document.getElementsByTagName("head")[0].appendChild(script)
    }

    return obj
})(document);

+function(Bear, doc) {
    var Island = function() {
        this.data = null

        this.init()
    }

    Island.prototype.init = function() {
        this.large = doc.getElementById('large')
        this.filter = doc.getElementById('filter')
        this.small = doc.getElementById('small')
        this.mini = doc.getElementById('mini')

        this.large.addEventListener('click', this.proxy(this.handleEvent, this), false)
        this.filter.addEventListener('click', this.proxy(this.handleEvent, this), false)
        this.small.addEventListener('click', this.proxy(this.handleEvent, this), false)
    }

    Island.prototype.getCurrentItem = function(event) {
        var target = event.target

        while (target.className.indexOf('item') === -1) {
            target = target.parentNode
            if (target == document.body) {
                break;
            }   
        }

        return target
    }

    Island.prototype.handleEvent = function(event) {
        switch (event.currentTarget.id) {
            case 'large':
                var target = this.getCurrentItem(event)
                if (target.className.indexOf('item') !== -1) {

                    Bear.utils.jsonp('data/' + target.getAttribute('data-id') + '.js?', this.proxy(this.jsonpCallback, this))
                }
                break
            case 'filter':
                var target = this.getCurrentItem(event)
                if (target.className.indexOf('item') !== -1) {
                    var smallHTML = this.getSmallHTML(this.data, target.getAttribute('data-filter'), event.target.innerHTML)
                    smallHTML && (this.small.innerHTML = '<ul>' + smallHTML + '</ul>')
                }
                break
            case 'small':
                var target = this.getCurrentItem(event)
                if (target.className.indexOf('item') !== -1) {
                    var tagid = target.getAttribute('data-id')
                    if (tagid) {
                        this.small.setAttribute('data-currentid', tagid)
                        Bear.utils.jsonp('data/article' + (Math.floor(tagid / 20) * 20 + 20) + '.js?', this.proxy(this.jsonpCallback, this)) 
                    }
                }
                break
        }
    }

    Island.prototype.getSmallHTML = function(data, key, value) {
        var html = ''
        var part = ''

        for (var i = 0, l = data.list.length; i < l; i++) {
            part += '<li class="item'
            part += data.list[i].picture ? ' hasPicture' : ''
            part += data.list[i].hasArticle ? ' hasArticle" data-id="' + data.list[i].id : ''
            part += '">'
            part += data.list[i].picture ? '<img src="' + data.list[i].picture + '">' : ''
            part += data.list[i].name
            part += data.list[i].link ? '<a class="link" href="' + data.list[i].link + '">&#8674;</a>' : ''
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

    Island.prototype.getPictureHTML = function(content) {
        return '<article class="module module-picture"><img class="picture" src="' + content + '"></article>'
    }

    Island.prototype.getProgressHTML = function(content) {
        var subList = content
        var subHTML = ''
        for (var i = 0, len = subList.length; i < len; i++) {
            var subsubList = subList[i].episodes
            var subsubHTML = ''
            for (var j = 0, max = subsubList.length; j < max; j++) {
                if (subsubList[j].indexOf('done') != -1) {
                    subsubHTML += '<li class="done">' + subsubList[j].split('|')[0] + '</li>'
                } else {
                    subsubHTML += '<li>' + subsubList[j] + '</li>'
                }
            }
            
            subsubHTML = '<ul>' + subsubHTML + '</ul>'
            subsubHTML = (subList[i].name ? '<h2>' + subList[i].name + '</h2>' : '') + subsubHTML
            subHTML += subsubHTML
        }
        return '<article class="module module-progress">' +subHTML + '</article>'

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
                                articlesHTML += this.getPictureHTML(articles[i].content)
                                break
                            case 'progress':
                                articlesHTML += this.getProgressHTML(articles[i].content)
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
