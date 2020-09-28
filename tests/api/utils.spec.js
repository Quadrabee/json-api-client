import { expect } from 'chai';
import { ApiUtils } from '../../src/api';

describe('ApiUtils', () => {

  describe('#concat' , () => {
    it('helps concatenating urls', () => {
      expect(ApiUtils.concat('/hello/', '/world')).to.eql('/hello/world');
    });
  });
  describe('#url', () => {
    it('returns an instance of URL', () => {
      expect(ApiUtils.url('http://localhost')).to.be.an.instanceOf(URL);
    });
    it('takes base url as first param and relative url as second', () => {
      const url = ApiUtils.url('http://localhost', '/v1/test/');
      expect(url.pathname).to.be.eql('/v1/test/');
    });
    it('supports var args', () => {
      const url = ApiUtils.url('http://localhost', '/v1/test/', '/subUrl/');
      expect(url.pathname).to.be.eql('/v1/test/subUrl/');
    });
    it('supports URL instances as base Url', () => {
      const baseUrl = ApiUtils.url('http://localhost');
      const fullUrl = ApiUtils.url(baseUrl, '/v1/test/');
      expect(fullUrl.href).to.eql('http://localhost/v1/test/');
    });
  });
  describe('#replaceParams', () => {

    it('Add filter to the self link', async () => {
      const filter = { name: 'test', type: 'Company' };
      const link = 'an/uri/';
      expect(ApiUtils.replaceParams(link, filter)).to.eq(link + '?name=test&type=Company');
    });

    it('Add filter to the self link and delete the params which are in self link', async () => {
      const filter = { name: 'test', type: 'Company' };
      const link = 'an/uri/?q=enspirit';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?name=test&type=Company');
    });

    it('Add filter to the self link when it already exists', async () => {
      const filter = { name: 'test', type: 'Company' };
      const link = 'an/uri/?name=Victor';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?name=test&type=Company');
    });

    it('Not add param to the self link when it\'s only space or empty', async () => {
      const filter = { name: ' ', type: 'Company', value: '' };
      const link = 'an/uri/';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?type=Company');
    });

    it('Delete param in the self link when it not exists in the filter', async () => {
      const filter = { type: 'Company' };
      const link = 'an/uri/?&name=Victor';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?type=Company');
    });

    it('Add value 0 to params is possible', async () => {
      const filter = { type: 'Company', 'page[number]':0 };
      const link = 'an/uri/';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?type=Company&page[number]=0');
    });

    it('Add value false to params is possible', async () => {
      const filter = { type: 'Company', name: false };
      const link = 'an/uri/';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?type=Company&name=false');
    });

    it('Add value null to params is not possible', async () => {
      const filter = { type: 'Company', name: null };
      const link = 'an/uri/';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?type=Company');
    });

    it('Add value undefined to params is not possible', async () => {
      const filter = { type: 'Company', name: undefined };
      const link = 'an/uri/';
      expect(ApiUtils.replaceParams(link, filter)).to.eq('an/uri/?type=Company');
    });
  });
});

