var formdata=function () {
    this._data={};
}
formdata.prototype.append=function (key,value) {
    this._data[key]=value;
    return this;
}
module.exports=formdata;