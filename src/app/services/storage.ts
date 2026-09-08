import { Injectable } from '@angular/core'; // Decorador para marcar la clase como un servicio inyectable
import { Preferences } from '@capacitor/preferences'; // Importación de la API de preferencias de Capacitor para almacenamiento persistente

export interface ScoreRecord {
  nombre: string;
  intentos: number;
  fecha: string;
}

// Servicio para manejar el almacenamiento y gestión de los récords de puntuación
@Injectable({
  providedIn: 'root' // El servicio estará disponible en toda la aplicación
})
export class ScoreService {
  private readonly STORAGE_KEY = 'memorama_perros_scores';
  private _scores: ScoreRecord[] = [];

  constructor() {
    this.cargarStorage(); 
  }

  get scores(): ScoreRecord[] {
    return [...this._scores]; // Devuelve una copia de los récords para evitar modificaciones externas
  }

  set scores(nuevosScores: ScoreRecord[]) {
    this._scores = nuevosScores
      .sort((a, b) => a.intentos - b.intentos) // Ordena los récords por número de intentos (ascendente)
      .slice(0, 5); // Limita la lista a los 5 mejores récords

    this.guardarEnStorage();
  }

  public registrarIntento(nombre: string, intentos: number): void {
    const nuevoRegistro: ScoreRecord = {
      nombre: nombre || 'Anónimo',
      intentos,
      fecha: new Date().toLocaleDateString('es-ES', {
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit'
      })
    };
    this.scores = [...this._scores, nuevoRegistro]; // Actualiza la lista de récords con el nuevo intento
  }

  public async borrarHistorial(): Promise<void> {
    this._scores = [];
    await Preferences.remove({ key: this.STORAGE_KEY });
  }

  private async cargarStorage(): Promise<void> {
    // Carga los récords almacenados en el almacenamiento persistente al iniciar el servicio
    const { value } = await Preferences.get({ key: this.STORAGE_KEY });
    if (value) {
      this._scores = JSON.parse(value);
    }
  }

  private async guardarEnStorage(): Promise<void> {
    // Guarda los récords actuales en el almacenamiento persistente
    await Preferences.set({
      key: this.STORAGE_KEY,
      value: JSON.stringify(this._scores)
    });
  }
}