import { expect } from 'chai';
import FlairClient from '../../src/client';

describe('FlairClient#ts', () => {
  let client;
  beforeEach(() => {
    client = new FlairClient();
  });

  it('keeps strings unless necessary', () => {
    const ts = client.ts('some.scope', {
      key: 'value'
    });
    expect(ts.key).to.eql('value');
  });

  it('supports variables and returns functions in such case', () => {
    const ts = client.ts('some.scope', {
      key: 'Hello {who}'
    });
    expect(ts.key({ who: 'world' })).to.eql('Hello world');
    expect(ts.key.toString()).to.eql('Hello {who}');
  });
});
