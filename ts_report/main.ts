import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { ReportModule } from './report.module';

function launch() {
    const platform = platformBrowserDynamic();
    platform.bootstrapModule(ReportModule);
}


if (window.hasOwnProperty('Office') 
        //&& window.hasOwnProperty('Word')
        ) 
                                          {
  Office.initialize = reason => {
      $(document).ready(function () {
            app.initialize();
      });
    launch();
  }
}
else {
  
  launch();
  
}

