import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonChip, 
  IonBadge, IonButton, IonGrid, IonRow, IonCol, IonList, 
  IonItem, IonLabel, IonNote, IonSpinner 
} from '@ionic/angular';
import { ScoreService, ScoreRecord } from '../services/storage';

export interface Card {
  id: number;
  key: string; // Utilizado para comparar si hacen pareja
  imagenUrl: string;
  revealed: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonChip, 
    IonBadge, IonButton, IonGrid, IonRow, IonCol, IonList, 
    IonItem, IonLabel, IonNote, IonSpinner
  ]
})
export class HomePage implements OnInit {
  cards: Card[] = [];
  pairs: number = 6;
  matches: number = 0;
  attempts: number = 0;
  boardLocked: boolean = false;
  cargandoImagenes: boolean = false;

  private firstCard: Card | null = null;
  private secondCard: Card | null = null;
  private _finished: boolean = false;
  private scoreService = Inject(ScoreService);
  private http = Inject(HttpClient);

  ngOnInit() {
    this.newGame();
  }

  /**
   * Getter: Expone el estado de finalización del juego a la vista HTML.
   */
  get finished(): boolean {
    return this._finished;
  }

  /**
   * Setter: Al marcar el juego como finalizado (`finished = true`), 
   * se guarda automáticamente el número de intentos en el servicio.
   */
  set finished(val: boolean) {
    this._finished = val;
    if (val && this.attempts > 0) {
      this.scoreService.registrarIntento(this.attempts);
    }
  }

  /**
   * Getter: Obtiene los mejores récords desde el servicio.
   */
  get mejoresIntentos(): ScoreRecord[] {
    return this.scoreService.scores;
  }

  /**
   * Getter: Obtiene el mejor récord histórico.
   */
  get mejorRecord(): number | null {
    return this.scoreService.mejorRecord;
  }

  /**
   * Inicia o reinicia el juego consultando la API de Perros y barajando el tablero.
   */
  async newGame() {
    this.matches = 0;
    this.attempts = 0;
    this._finished = false; // Asignación privada directa sin activar el setter
    this.boardLocked = false;
    this.firstCard = null;
    this.secondCard = null;
    this.cards = [];
    this.cargandoImagenes = true;

    try {
      // Consumir API de perros para obtener imágenes únicas
      const res: any = await this.http.get(`https://dog.ceo/api/breeds/image/random/${this.pairs}`).toPromise();
      const dogImages: string[] = res.message;

      // Crear parejas de cartas
      const baraja: Card[] = [];
      let idCounter = 1;

      dogImages.forEach((url, index) => {
        const key = `dog_${index}`;
        baraja.push({ id: idCounter++, key, imagenUrl: url, revealed: false, matched: false });
        baraja.push({ id: idCounter++, key, imagenUrl: url, revealed: false, matched: false });
      });

      // Barajar aleatoriamente
      this.cards = baraja.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error al cargar imágenes de la API:', error);
    } finally {
      this.cargandoImagenes = false;
    }
  }

  /**
   * Controla el clic en cada carta y valida si hacen pareja.
   */
  onCardClick(card: Card) {
    if (this.boardLocked || card.revealed || card.matched) return;

    card.revealed = true;

    if (!this.firstCard) {
      this.firstCard = card;
      return;
    }

    this.secondCard = card;
    this.attempts++;
    this.boardLocked = true;

    this.evaluarPar();
  }

  private evaluarPar() {
    if (this.firstCard?.key === this.secondCard?.key) {
      // ¿Es Pareja?
      this.firstCard!.matched = true;
      this.secondCard!.matched = true;
      this.matches++;
      this.resetTurno();

      // Verificar victoria
      if (this.matches === this.pairs) {
        this.finished = true; // Activa el SETTER que guarda en @capacitor/preferences
      }
    } else {
      // No es pareja: Voltear de nuevo tras 1 segundo
      setTimeout(() => {
        if (this.firstCard) this.firstCard.revealed = false;
        if (this.secondCard) this.secondCard.revealed = false;
        this.resetTurno();
      }, 1000);
    }
  }

  private resetTurno() {
    this.firstCard = null;
    this.secondCard = null;
    this.boardLocked = false;
  }

  /**
   * Permite al usuario limpiar su historial de récords.
   */
  async borrarRecords() {
    await this.scoreService.borrarHistorial();
  }
}