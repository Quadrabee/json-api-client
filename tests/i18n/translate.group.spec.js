import { TranslationGroup } from '../../src/i18n';
import chai from 'chai';
const { expect } = chai;

describe('TranslationGroup', () => {
  it('should not expose any attribute other than the default (top) keys', () => {
    const trs = new TranslationGroup({
      defaults: {
        key1: 'value1',
        key2: 'value2',
        key3: {
          subkey1: 'subvalue1'
        }
      }
    });
    expect(Object.keys(trs)).to.deep.equal(['key1', 'key2', 'key3']);
  });

  it('should expose a getter for the namespace', () => {
    const trs = new TranslationGroup({
      namespace: 'test',
      defaults: {}
    });
    expect(trs.namespace).to.equal('test');
  });

  it('should expose all default values if no translations are set', () => {
    const trs = new TranslationGroup({
      namespace: 'test',
      defaults: {
        key1: 'value1',
        key2: 'value2',
        key3: {
          subkey1: 'subvalue1'
        }
      }
    });
    expect(trs.key1).to.equal('value1');
    expect(trs.key2).to.equal('value2');
    expect(trs.key3.subkey1).to.equal('subvalue1');
  });

  it('should support templated values and provide an instantiator function for it', () => {
    const trs = new TranslationGroup({
      namespace: 'test',
      defaults: {
        tpl: 'Hello {who}!'
      }
    });
    expect(trs.tpl).to.be.an.instanceof(Function);
    expect(trs.tpl.toString()).to.equal('Hello {who}!');
    expect(trs.tpl({ who: 'world' })).to.equal('Hello world!');
  });

  it('should always keep default values when provided with incomplete translations', () => {
    const trs = new TranslationGroup({
      namespace: 'test',
      defaults: {
        key1: 'value1',
        key2: 'value2',
        key3: {
          subkey1: 'subvalue1',
          subkey2: 'subvalue2'
        }
      }
    });

    trs.setTranslations({
      key1: 'new value 1',
      key3: {
        subkey1: 'new subvalue 1'
      }
    });

    // Provided translations
    expect(trs.key1).to.equal('new value 1');
    expect(trs.key3.subkey1).to.equal('new subvalue 1');
    // Missing translations
    expect(trs.key2).to.equal('value2');
    expect(trs.key3.subkey2).to.equal('subvalue2');
  });

  it('should accept additional translations even if no defaults were defined', () => {
    const trs = new TranslationGroup({
      namespace: 'test',
      defaults: {
        key1: 'value1'
      }
    });

    trs.setTranslations({
      key1: 'new value 1',
      key2: 'additional value 2',
      key3: {
        subkey1: 'additional subvalue 1'
      }
    });

    // Provided translations
    expect(trs.key1).to.equal('new value 1');
    // Additional translations
    expect(trs.key2).to.equal('additional value 2');
    expect(trs.key3.subkey1).to.equal('additional subvalue 1');
  });
});
