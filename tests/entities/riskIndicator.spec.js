import { expect } from 'chai';
import { RiskIndicator } from '../../src/entities';

describe('RiskIndicator', () => {

  let yearWithoutNullScore;
  let yearWithNullScore;
  let riskIndicatorJson;

  beforeEach(() => {
    yearWithoutNullScore = {
      data: {
        id: 'an-id',
        type: 'RiskIndicator',
        attributes: {
          name: 'A name',
          history: [{
            year: 2019,
            score: 2
          },
          {
            year: 2018,
            score: 0
          }]
        }
      },
      links: {
        self: '/v1/entities/companies/an-id'
      }
    };

    yearWithNullScore = {
      data: {
        id: 'an-id',
        type: 'RiskIndicator',
        attributes: {
          name: 'A name',
          history: [{
            year: 2019,
            score: 2
          },
          {
            year: 2018,
            score: null
          },
          {
            year: 2017,
            score: 8
          }]
        }
      },
      links: {
        self: '/v1/entities/companies/an-id'
      }
    };

    riskIndicatorJson = {
      data: {
        id: 'an-id',
        type: 'RiskIndicator',
        attributes: {
          name: 'A name',
          history: []
        }
      },
      links: {
        self: '/v1/entities/companies/an-id'
      }
    };
  });

  describe('#getRiskHistory', () => {

    it('returns nothing when the riskIndicator doesn\'t have any history', () => {
      const riskIndicator = new RiskIndicator(riskIndicatorJson);
      const s = riskIndicator.getRiskHistory();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(0);
    });

    it('returns only objects which don\'t have a null score when the riskIndicator has history', () => {
      const riskIndicator = new RiskIndicator(yearWithNullScore);
      const s = riskIndicator.getRiskHistory();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(2);
      expect(s[0].year).to.eq(2019);
      expect(s[0].score).to.eq(2);
      expect(s[1].year).to.eq(2017);
      expect(s[1].score).to.eq(8);
    });

    it('returns the same array when the riskIndicator has history', () => {
      const riskIndicator = new RiskIndicator(yearWithoutNullScore);
      const s = riskIndicator.getRiskHistory();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(2);
      expect(s[0].year).to.eq(2019);
      expect(s[0].score).to.eq(2);
      expect(s[1].year).to.eq(2018);
      expect(s[1].score).to.eq(0);
    });

  });
});
