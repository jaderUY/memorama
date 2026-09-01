import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core'; // 1. Importar ChangeDetectorRef
import { HttpClient } from '@angular/common/http';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonChip, 
  IonBadge, IonButton, IonGrid, IonRow, IonCol, IonList, 
  IonItem, IonLabel, IonNote, IonSpinner 
} from '@ionic/angular';
import { ScoreService, ScoreRecord } from '../services/storage';

export interface Card {
  id: number;
  key: string;
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

  private scoreService = inject(ScoreService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef); // 2. Inyectar ChangeDetectorRef

  ngOnInit() {
    this.newGame();
  }

  get finished(): boolean {
    return this._finished;
  }

  set finished(val: boolean) {
    this._finished = val;
    if (val && this.attempts > 0) {
      this.scoreService.registrarIntento(this.attempts);
    }
  }

  get mejoresIntentos(): ScoreRecord[] {
    return this.scoreService.scores;
  }

  get mejorRecord(): number | null {
    return this.scoreService.mejorRecord;
  }

  newGame() {
    this.matches = 0;
    this.attempts = 0;
    this._finished = false;
    this.boardLocked = false;
    this.firstCard = null;
    this.secondCard = null;
    this.cards = [];
    this.cargandoImagenes = true;

    // 3. Petición HTTP directa con suscripción reactiva
    this.http.get<any>(`https://dog.ceo/api/breeds/image/random/${this.pairs}`).subscribe({
      next: (res) => {
        if (res && res.message) {
          const dogImages: string[] = res.message;
          const baraja: Card[] = [];
          let idCounter = 1;

          dogImages.forEach((url, index) => {
            const key = `dog_${index}`;
            baraja.push({ id: idCounter++, key, imagenUrl: url, revealed: false, matched: false });
            baraja.push({ id: idCounter++, key, imagenUrl: url, revealed: false, matched: false });
          });

          this.cards = baraja.sort(() => Math.random() - 0.5);
        }
        
        this.cargandoImagenes = false;
        this.cdr.detectChanges(); // Forzar a Angular a redibujar el HTML inmediatamente
      },
      error: (err) => {
        console.error('Error al consultar la API de perros:', err);
        this.cargandoImagenes = false;
        this.cdr.detectChanges();
      }
    });
  }

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
      this.firstCard!.matched = true;
      this.secondCard!.matched = true;
      this.matches++;
      this.resetTurno();

      if (this.matches === this.pairs) {
        this.finished = true;
      }
    } else {
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

  async borrarRecords() {
    await this.scoreService.borrarHistorial();
    this.cdr.detectChanges();
  }
}