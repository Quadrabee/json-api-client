export default class Driver {
  request(/* params */) {
    throw new Error('Driver#request not implemented');
  }

  get(url, params) {
    return this.request({
      method: 'GET',
      url,
      ...params
    });
  }

  post(url, data, params) {
    return this.request({
      method: 'POST',
      url,
      data,
      ...params
    });
  }

  put(url, data, params) {
    return this.request({
      method: 'PUT',
      url,
      data,
      ...params
    });
  }

  delete(url, data, params) {
    return this.request({
      method: 'DELETE',
      url,
      data,
      ...params
    });
  }

  head(url, params) {
    return this.request({
      method: 'HEAD',
      url,
      ...params
    });
  }
}