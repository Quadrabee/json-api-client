import { expect } from 'chai';
import { at, treeNormalize } from '../../src/utils/namespaces';

describe('the at() utility', () => {
  it('returns values according to their path', () => {
    expect(at({ foo: 'bar' }, 'foo')).to.equal('bar');
    expect(at({ foo: { bar: 'baz' } }, 'foo.bar')).to.equal('baz');
  });

  it('returns null for invalid paths', () => {
    expect(at({}, 'foo')).to.equal(null);
    expect(at({}, 'foo.bar')).to.equal(null);
  });
});

describe('the treeNormalize() utility', () => {
  it('returns a different object', () => {
    const obj = {
      foo: {
        bar: {
          baz: 42
        }
      }
    };
    expect(treeNormalize(obj)).not.to.equal(obj);
  });

  it('doesn\'t change objects that don\'t require normalisation', () => {
    const obj = {
      foo: {
        bar: {
          baz: 42
        }
      }
    };
    expect(treeNormalize(obj)).to.deep.equal(obj);
  });

  it('convert dotted keys into a proper hierarchy', () => {
    const obj = {
      'foo.bar.baz': 42
    };
    expect(treeNormalize(obj)).to.deep.equal({
      foo: {
        bar: {
          baz: 42
        }
      }
    });
  });

  it('merges namespaces with common ancestors', () => {
    const obj = {
      'components.search': { foo: 'bar' },
      'components.user': { name: 'alfred' }
    };
    expect(treeNormalize(obj)).to.deep.equal({
      components: {
        search: { foo: 'bar' },
        user: { name: 'alfred' }
      }
    });
  });

  it('supports a mix of dotted keys and proper hierarchy', () => {
    const obj = {
      components: {
        test: 32
      },
      'components.search': { foo: 'bar' },
      'components.user': { name: 'alfred' }
    };
    expect(treeNormalize(obj)).to.deep.equal({
      components: {
        test: 32,
        search: { foo: 'bar' },
        user: { name: 'alfred' }
      }
    });
  });

  it('detects conflicts and raises errors 1/2', () => {
    const obj = {
      components: {
        search: 52
      },
      'components.search': { foo: 'bar' }
    };
    const test = () => treeNormalize(obj);
    expect(test).to.throw(/conflictual paths/);
  });

  it('detects conflicts and raises errors 2/2', () => {
    const obj = {
      components: {
        search: { baz: 52 }
      },
      'components.search': { foo: 'bar' }
    };
    const test = () => treeNormalize(obj);
    expect(test).to.throw(/conflictual paths/);
  });
});
