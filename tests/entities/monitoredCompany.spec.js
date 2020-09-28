import { expect } from 'chai';
import { MonitoredCompany } from '../../src/entities';

describe('MonitoredCompany', () => {

  let yearWithoutNullScore;
  let yearWithNullScore;
  let monitoredCompanyJson;

  beforeEach(() => {
    yearWithoutNullScore = {
      data: {
        id: 'an-id',
        type: 'MonitoredCompany',
        attributes: {
          name: 'A name',
          globalHistory: [{
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
        type: 'MonitoredCompany',
        attributes: {
          name: 'A name',
          globalHistory: [{
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

    monitoredCompanyJson = {
      data: {
        id: 'an-id',
        type: 'MonitoredCompany',
        attributes: {
          name: 'A name',
          globalHistory: []
        }
      },
      links: {
        self: '/v1/entities/companies/an-id'
      }
    };
  });

  describe('#getRiskGlobal', () => {

    it('returns nothing when the monitoredCompany doesn\'t have any globalHistory', () => {
      const monitoredCompany = new MonitoredCompany(monitoredCompanyJson);
      const s = monitoredCompany.getRiskGlobal();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(0);
    });

    it('returns only objects which don\'t have a null score when the monitoredCompany has globalHistory', () => {
      const monitoredCompany = new MonitoredCompany(yearWithNullScore);
      const s = monitoredCompany.getRiskGlobal();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(2);
      expect(s[0].year).to.eq(2019);
      expect(s[0].score).to.eq(2);
      expect(s[1].year).to.eq(2017);
      expect(s[1].score).to.eq(8);
    });

    it('returns the same array when the monitoredCompany has globalHistory', () => {
      const monitoredCompany = new MonitoredCompany(yearWithoutNullScore);
      const s = monitoredCompany.getRiskGlobal();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(2);
      expect(s[0].year).to.eq(2019);
      expect(s[0].score).to.eq(2);
      expect(s[1].year).to.eq(2018);
      expect(s[1].score).to.eq(0);
    });

  });
});
