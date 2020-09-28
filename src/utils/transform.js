import _ from 'lodash';

export const transformToMap = (values, k, v) => {
  return _.chain(values)
    .keyBy(k)
    .mapValues(v)
    .value();
};
