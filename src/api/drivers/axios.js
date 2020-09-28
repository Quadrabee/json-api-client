import Driver from './driver';
import axios from 'axios';

export default class AxiosDriver extends Driver {

  request({ method, url, data, headers }) {
    return axios({
      method,
      url,
      data,
      headers
    });
  }

}