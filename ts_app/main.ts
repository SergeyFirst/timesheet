import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';

function launch() {
  const platform = platformBrowserDynamic();
  platform.bootstrapModule(AppModule);
}

if (window.hasOwnProperty('Office') 
      //&& window.hasOwnProperty('Mailbox')
      ) {
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

