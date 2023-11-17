import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ViewProdutoEmpresa } from 'src/app/core/model/data-base/view-produto-empresa.model';
import { Util } from 'src/app/core/util.model';
import { ProdutoUtil } from 'src/app/core/model/produto-util.model';
import { File } from '@ionic-native/file/ngx';
import { fromEvent, Subscription } from 'rxjs';
import { CabecalhoPesquisaProdutoComponent } from 'src/app/core/components/cabecalho-pesquisa-produto/cabecalho-pesquisa-produto.component';
import { OverlayService } from 'src/app/core/service/overlay.service';
import { DataBaseProvider } from 'src/app/core/service/database';

@Component({
  selector: 'app-consulta-produto',
  templateUrl: './consulta-produto.component.html',
  styleUrls: ['./consulta-produto.component.scss'],
})
export class ConsultaProdutoComponent implements OnInit, OnDestroy {
  @ViewChild('pesquisa') pesquisa;
  cabecalho_parente: CabecalhoPesquisaProdutoComponent;
  registros: ViewProdutoEmpresa[] = [];
  texto_pesquisado: string;
  path_imagens_produtos: string;
  consultando: boolean;
  apenas_consulta: boolean;
  private backbuttonSubscription: Subscription;
  constructor(
    public modal: ModalController,
    private overlay: OverlayService,
    private dbProvider: DataBaseProvider,
    private navParams: NavParams,
    private file: File
  ) {
    this.consultando = false;
    this.apenas_consulta = false;
    this.path_imagens_produtos = Util.GetPathImagens(file);
  }

  ngOnDestroy() {
    this.backbuttonSubscription.unsubscribe();
  }

  async ngOnInit() {
    const event = fromEvent(document, 'backbutton');
    this.backbuttonSubscription = event.subscribe(async () => {
      try {
        this.aplicar();
      } catch {}
    });

    try {
      this.apenas_consulta = this.navParams.data.apenas_consulta;
      this.texto_pesquisado = this.navParams.data.texto_pesquisado;
      this.cabecalho_parente = this.navParams.data.cabecalho;
      if (this.texto_pesquisado || this.navParams.data.filtro_pesquisa) {
        this.onPesquisar(
          this.navParams.data.filtro_pesquisa,
          this.navParams.data.texto_pesquisado
        );
      }

      setTimeout(() => {
        try {
          this.pesquisa.setFocus();
        } catch {}
      }, 500);
    } catch {}
  }

  onPesquisar(filtro_pesquisa: string, texto_pesquisado: string) {
    try {
      texto_pesquisado = texto_pesquisado?.toUpperCase();
      setTimeout(async () => {
        this.consultando = true;
        this.registros = [];

        this.registros = this.dbProvider.teste;
        // await this.dbProvider.getProdutosComPrecoJaCalculado(
        //   filtro_pesquisa,
        //   texto_pesquisado,
        // );

        if (this.registros.length === 0) {
          this.overlay.showToast('Nenhum resultado encontrado', 'light');
        }

        this.registros.forEach((produto) => {
          if (this.cabecalho_parente?.permitir_quantidade_zero === true) {
            produto.quantidade = null;
          }

          //this.carregarImagemProduto(produto);
        });

        const produtosJaAdicionados =
          this.cabecalho_parente?.tela_vendas?.getQuantidadesJaLancadas();

        if (produtosJaAdicionados?.length > 0) {
          produtosJaAdicionados.forEach((lancada) => {
            const pConsulta = this.registros.find(
              (c) => c.id_produto === lancada.id
            );
            if (pConsulta) {
              if (pConsulta.quantidade_adicionada > 0) {
                pConsulta.quantidade_adicionada += lancada.valor;
              } else {
                pConsulta.quantidade_adicionada = lancada.valor;
              }
              pConsulta.quantidade_adicionada = Util.GetValorArredondado(
                pConsulta.quantidade_adicionada,
                3
              );
            }
          });
        }

        this.consultando = false;
      }, 400);
    } catch (e) {
      this.consultando = false;
      Util.TratarErroEFecharLoading(e, this.overlay);
    }
  }

  async carregarImagemProduto(produto: ViewProdutoEmpresa) {
    try {
      const base = await this.file.readAsDataURL(
        this.path_imagens_produtos,
        `${produto.id_produto}_1.png`
      );
      produto.imagem = base;
    } catch {}
  }

  aumentarQuantidade(registro: ViewProdutoEmpresa) {
    if (!registro.quantidade) {
      registro.quantidade = 0;
    }
    registro.quantidade++;
    this.CalcularPrecoETotalBruto(registro);
  }

  onAlterouQuantidadeManualmente(registro: ViewProdutoEmpresa) {
    if (registro.quantidade > 0) {
      this.CalcularPrecoETotalBruto(registro);
    }
  }

  mostrarFoto(registro: ViewProdutoEmpresa) {
    registro.mostrar_foto = !registro.mostrar_foto;
    if (registro.mostrar_foto) {
      this.carregarImagemProduto(registro);
    }
  }

  diminuirQuantidade(registro: ViewProdutoEmpresa) {
    if (!registro.quantidade) {
      registro.quantidade = 0;
    }
    registro.quantidade--;
    this.CalcularPrecoETotalBruto(registro);
    if (registro.quantidade < 0) {
      registro.quantidade = null;
    }
  }

  CalcularPrecoETotalBruto(registro: ViewProdutoEmpresa) {
    ProdutoUtil.CalcularPrecoETotalBruto(
      registro,
      null,
    );
  }

  aplicar() {
    if (this.cabecalho_parente) {
      const aplicar = this.registros.filter(
        (c) =>
          c.quantidade > 0 ||
          // eslint-disable-next-line eqeqeq
          (this.cabecalho_parente.permitir_quantidade_zero && c.quantidade == 0)
      );
      if (aplicar.length === 0) {
        this.overlay.showToast('Nenhuma quantidade foi informada', 'warning');
      } else {
        this.modal.dismiss();
        this.cabecalho_parente.ConsultouProdutos(aplicar);
      }
    } else {
      this.modal.dismiss();
    }
  }

  getFoto(index: number): ViewProdutoEmpresa {
    try {
      return this.registros[index];
    } catch {
      return null;
    }
  }

  getColor(tipo_preco) {
    if (tipo_preco === 'P') {
      return 'success';
    } else if (tipo_preco === 'T') {
      return 'tertiary';
    }
  }
}
