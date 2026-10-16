"use strict";

let sourceId = 0;
export const createSourceWrapper = url => {
  return new SourceWrapper(sourceId++, url);
};
class SourceWrapper {
  constructor(id, url) {
    this._id = id;
    this._url = url;
  }
  getId() {
    return this._id;
  }
  getUri() {
    return this._url;
  }
}
//# sourceMappingURL=source.js.map