import { Component } from '@angular/core';
import { ColorSchemeService } from './core/color-scheme.service';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { MenuController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Util } from './core/util.model';
import { OverlayService } from './core/service/overlay.service';
import { DataBaseProvider } from './core/service/database';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  versao: string;
  public tema: string;
  constructor(
    protected color: ColorSchemeService,
    protected menuCtrl: MenuController,
    private appVersion: AppVersion,
    private statusBar: StatusBar,
    private platform: Platform,
    protected rota: Router,
    private dbProvider: DataBaseProvider,
    private overlay: OverlayService
  ) {
    this.initializeApp();
    this.color.load();
    try {
      this.appVersion.getVersionNumber().then((versao) => {
        this.versao = versao;
      });
    } catch {}
  }

  initializeApp() {
    try {
      this.platform.ready().then(() => {
        this.color.load();
        this.statusBar.show();
      });
    } catch {}
  }

  alterarTema(tema: string) {
    this.tema = tema;
    if (tema === 'escuro') {
      this.color.update('dark');
      this.color.temaEscuro = true;
    } else {
      this.color.update('light');
      this.color.temaEscuro = false;
    }
  }

  limparAplicativo() {
    Util.Confirm(
      'Isto irá excluir o banco de dados local, você perderá todas informações cadastradas. Esta ação não poderá ser desfeita, confirma?',
      () => {
        Util.EspecificarTexto(
          'Digite "LIMPAR"',
          '',
          (digitou) => {
            if (digitou && digitou.toString() === 'LIMPAR') {
              this.dbProvider
                .dropDB()
                .then(() => {
                  this.dbProvider.createDatabase();
                })
                .catch((e) => {
                  Util.TratarErro(e);
                });
            } else {
              this.overlay.showToast('Ação cancelada', 'warning');
            }
          },
          '',
          'text'
        );
      }
    );
  }
}
