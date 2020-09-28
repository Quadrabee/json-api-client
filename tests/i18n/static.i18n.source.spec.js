import { expect } from 'chai';
import { I18NStaticSource } from '../../src/i18n';

describe('the I18NStaticSource class', () => {
  let source;
  beforeEach(() => {
    source = new I18NStaticSource({
      'fr-BE': {
        'key': 'valeur',
        'dotted.key': 'valeur.pointée'
      },
      'en-US': {
        'key': 'value',
        'dotted.key': 'dotted.value'
      }
    });
  });

  describe('#load', () => {
    it('returns a Promise', () => {
      const p = source.load('fr-BE');
      expect(p).to.be.an.instanceof(Promise);
    });
    it('provides an array of translation for keys it knows (single key)', (done) => {
      source.load('fr-BE')
        .then((trs) => {
          expect(trs['key']).to.equal('valeur');
          done();
        })
        .catch(done);
    });
  });
});
