var topolr = require("topolr-util");

var dom = function () {
};
dom.regs = {
    root: /^(?:body|html)$/i,
    _class: /^\.([\w-]+)$/,
    _id: /^#([\w-]*)$/,
    _tag: /^[\w-]+$/,
    _html: /^\s*<(\w+|!)[^>]*>/,
    _tagName: /<([\w:]+)/,
    _property: /-+(.)?/g,
    _prop: /.*\[.+\]/g
};
dom.util = {
    isClass: function (selector) {
        return dom.regs._class.test(selector);
    },
    isId: function (selector) {
        return dom.regs._id.test(selector);
    },
    isTag: function (selector) {
        return dom.regs._tag.test(selector);
    },
    isProp: function (selector) {
        return dom.regs._prop.test(selector);
    },
    isHTML: function (selector) {
        return dom.regs._html.test(selector);
    },
    getDocument: function (temp) {
        var nodet = node.parse(temp?("<document>"+temp+"</document>"):"<document><html><head><title>topolr</title></head><body></body></html></document>")[0];
        nodet.head = nodet.childNodes[0].childNodes[0];
        nodet.body = nodet.childNodes[0].childNodes[1];
        var d = new doc();
        var keys = Object.keys(nodet);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            d[key] = nodet[key];
        }
        return d;
    },
    dataset:function(node){
        for(var i in node.props){
            if(i.indexOf("data-")===0){
                var name=i.substring(5).replace(/-[a-z]+/g,function(a){return a[1].toUpperCase()+a.substring(2)});
                node.dataset[name]=node.props[i];
            }
        }
        for(var i in node.dataset){
            var name="data-"+i.replace(/[A-Z]/g,function(a){return "-"+a.toLowerCase()});
            node.props[name]=node.dataset[i];
        }
    }
};

var event = function (type, data) {
    this.currentTarget = null;
    this.target = null;
    this.timeStamp = new Date().getTime();
    this.type = type;
    this.cancelable = false;
    this._stop = false;
    this.data = data;
};
event.prototype.stopPropagation = function () {
    this._stop = true;
};
event.prototype.preventDefault = function () {
    this.cancelable = true;
};
event.prototype.initEvent = function (type) {
    this.type = type;
};
event.prototype.initUIEvents = function (type) {
    this.type = type;
};
event.prototype.initMutationEvent = function (type) {
    this.type = type;
};
event.prototype.initMouseEvent = function (type) {
    this.type = type;
}

var classlist = function (node) {
    this._node = node;
};
classlist.prototype.add = function (a) {
    var m=this._node.getAttribute("class")||"";
    var t = m.split(" ");
    if(t.indexOf(a)===-1) {
        t.push(a);
        this._node.setAttribute("class", t.join(" "));
    }
};
classlist.prototype.remove = function (a) {
    var m=this._node.getAttribute("class")||"";
    var _list = m.split(" ");
    var t = _list.indexOf(a);
    if (t !== -1) {
        _list.splice(t, 1);
        this._node.setAttribute("class", _list.join(" "));
    }
};
classlist.prototype.toggle = function (a) {
    var m=this._node.getAttribute("class")||"";
    var _list = m.split(" ");
    var t = _list.indexOf(a);
    if (t !== -1) {
        _list.splice(t, 1);
    } else {
        _list.push(a);
    }
    this._node.setAttribute("class", _list.join(" "));
};
classlist.prototype.contains=function(key){
    var m=this._node.getAttribute("class")||"";
    var _list = m.split(" ");
    return _list.indexOf(key)!==-1;
};

var tnode = function (content, parent) {
    this.content = content;
    this.parentNode = parent;
    this.isElement = false;
    this.nodeType = 3;
    this.nodeName = "TEXT";
};
tnode.prototype._getStr = function () {
    return this.content;
};
tnode.prototype.innerText = function () {
    return this.content;
};

