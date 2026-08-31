import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

export interface ScoreRecord {
  intentos: number;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly STORAGE_KEY = 'memorama_perros_scores';
  private _scores: ScoreRecord[] = [];

  constructor() {
    this.cargarStorage();
  }

  /**
   * Getter: Devuelve una copia de la lista ordenada de mejores intentos.
   */
  get scores(): ScoreRecord[] {
    return [...this._scores];
  }

  /**
   * Setter: Ordena los registros de menor a mayor intentos, 
   * conserva solo el Top 5 y guarda en almacenamiento nativo.
   */
  set scores(nuevosScores: ScoreRecord[]) {
    this._scores = nuevosScores
      .sort((a, b) => a.intentos - b.intentos)
      .slice(0, 5);

    this.guardarEnStorage();
  }

  /**
   * Getter: Devuelve la menor cantidad de intentos realizada históricamente.
   */
  get mejorRecord(): number | null {
    return this._scores.length > 0 ? this._scores[0].intentos : null;
  }

  /**
   * Registra una nueva victoria y ejecuta el setter automáticamente.
   */
  public registrarIntento(intentos: number): void {
    const nuevoRegistro: ScoreRecord = {
      intentos,
      fecha: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    // Al asignar a 'this.scores' se dispara el SETTER
    this.scores = [...this._scores, nuevoRegistro];
  }

  /**
   * Limpia el historial de récords de la aplicación.
   */
  public async borrarHistorial(): Promise<void> {
    this._scores = [];
    await Preferences.remove({ key: this.STORAGE_KEY });
  }

  private async cargarStorage(): Promise<void> {
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      this._scores = JSON.parse(value);
    }
  }

  private async guardarEnStorage(): Promise<void> {
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(this._scores)
    });
  }
}