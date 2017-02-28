var history = function (window) {
    this._stack = [{
        data: null,
        title: null,
        url: window.location.href
    }];
    this.length = this._stack.length;
    this._window = window;
    this._current = 0;
    this.state = null;
};
history.prototype.pushState = function (data, title, url) {
    this._stack.unshift({
        data: data,
        title: title,
        url: url
    });
    this.length = this._stack.length;
};
history.prototype.replaceState = function (data, title, url) {
    this._stack[0] = {
        data: data,
        title: title,
        url: url
    };
};
history.prototype.go = function (n) {
    var index = this._current + n;
    if (index >= 0 && index < this._stack.length) {
        this._current = index;
        var a = this._stack[index];
        this.state = a.data;
        this._window.location._href = a.url;
        this._window.onpopstate && this._window.onpopstate.call(this, {
            state: a.data,
            title: a.title
        });
    }
};
history.prototype.back = function () {
    this.go(1);
};
history.prototype.forward = function () {
    this.go(-1);
};
history.prototype._add = function (url) {
    this._stack.unshift({
        url: url,
        data: null,
        title: null
    });
    this.go(0);
};
module.exports = function (window) {
    return new history(window);
};