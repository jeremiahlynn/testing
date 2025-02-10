import { Component, effect } from '@angular/core';
import {
    SpiToasterComponent,
    SpiRouterComponent,
    SpiOutletComponent,
    SpiAuthenticationService,
    SpiToasterService,
} from '@spi-library';
import { Logger } from 'projects/spi-library/shared/admin-sdk/dummy-plug';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {} from '@fortawesome/free-regular-svg-icons';
import { faKey } from '@fortawesome/free-solid-svg-icons';

import { DocumentService } from './services/document.service';
import { HomePage } from './pages/home/home.component';
import { YearbookPage } from './pages/yearbook/yearbook.component';
import { ImagesPage } from './pages/images/images.component';
import { CaptionsPage } from './pages/captions/captions.component';
import { DesignsPage } from './pages/designs/designs.component';
import { IndexPage } from './pages/index/index.component';
import { PortraitsPage } from './pages/portraits/portraits.component';
import { PreflightPage } from './pages/preflight/preflight.component';
import { QuickCropPage } from './pages/quickcrop/quickcrop.component';

@Component({
    standalone: true,
    imports: [
        HomePage,
        ImagesPage,
        CaptionsPage,
        DesignsPage,
        IndexPage,
        PortraitsPage,
        PreflightPage,
        QuickCropPage,
        SpiToasterComponent,
        SpiRouterComponent,
        SpiOutletComponent,
        YearbookPage,
        FontAwesomeModule,
    ],
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent {
    public keyIcon = faKey;
    // RYAN: to show the above icon, use this html<fa-icon [icon]="keyIcon" [fixedWidth]="true"/>

    constructor(
        authService: SpiAuthenticationService,
        toaster: SpiToasterService,
        private docService: DocumentService
    ) {
        authService.setLogger(Logger.Console(Logger.NONE));
        effect(() => {
            const document = this.docService.state();
            if (document) {
                toaster.info(`Document ${document.name} has been opened`, {
                    duration: 3,
                });
            }
        });
    }
}
