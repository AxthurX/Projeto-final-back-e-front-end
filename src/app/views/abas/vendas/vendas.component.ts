import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetButton,
  ActionSheetController,
  ModalController,
} from '@ionic/angular';
import { OperacaoSaidaUtil } from 'src/app/core/model/operacao-saida-util.model';
import { OperacaoSaida } from 'src/app/core/model/operacao-saida.model';
import { Util } from 'src/app/core/util.model';
import { DetalhesComponent } from './detalhes/detalhes.component';
import { IonContent } from '@ionic/angular';
import { OverlayService } from 'src/app/core/service/overlay.service';
import { DataBaseProvider } from 'src/app/core/service/database';

@Component({
  selector: 'app-vendas',
  templateUrl: './vendas.component.html',
  styleUrls: ['./vendas.component.scss'],
})
export class VendasComponent implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  nenhuma_venda_localizada: boolean = false;
  consultando: boolean;
  sincronizando: boolean;
  vendas: OperacaoSaida[] = [];
  constructor(
    private actionSheetController: ActionSheetController,
    private dados: DataBaseProvider,
    private overlay: OverlayService,
    private modal: ModalController,
    private router: Router
  ) {
    this.consultando = false;
    this.sincronizando = false;
    this.vendas = [];
  }

  onForcarConsultarNovamente() {
    this.limparConsultas();
    this.OnConsultar();
  }

  limparConsultas() {
    this.vendas = [];
  }

  doRefresh(event) {
    event.target.complete();
    this.limparConsultas();
    this.OnConsultar();
  }

  ngOnInit() {
    this.OnConsultar();
  }

  async OnConsultar() {
    setTimeout(() => {
      try {
        this.nenhuma_venda_localizada = false;
        // this.dados
        //   .getVendas(this.limit, offSet, apenas_vendas, apenas_sincronizadas)
        //   .then((vendas) => {
        //     if (vendas?.length > 0) {
        //       vendas.forEach((v) => OperacaoSaidaUtil.PreecherDadosJson(v));

        //       vendas
        //         .filter((c) => !c.id_nuvem)
        //         .forEach((v) => {
        //           this.vendas.push(v);
        //         });
        //       vendas
        //         .filter((c) => c.id_nuvem)
        //         .forEach((s) => {
        //           this.sincronizados.push(s);
        //         });
        //     } else {
        //       this.nenhuma_venda_localizada = true;
        //     }
        //     this.consultando = false;

        //     if (this.abaSelecionada === 'vendas') {
        //       this.offSet_vendas += this.limit;
        //     } else {
        //       this.offSet_sincronizadas += this.limit;
        //     }
        //   })
        //   .catch((err) => {
        //     this.consultando = false;
        //   });
      } catch (e) {
        this.consultando = false;
      }
    }, 500);
  }

  async mostrarOpcoesVenda(venda: OperacaoSaida, index: number) {
    const tipoVenda = OperacaoSaidaUtil.GetTipoVenda(venda.dados_json.pedido);

    const buttons: ActionSheetButton[] = [];
    buttons.push({
      text: 'Copiar',
      icon: 'copy',
      handler: () => {
        this.AbrirTelaVenda(venda, true);
      },
    });

    buttons.push({
      text: 'Imprimir',
      icon: 'print',
      handler: async () => {
        const modal = await this.modal.create({
          component: DetalhesComponent,
          componentProps: {
            venda,
          },
        });

        await modal.present();
      },
    });

    //nao ta sincronizado
    if (!venda.id_nuvem && !venda?.dados_json?.status_manipulacao) {
      buttons.push({
        text: 'Reabrir',
        icon: 'pencil',
        handler: () => {
          this.AbrirTelaVenda(venda);
        },
      });

      buttons.push({
        text: 'Excluir',
        icon: 'trash',
        handler: () => {
          Util.Confirm('Excluindo ' + tipoVenda, async () => {
            try {
              this.dados
                .excluirVenda(venda.id)
                .then(() => {
                  this.overlay.notificarSucesso(
                    tipoVenda + ' excluído com sucesso!'
                  );
                  this.vendas.splice(index, 1);
                })
                .catch((e) => {
                  Util.TratarErroEFecharLoading(e, this.overlay);
                });
            } catch (e) {
              Util.TratarErroEFecharLoading(e, this.overlay);
            }
          });
        },
      });
    }

    buttons.push({
      text: 'Voltar',
      icon: 'close',
      role: 'cancel',
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'Opções do ' + tipoVenda,
      mode: 'ios',
      buttons,
    });
    await actionSheet.present();
  }

  AbrirTelaVenda(objVenda?: OperacaoSaida, copiando?: boolean) {
    let id_venda: number = null;
    let acao = 'novo';
    if (objVenda) {
      id_venda = objVenda.id;
      if (copiando === true) {
        acao = 'copiando';
      } else {
        acao = 'editando';
      }
    }

    this.router.navigate(['home/vendas/tela-venda', { id_venda, acao }]);
  }
}
