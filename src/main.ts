import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AuthService } from './app/services/auth.service';

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    const authService = appRef.injector.get(AuthService);
    authService.restoreSession();
  })
  .catch((err) => console.error(err));
