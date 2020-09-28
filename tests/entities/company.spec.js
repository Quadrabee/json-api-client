import { expect } from 'chai';
import { Company, RiskProfile } from '../../src/entities';
import CompanyFull from '../data/companies/Company.Full.json';
describe('Company', () => {

  let yearWithFinancial;
  let yearWithRiskProfile;
  let yearWithoutFinancialAndHistory;
  let companyJson;

  beforeEach(() => {
    yearWithFinancial = {
      year: 2019,
      financial: {
        statementDate: 707048,
        numberOfEmployees: 100
      }
    };

    yearWithRiskProfile = {
      year: 2019,
      riskProfile: {
        attributes: {
          subrisks: [
            {
              attributes: {
                score: 9,
                name: 'financial'
              }
            },
            {
              attributes: {
                score: 3,
                name: 'pep'
              }
            }
          ]
        }
      }
    };

    yearWithoutFinancialAndHistory = {
      year: 2020
    };

    companyJson = {
      data: {
        id: 'an-id',
        type: 'Company',
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

  describe('#hasFinancialHistory', () => {

    it('returns false when the company doesn\'t have any history', () => {
      const company = new Company(companyJson);
      expect(company.hasFinancialHistory()).to.eq(false);
    });

    it('returns false when the company doesn\'t have financial history', () => {
      companyJson.data.attributes.history.push(yearWithoutFinancialAndHistory);
      const company = new Company(companyJson);
      expect(company.hasFinancialHistory()).to.eq(false);
    });

    it('returns true when the company does have financial history', () => {
      companyJson.data.attributes.history.push(yearWithFinancial);
      const company = new Company(companyJson);
      expect(company.hasFinancialHistory()).to.eq(true);
    });

  });

  describe('#hasRiskHistory', () => {

    it('returns false when the company doesn\'t have any history', () => {
      const company = new Company(companyJson);
      expect(company.hasRiskHistory()).to.eq(false);
    });

    it('returns false when the company doesn\'t have riskProfile history', () => {
      companyJson.data.attributes.history.push(yearWithoutFinancialAndHistory);
      const company = new Company(companyJson);
      expect(company.hasRiskHistory()).to.eq(false);
    });

    it('returns true when the company does have financial history', () => {
      companyJson.data.attributes.history.push(yearWithRiskProfile);
      const company = new Company(companyJson);
      expect(company.hasRiskHistory()).to.eq(true);
    });

  });

  describe('#hasFinancialAttribut', () => {

    it('returns false when the history doesn\'t have any financial attribute', () => {
      companyJson.data.attributes.history.push(yearWithoutFinancialAndHistory);
      const company = new Company(companyJson);
      expect(company.hasFinancialAttribut(0)).to.eq(false);

    });

    it('returns true when the history does have financial attribute', () => {
      companyJson.data.attributes.history.push(yearWithFinancial);
      const company = new Company(companyJson);
      expect(company.hasFinancialAttribut(0)).to.eq(true);
    });

  });

  describe('#getFinancialField', () => {

    it('returns undefined when the attribute doesn\'t exist', () => {
      companyJson.data.attributes.history.push(yearWithFinancial);
      const company = new Company(companyJson);
      expect(company.getFinancialField(0, 'statementDates')).to.eq(undefined);
    });

    it('returns value when the attribute exist', () => {
      companyJson.data.attributes.history.push(yearWithFinancial);
      const company = new Company(companyJson);
      expect(company.getFinancialField(0, 'statementDate')).to.eq(707048);
    });

  });

  describe('#getSubrisksHistory', () => {

    it('returns nothing when the company doesn\'t have any history', () => {
      const company = new Company(companyJson);
      const s = company.getSubrisksHistory();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(0);
    });

    it('returns nothing when the company doesn\'t have riskProfile history', () => {
      companyJson.data.attributes.history.push(yearWithoutFinancialAndHistory);
      const company = new Company(companyJson);
      const s = company.getSubrisksHistory();
      expect(s).to.be.instanceOf(Array);
      expect(s).to.have.length(0);
    });

    it('returns an object when the attribute exist', () => {
      companyJson.data.attributes.history.push(yearWithRiskProfile);
      const company = new Company(companyJson);
      const s = company.getSubrisksHistory();
      expect(s).to.be.instanceOf(Array);
      expect(s[0].subrisks['pep']).to.eq(3);
    });

  });

  describe('Company.factor', () => {

    it('returns an instance of company with proper sub Entities', () => {
      const companyFull = Company.factor(CompanyFull);
      expect(companyFull).to.be.an.instanceof(Company);
      expect(companyFull.last.riskProfile).to.be.an.instanceof(RiskProfile);
      expect(companyFull.last.riskProfile.isProxiedEntity).to.eql(true);
      expect(companyFull.last.riskProfile.name).to.eql('global');
      expect(companyFull.last.riskProfile.subrisks).to.be.an.instanceof(Array);
      const subrisk1 = companyFull.last.riskProfile.subrisks[0];
      expect(subrisk1.type).to.be.eql('RiskIndicator');
    });

  });

});
