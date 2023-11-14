import { environment } from 'src/environments/environment';
import { Util } from '../util.model';
import { Subscription } from 'rxjs';
import { AuthService } from '../service/auth.service';

export class ClasseBase {
  carregando: boolean = false;
  utilizando_versao_gratis: boolean = true;
  tentando_salvar: boolean = false;
  $monitoramento_manutencao: Subscription;
  $monitoramento_token: Subscription;
  constructor(public auth: AuthService, public id_tela: number) {}

  habilitarMonitoramentos() {
    this.auth.saiuDoApp$.subscribe({
      next: (r) => this.limparTela(),
      error: (e) => console.error('saiuDoApp', e),
    });

    const guid = this.auth.getGuideInstalacao();
  }

  informarManutencao(
    mostrar: boolean = true,
    ir_tela_inicial: boolean = false
  ) {
    if (mostrar) {
      Util.AlertWarning(
        'Esta tela está em manutenção, por favor tente novamente mais tarde!'
      );
    }

    if (ir_tela_inicial) {
      this.auth.goToHome();
    }
  }

  OnDestroy(): void {
    try {
      this.$monitoramento_manutencao.unsubscribe();
    } catch {}
  }

  TratarErro(e: any) {
    Util.TratarErro(e);
    this.resetarPropriedades();
  }

  limparTela() {}

  resetarPropriedades() {
    this.carregando = false;
    this.tentando_salvar = false;
  }

  Warning(mensagem: string) {
    this.resetarPropriedades();
    Util.AlertWarning(mensagem);
  }

  Success(mensagem: string) {
    this.resetarPropriedades();
    Util.AlertSucess(mensagem);
  }

  Error(mensagem: string) {
    this.resetarPropriedades();
    Util.AlertError(mensagem);
  }

  Info(mensagem: string) {
    this.resetarPropriedades();
    Util.AlertInfo(mensagem);
  }
}