import { Component, Input } from '@angular/core';
import { OperacaoSaidaUtil } from '../../model/operacao-saida-util.model';
import { OperacaoSaidaJson } from '../../model/operacao-saida.model';

@Component({
  selector: 'app-cabecalho-venda',
  templateUrl: './cabecalho-venda.component.html',
  styleUrls: ['./cabecalho-venda.component.scss'],
})
export class CabecalhoVendaComponent {
  @Input() objVenda: OperacaoSaidaJson;
  constructor() {}

  GetTipoVenda(pedido: boolean) {
    return OperacaoSaidaUtil.GetTipoVenda(pedido);
  }

  GetClasse() {
    return this.objVenda.id_nuvem
      ? 'finalizado'
      : this.objVenda.pedido
      ? 'pedido'
      : 'orcamento';
  }

  GetColor(pedido) {
    return !pedido ? 'warning' : 'tertiary';
  }
}