var node = function (tag, props) {
    this.tag = tag || "";
    this.props = props || {};
    this.hasProp = false;
    this.isElement = true;
    this.tagName = this.tag;
    this.childNodes = [];
    this.nodeType = 1;
    this.parentNode = null;
    this.nodeName = this.tag.toUpperCase();
    this.attributes = this.props;
    this.classList = new classlist(this);
    this.style = {
        cssText: ""
    };
    this.dataset={};
    this.eventlistener = {};
    this._afterchange();
};
node.isDoctype = /\<\!DOCTYPE[\s\S]*?\>/g;
node.isNote = /\<\!\-\-[\s\S]*?\-\-\>/g;
node.isXmlTag = /\<\?[\s\S]*?\?\>/g;
node.filter = function (str) {
    str = str.trim();
    return str.replace(node.isNote, "").replace(node.isDoctype, "").replace(node.isXmlTag, "");
};
node.repairTag=function (str) {
    var tags=["br","hr","img","input","param","link","meta","area","base","basefont","param","col","frame","embed","keygen","source"];
    for(var i=0;i<tags.length;i++){
        var reg=new RegExp("<"+tags[i]+" .*?>","g");
        str=str.replace(reg,function (a) {
            return a.substring(0,a.length-1)+"/>";
        })
    }
    return str;
};
node.parse = function (str) {
    if (str && str !== "") {
        str=node.repairTag(str);
        str = node.filter(str);
        var stacks = [], nodes = [], current = null;
        var tagname = "", tagendname = "", propname = "", value = "", text = "";
        var tagnamestart = false, propstart = false, valuestart = false, tagendstart = false, element = false;
        for (var i = 0, len = str.length; i < len; i++) {
            var a = str[i];
            if (a !== "\r" && a !== "\n") {
                if (a === "<") {
                    element = true;
                    if (text.trim() !== "") {
                        current = new tnode(text.trim(), stacks[stacks.length - 1] || null);
                        if (stacks[stacks.length - 1]) {
                            stacks[stacks.length - 1].childNodes.push(current);
                        } else {
                            nodes.push(current);
                        }
                        text = "";
                    }
                    if (str[i + 1] && str[i + 1] === "/") {
                        tagendstart = true;
                    } else {
                        current = new node();
                        stacks.push(current);
                        if (stacks.length - 2 >= 0) {
                            stacks[stacks.length - 2].childNodes.push(current);
                            current.parentNode = stacks[stacks.length - 2];
                        }
                        tagnamestart = true;
                    }
                    continue;
                } else if (a === " ") {
                    if (element) {
                        if (tagnamestart) {
                            tagnamestart = false;
                            current.tag = tagname.trim();
                            tagname = "";
                        }
                        if (!propstart && !valuestart) {
                            propstart = true;
                            continue;
                        }
                    }
                } else if (a === "=") {
                    element && (propstart = false);
                } else if (a === "'" || a === "\"") {
                    if (!valuestart && element) {
                        valuestart = a;
                        continue;
                    } else {
                        if (valuestart === a) {
                            valuestart = false, current.hasProp = true;
                            current.props[propname.trim()] = value.trim();
                            propname = "", value = "";
                        }
                    }
                } else if (a === ">") {
                    element = false, propstart = false, valuestart = false, tagnamestart = false;
                    if (tagendstart) {
                        tagendstart = false, tagendname = "";
                        stacks.length === 1 && (nodes.push(stacks[0]));
                        stacks.pop();
                    }
                    if (!current.hasProp) {
                        current.tag === "" && (current.tag = tagname.trim());
                        tagname = "";
                    }
                    continue;
                } else if (a === "/") {
                    if (str[i + 1] && str[i + 1] === ">") {
                        element = false, valuestart = false, propstart = false, tagendstart = false, tagnamestart = false, tagendname = "";
                        if (stacks.length === 1) {
                            nodes.push(stacks[0]);
                        }
                        if (!current.hasProp) {
                            current.tag === "" && (current.tag = tagname.trim());
                            tagname = "";
                        }
                        stacks.pop();
                    } else {
                        if(!element){
                            text+=a;
                        }else{
                            valuestart && (value += a);
                        }
                        // !element && (text += a);
                    }
                    continue;
                }
                tagnamestart && (tagname += a);
                propstart && (propname += a);
                valuestart && (value += a);
                tagendstart && (tagendname += a);
                !element && (text += a);
            }
        }
        if (text.trim()) {
            nodes.push(new tnode(text, null));
        }
        for (var i = 0; i < nodes.length; i++) {
            // nodes[i]._afterchange();
        }
        return nodes;
    } else {
        return [];
    }
};
node.scan = function (nodet, fn) {
    if (nodet) {
        if (nodet.childNodes && nodet.childNodes.length > 0) {
            for (var i = 0, len = nodet.childNodes.length; i < len; i++) {
                var nx=nodet.childNodes[i];
                if(nx&&nx.nodeType===1) {
                    var m = fn && fn(nx);
                    if (m !== false) {
                        node.scan(nx, fn);
                    }
                }
            }
        }
    }
};
node.prototype._getStr = function () {
    var m = this.style.cssText;
    if (m) {
        var _a = m.split(";");
        for (var i = 0; i < _a.length; i++) {
            if (_a[i] && _a[i] !== "undefined") {
                var _b = _a[i].split(":");
                this.style[_b[0].replace(/-[a-z]+/g, function (a) {
                    return a[1].toUpperCase() + a.substring(2);
                })] = _b[1];
            }
        }
    }
    var c = "";
    for (var i in this.style) {
        if (i !== "cssText" && this.style[i]) {
            c += i.replace(/[A-Z]/g, function (a) {
                    return "-" + a.toLowerCase()
                }) + ":" + this.style[i] + ";";
        }
    }
    this.props.style = c;
    var str = "<" + this.tag;
    if (this.props) {
        for (var i in this.props) {
            if(this.props[i]){
                if(i==="find"||i==="group"||i==="groupi"){
                    str += " data-" + i + "=\"" + this.props[i] + "\"";
                }else{
                    str += " " + i + "=\"" + this.props[i] + "\"";
                }
            }
        }
    }
    if(this.childNodes.length>0){
        str += ">";
    }
    for (var i = 0; i < this.childNodes.length; i++) {
        if(this.childNodes[i]){
            str += this.childNodes[i]._getStr();
        }else{
            console.log("=>"+this.childNodes[i]);
        }
    }
    if (this.childNodes.length<=0) {
        str += "/>";
    } else {
        str += "</" + this.tag + ">";
    }
    return str;
};
node.prototype._hasProp = function (key, value) {
    if(value) {
        return this.props[key] === value;
    }else{
        return this.props[key]!==undefined;
    }
};
node.prototype._getElementByProp = function (selector) {
    var r = [];
    var a = selector.split(/\[|\]/);
    var tag = a[0], prop = a[1], propName = "", propValue = "";
    var b = prop.split("=");
    propName = b[0];
    if (b.length > 1) {
        propValue = b[1].substring(1, b[1].length - 1);
    }
    node.scan(this, function (an) {
        dom.util.dataset(an);
        if (tag&&tag!=="*") {
            if (an.tag === tag && an._hasProp(propName, propValue)) {
                r.push(an);
            }
        } else {
            if (an._hasProp(propName, propValue)) {
                r.push(an);
            }
        }
    });
    return r;
};
node.prototype._afterchange = function () {
    this.firstChild = this.childNodes[0];
    this.previousSibling = null;
    this.nextSibling = null;
    if (this.parentNode) {
        var a = this.parentNode.childNodes.indexOf(this);
        if (a !== -1) {
            if (a > 0) {
                this.previousSibling = this.parentNode.childNodes[a - 1];
            }
            if (a < this.parentNode.childNodes.length - 1) {
                this.nextSibling = this.parentNode.childNodes[a + 1];
            }
        }
    }
    var b = [];
    for (var i = 0; i < this.childNodes.length; i++) {
        if (this.childNodes[i]&&this.childNodes[i].isElement) {
            b.push(this.childNodes[i]);
        }
    }

    var t = this.props["style"];
    if (t) {
        var b = t.split(";");
        for (var i = 0; i < b.length; i++) {
            var c = b[i].split(":");
            this.style[c[0].replace(/-[a-z]+/g, function (a) {
                return a[1].toUpperCase() + a.substring(2);
            })] = c[1];
        }
    }
    this.style = {
        cssText: this.props["style"]
    };
    this.children = b;
    dom.util.dataset(this);
};
node.prototype.scrollTop = 0;
node.prototype.scrollY = 0;
node.prototype.scrollLeft = 0;
node.prototype.scrollX = 0;
node.prototype.getAttribute = function (key) {
    dom.util.dataset(this);
    return this.props[key];
};
node.prototype.setAttribute = function (key, value) {
    this.props[key] = value;
    dom.util.dataset(this);
};
node.prototype.removeAttribute=function(key){
    if(this.props[key]){
        delete this.props[key];
        if(key.indexOf("data-")===0){
            var a=key.substring(5);
            if(this.dataset[a]){
                delete this.dataset[a];
            }
        }
        dom.util.dataset(this);
    }
};
node.prototype.getBoundingClientRect = function () {
    return {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };
};
node.prototype.getElementsByClassName = function (selector) {
    var r = [];
    node.scan(this, function (a) {
        if (a.isElement) {
            var q = a.getAttribute("class");
            var m = q ? q.split(" ") : [];
            if (m.indexOf(selector) !== -1) {
                r.push(a);
            }
        }
    });
    return r;
};
node.prototype.getElementsByTagName = function (selector) {
    var r = [];
    node.scan(this, function (a) {
        if(a){
            if (a.isElement) {
                if (a.tag === selector) {
                    r.push(a);
                }
            }
        }
    });
    return r;
};
node.prototype.getElementById = function (selector) {
    var r = [];
    node.scan(this, function (a) {
        if (a.isElement) {
            var q = a.getAttribute("id");
            if (q === selector) {
                r.push(a);
            }
        }
    });
    return r;
};
node.prototype.querySelectorAll = function (selector) {
    if (dom.util.isId(selector)) {
        return this.getElementById(selector.substring(1));
    } else if (dom.util.isClass(selector)) {
        return this.getElementsByClassName(selector.substring(1));
    } else if (dom.util.isTag(selector)) {
        return this.getElementsByTagName(selector);
    } else{
        return this._getElementByProp(selector);
    }
};
node.prototype.cloneNode = function () {
    var t = new node(this.tag, this.props);
    topolr.extend(t, this);
    return t;
};
node.prototype.contains = function (nodet) {
    var has = false;
    node.scan(this, function (a) {
        if (a === nodet) {
            has = true;
            return false;
        }
    });
    return has;
};
node.prototype.appendChild = function (child) {
    if (child.tag === "fragment") {
        for (var i = 0; i < child.childNodes.length; i++) {
            child.childNodes[i].parentNode = this;
            this.childNodes.push(child.childNodes[i]);
        }
    } else {
        child.parentNode = this;
        this.childNodes.push(child);
    }
    this._afterchange();
    return child;
}
node.prototype.replaceChild = function (newnode, oldnode) {
    var t = this.childNodes.indexOf(oldnode);
    if (t !== -1) {
        this.childNodes.splice(t, 1, newnode);
    }
    newnode.parentNode = this;
    this._afterchange();
    return oldnode;
};
node.prototype.removeChild = function (node) {
    var t = this.childNodes.indexOf(node);
    if (t !== -1) {
        this.childNodes.splice(t, 1);
    }
    this._afterchange();
    return node;
};
node.prototype.insertBefore = function (newItem, existingItem) {
    var t = this.childNodes.indexOf(existingItem);
    if (t !== -1) {
        if (t > 0) {
            this.childNodes.splice(t - 1, 0, newItem);
        } else {
            this.childNodes.splice(0, 0, newItem);
        }
        newItem.parentNode = this;
    }
    this._afterchange();
    return newItem;
};
node.prototype.addEventListener = function (type, fn) {
    if (!this.eventlistener[type]) {
        this.eventlistener[type] = [];
    }
    this.eventlistener[type].push(fn);
};
node.prototype.removeEventListener = function (type, fn) {
    if (this.eventlistener[type]) {
        var a = this.eventlistener[type].indexOf(fn);
        if (a !== -1) {
            this.eventlistener[type].splice(a, 1);
        }
    }
};
node.prototype.dispatchEvent = function (event) {
    var _parent = this;
    event.target = this;
    var type = event.type;
    while (_parent) {
        event.currentTarget = _parent;
        if (_parent.eventlistener && _parent.eventlistener[type]) {
            var events = _parent.eventlistener[type];
            for (var i in events) {
                events[i].call(_parent, event);
            }
        }
        if (event._stop) {
            break;
        }
        _parent = _parent.parentNode;
    }
};
Object.defineProperty(node.prototype,"innerHTML", {
    enumerable: true,
    configurable: true,
    get: function() {
        var t = "";
        for (var i = 0; i < this.childNodes.length; i++) {
            if(this.childNodes[i]){
                t += this.childNodes[i]._getStr();
            }
        }
        return t;
    },
    set: function(str) {
        var t=node.parse(str);
        for(var i=0;i<t.length;i++){
            t[i].parentNode=this;
        }
        this.childNodes = t;
        this._afterchange();
    }
});
Object.defineProperty(node.prototype,"innerText", {
    enumerable: true,
    configurable: true,
    get: function() {
        var str = "";
        this.scan(this, function (a) {
            if (a.nodeType === 3) {
                str += a._getStr();
            }
        });
        return str;
    },
    set: function(str) {
        var t=new tnode(str,this);
        this.childNodes = [t];
        this._afterchange();
    }
});

var doc = function () {
    this.readyState = "complete";
};
doc.prototype = new node();
doc.prototype.createElement = function (tag) {
    var a=new node(tag, {});
    if(tag==="img"){
        setTimeout(function () {
            a.dispatchEvent(new event("load"));
        },0);
    }
    if(tag==="link"){
        setTimeout(function () {
            a.sheet={cssRules:[0]};
            a.dispatchEvent("load");
        },0);
    }
    return a;
};
doc.prototype.createDocumentFragment = function () {
    return new node("fragment");
}
doc.prototype.createEvent = function () {
    return new event("");
};
doc.prototype.createTextNode=function (content) {
    return new tnode(content);
}

module.exports=function (temp) {
    return dom.util.getDocument(temp);
};