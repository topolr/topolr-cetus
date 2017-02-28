var storage = function () {
    this._value = {};
};
storage.prototype.getItem = function (key) {
    return this._value[key];
};
storage.prototype.setItem = function (key, value) {
    this._value[key] = value;
};
storage.prototype.removeItem = function (key) {
    delete this._value[key];
};

module.exports=storage;