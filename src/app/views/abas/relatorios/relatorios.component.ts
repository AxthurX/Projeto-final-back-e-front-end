import {
  ActionSheetButton,
  ActionSheetController,
  ModalController,
} from '@ionic/angular';
import { Component } from '@angular/core';
import { ClasseBase } from 'src/app/core/model/classe-base.model';
import { AuthService } from '../../../core/service/auth.service';
import { RelatorioEntradaComponent } from './relatorio-entrada/relatorio-entrada.component';
import { RelatorioFinanceiroComponent } from './relatorio-financeiro/relatorio-financeiro.component';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.scss'],
})
export class RelatoriosComponent extends ClasseBase {
  consultando: boolean;
  constructor(
    private actionSheetController: ActionSheetController,
    private modal: ModalController,
    auth: AuthService
  ) {
    super(auth);
    this.consultando = false;
  }

  async mostrarOpcoes() {
    const buttons: ActionSheetButton[] = [];
    buttons.push({
      text: 'Relatório de entrada',
      icon: 'arrow-undo-circle-outline',
      handler: async () => {
        const modal = await this.modal.create({
          component: RelatorioEntradaComponent,
        });

        await modal.present();
      },
    });

    buttons.push({
      text: 'Relatório de financeiro',
      icon: 'arrow-redo-circle-outline',
      handler: async () => {
        const modal = await this.modal.create({
          component: RelatorioFinanceiroComponent,
        });

        await modal.present();
      },
    });

    buttons.push({
      text: 'Voltar',
      icon: 'close',
      role: 'cancel',
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Opções do controle de estoque',
      mode: 'ios',
      buttons,
    });
    await actionSheet.present();
  }
}
