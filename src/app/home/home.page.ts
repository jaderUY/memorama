import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonChip, 
  IonBadge, IonButton, IonList, IonItem, IonLabel, IonNote, IonSpinner 
} from '@ionic/angular';
import { ScoreService, ScoreRecord } from '../services/storage';
import { IonGrid, IonRow } from "@ionic/angular";

// Interfaz para representar una carta
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
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonChip, 
    IonBadge, IonButton, IonList, IonItem, IonLabel, IonNote, IonSpinner
  ]
})

// Clase principal de la página de inicio
export class HomePage implements OnInit {
  cards: Card[] = [];
  pairs: number = 6;
  matches: number = 0;
  attempts: number = 0;
  boardLocked: boolean = false;
  cargandoImagenes: boolean = false;

  private firstCard: Card | null = null; 
  private secondCard: Card | null = null;
  private _finished: boolean = false; // Variable para controlar si el juego ha terminado

  // Inyección de dependencias para servicios y referencias
  private scoreService = inject(ScoreService); 
  private http = inject(HttpClient); 
  private cdr = inject(ChangeDetectorRef); // Referencia para detectar cambios en la vista

  ngOnInit() {
    this.newGame();
  }

  // Getter y setter para la propiedad finished
  get finished(): boolean {
    return this._finished;
  }

  set finished(val: boolean) {
    this._finished = val;
    if (val && this.attempts > 0) {
      this.scoreService.registrarIntento(this.attempts);
      this.cdr.detectChanges();
    }
  }

  get mejoresIntentos(): ScoreRecord[] {
    return this.scoreService.scores;
  }

  // Método para iniciar un nuevo juego
  newGame() {
    this.matches = 0;
    this.attempts = 0;
    this._finished = false;
    this.boardLocked = false;
    this.firstCard = null;
    this.secondCard = null;
    this.cards = [];
    this.cargandoImagenes = true;

    // Solicitud HTTP para obtener imágenes de perros
    this.http.get<any>(`https://dog.ceo/api/breeds/image/random/${this.pairs}`).subscribe({
      // Manejo de la respuesta exitosa
      next: (res) => {
        if (res?.message) {
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
        this.cdr.detectChanges();
      },
      // Manejo de errores en la solicitud HTTP
      error: (err) => {
        console.error('Error al obtener imágenes:', err);
        this.cargandoImagenes = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Método que se ejecuta al hacer clic en una carta
  onCardClick(card: Card) {
    if (this.boardLocked || card.revealed || card.matched) return;

    card.revealed = true;
    this.cdr.detectChanges();

    if (!this.firstCard) {
      this.firstCard = card;
      return;
    }

    this.secondCard = card;
    this.attempts++;
    this.boardLocked = true;
    this.cdr.detectChanges();

    this.evaluarPar();
  }

  // Método privado para evaluar si las dos cartas seleccionadas forman un par
  private evaluarPar() {
    const card1 = this.firstCard;
    const card2 = this.secondCard;

    if (card1?.key === card2?.key) {
      if (card1) card1.matched = true;
      if (card2) card2.matched = true;
      this.matches++;
      this.resetTurno();

      if (this.matches === this.pairs) {
        this.finished = true;
      }
      this.cdr.detectChanges();
    } else {
      setTimeout(() => {
        if (card1) card1.revealed = false;
        if (card2) card2.revealed = false;
        this.resetTurno();
        this.cdr.detectChanges();
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