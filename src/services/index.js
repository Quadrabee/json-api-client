import AppService from './app.service';
import AuthenticationService from './authentication.service';
import MyService from './my.service';
import SearchService from './search.service';
import I18NService from './i18n.service';
import EntitiesService from './entities.service';
import TransparencyService from './transparency.service';
import OpenGraphService from './opengraph.service';
import PrintService from './print.service';
import AdminService from './admin.service';
import PortfolioService from './portfolio.service';

export {
  AppService,
  AuthenticationService,
  MyService,
  SearchService,
  I18NService,
  EntitiesService,
  TransparencyService,
  OpenGraphService,
  PrintService,
  AdminService,
  PortfolioService
};

export default {
  createServices: (client) => {
    return {
      AppService: new AppService({ client }),
      AuthenticationService: new AuthenticationService({ client }),
      MyService: new MyService({ client }),
      SearchService: new SearchService({ client }),
      I18NService: new I18NService({ client }),
      EntitiesService: new EntitiesService({ client }),
      TransparencyService: new TransparencyService({ client }),
      OpenGraphService: new OpenGraphService({ client }),
      PrintService: new PrintService({ client }),
      AdminService: new AdminService({ client }),
      PortfolioService: new PortfolioService({ client })
    };
  }
};
