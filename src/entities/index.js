import _ from 'lodash';
import { Entity } from '../jsonapi';
import AppInstance from './app-instance';
import Company from './company';
import MediaLink from './mediaLink';
import MonitoredCompany from './monitoredCompany';
import RiskIndicator from './riskIndicator';
import RiskProfile from './riskProfile';
import RiskAnalysis from './riskAnalysis';
import LegalLink from './legal-link';
import Private from './private';
import Person from './person';
import UserProfile from './user-profile';
import Department from './department';
import Team from './team';

const Entities = {
  AppInstance: AppInstance,
  Company: Company,
  Person: Person,
  MediaLink: MediaLink,
  MonitoredCompany: MonitoredCompany,
  RiskIndicator: RiskIndicator,
  RiskProfile: RiskProfile,
  RiskAnalysis: RiskAnalysis,
  LegalLink: LegalLink,
  Private: Private,
  'User.Profile': UserProfile,
  Department: Department,
  Team: Team
};

_.each(Entities, (clazz, name) => Entity.registerType(name, clazz));

export {
  AppInstance,
  Company,
  Person,
  MediaLink,
  MonitoredCompany,
  RiskIndicator,
  RiskProfile,
  RiskAnalysis,
  LegalLink,
  Private,
  UserProfile,
  Department,
  Team
};
