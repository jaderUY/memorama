import { Injectable } from '@angular/core'; // librería de Angular para inyectar dependencias
import { Preferences } from '@capacitor/preferences'; // librería de Capacitor para manejar preferencias de almacenamiento

// Interfaz para representar un registro de puntuación
export interface ScoreRecord {
  intentos: number;
  fecha: string;
}

// Servicio para manejar el almacenamiento de puntuaciones
@Injectable({
  providedIn: 'root' // indica que este servicio estará disponible en toda la aplicación
})
export class ScoreService {
  private readonly STORAGE_KEY = 'memorama_perros_scores';
  private _scores: ScoreRecord[] = []; 

  constructor() {
    this.cargarStorage();
  }

  get scores(): ScoreRecord[] {
    return [...this._scores];
  }

  set scores(nuevosScores: ScoreRecord[]) {
    this._scores = nuevosScores
      .sort((a, b) => a.intentos - b.intentos)
      .slice(0, 5);

    this.guardarEnStorage();
  }

  public registrarIntento(intentos: number): void {
    const nuevoRegistro: ScoreRecord = {
      intentos,
      fecha: new Date().toLocaleDateString('es-ES', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
      })
    };
    this.scores = [...this._scores, nuevoRegistro];
  }

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