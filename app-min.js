var Bear = {};

Bear.Utils = (function() {
    var obj = {}

    obj.getJSONP = function(url, success) {
        var doc = document

        var script = doc.createElement('script')
        //var callbackName = "jsonp" + (new Date).getTime()
        var callbackName = "jsonp10000000"
        script.type = "text/javascript"
        script.src = url + '&callback=' + callbackName

        window[callbackName] = function(data) {
            success && success(data)
        }

        var destroy = function() {
            try {
                delete window[callbackName]
            } catch (err) {
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

        doc.getElementsByTagName("head")[0].appendChild(script)
    }

    obj.getHandledTargetByClassName = function(currentTarget, target, className) {
        while (target.className.indexOf(className) === -1) {
            target = target.parentNode
            if (target == currentTarget) {
                break
            }
        }
        return target
    }

    obj.proxy = function(fn, context) {
        return function(event) {
            return fn.apply(context, arguments)
        }
    }

    return obj
})();

+function(Bear) {
    var Island = function() {
        this.data = null

        this.init()
    }

    Island.prototype.init = function() {
        this.large  = document.getElementById('large')
        this.filter = document.getElementById('filter')
        this.small  = document.getElementById('small')
        this.mini   = document.getElementById('mini')

        this.large.addEventListener('click',  Bear.Utils.proxy(this.handleEvent, this), false)
        this.filter.addEventListener('click', Bear.Utils.proxy(this.handleEvent, this), false)
        this.small.addEventListener('click',  Bear.Utils.proxy(this.handleEvent, this), false)
    }

    Island.prototype.handleEvent = function(event) {
        var currentTarget = event.currentTarget
        var target = event.target

        switch (currentTarget.id) {
            case 'large':
                var handledTarget = Bear.Utils.getHandledTargetByClassName(currentTarget, target, 'item')
                Bear.Utils.getJSONP('data/' + handledTarget.getAttribute('data-id') + '.js?', Bear.Utils.proxy(this.jsonpCallback, this))
                break
            case 'filter':
                var handledTarget = Bear.Utils.getHandledTargetByClassName(currentTarget, target, 'item')
                var smallHTML = this.getSmallHTML(this.data, handledTarget.getAttribute('data-key'), handledTarget.getAttribute('data-value'))
                smallHTML && (this.small.innerHTML = '<ul>' + smallHTML + '</ul>')
                break
            case 'small':
                var handledTarget = Bear.Utils.getHandledTargetByClassName(currentTarget, target, 'item')
                var tagid = handledTarget.getAttribute('data-id')
                if (tagid) {
                    this.small.setAttribute('data-currentid', tagid)
                    Bear.Utils.getJSONP('data/article' + (Math.floor(tagid / 20) * 20 + 20) + '.js?', Bear.Utils.proxy(this.jsonpCallback, this)) 
                }
                break
        }
    }

    Island.prototype.getSmallHTML = function(data, key, value) {
        var html = ''
        var part = ''

        for (var i = 0, l = data.list.length; i < l; i++) {
            var current = data.list[i]

            part += '<li class="item'
            part += current.picture ? ' hasPicture' : ''
            part += current.hasArticle ? ' hasArticle" data-id="' + current.id : ''
            part += '">'
            part += current.picture ? '<div class="wrap"><img class="picture" src="' + current.picture + '"><span class="name">' : ''
            part += current.name
            part += current.picture ? '</span></div>' : ''
            part += current.link ? '<a class="link" href="' + current.link + '" target="_blank">&#8611;</a>' : ''
            part += '</li>'

            if (key && value && current[key] != value) {
                part = ''
            }

            html += part
            part = ''           
        }
        
        return html
    }

    Island.prototype.getPictureHTML = function(content) {
        return '<article class="module module-picture"><img class="picture" src="' + content + '"></article>'
    }

    Island.prototype.getProgressHTML = function(content) {
        var parts = content
        var partsHTML = ''

        for (var i = 0, len = parts.length; i < len; i++) {
            var episodes = parts[i].episodes
            var episodesHTML = ''

            for (var j = 0, max = episodes.length; j < max; j++) {
                if (episodes[j].indexOf('done') != -1) {
                    episodesHTML += '<li class="done">' + episodes[j].split('|')[0] + '</li>'
                } else {
                    episodesHTML += '<li>' + episodes[j] + '</li>'
                }
            }
            
            episodesHTML = '<ul>' + episodesHTML + '</ul>'
            episodesHTML = (parts[i].name ? '<h2>' + parts[i].name + '</h2>' : '') + episodesHTML
            partsHTML += episodesHTML
        }

        return '<article class="module module-progress">' +partsHTML + '</article>'

    }

    Island.prototype.jsonpCallback = function(data) {
        if (data.type == 'post') {
            var currentid = this.small.getAttribute('data-currentid')
            for (var i = 0, l = data.list.length; i < l; i++) {
                if (data.list[i].tagid == currentid) {
                    var articles = data.list[i].article
                    var html = ''
                    for (var i = 0, l = articles.length; i < l; i++) {
                        switch (articles[i].type) {
                            case 'picture':
                                html += this.getPictureHTML(articles[i].content)
                                break
                            case 'progress':
                                html += this.getProgressHTML(articles[i].content)
                                break
                        }
                    }
                    this.mini.innerHTML = html 
                    break
                }
            }
        } else {
            var smallHTML = this.getSmallHTML(data, null, null)
            var filterHTML = ''

            if (data.filter) {
                if (data.filter.area) {
                    for (var i = 0, l = data.filter.area.length; i < l; i++) {
                        filterHTML += '<li class="item" data-key="area" data-value="' + data.filter.area[i] + '">' + data.filter.area[i] + '</li>'
                    }
                }
                if (data.filter.hasArticle) {
                    filterHTML += '<li class="item" data-key="hasArticle" data-value="1">有发表</li>'
                }
            }

            this.filter.innerHTML = filterHTML ? '<ul>' + filterHTML + '</ul>' : ''
            this.small.innerHTML  = smallHTML  ? '<ul>' + smallHTML  + '</ul>' : ''

            this.data = data
        }
    }

    Bear.island = function(element) {
        if (!element.island) {
            element.island = new Island()
        }
        return element.island
    }
}(Bear);

Bear.island(document.getElementById('loveandpeace'))
