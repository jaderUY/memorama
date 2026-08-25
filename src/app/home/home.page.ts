import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonGrid, IonRow, IonCol, IonChip, IonBadge, IonButton, } from '@ionic/angular';

// Actualizamos el tipo para usar la URL de la imagen en lugar del emoji
type Card = {
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
  imports: [ CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonGrid, IonRow, IonCol, IonChip, IonBadge, IonButton, ],
})

export class HomePage implements OnInit {
  pairs = 8; 
  banderasDisponibles: string[] = []; // Almacenará todas las banderas de la API

  cards: Card[] = [];
  firstPick: Card | null = null;
  secondPick: Card | null = null;
  boardLocked = false;
  attempts: number = 0;
  matches: number = 0;

  constructor() { }

  async ngOnInit() {
    await this.obtenerBanderas();
    this.newGame();
  }

  // Petición a la API pública de REST Countries
  async obtenerBanderas() {
    try {
      const response = await fetch('https://dog.ceo/api/breeds/image/random/8');
      const data = await response.json();
      // Guardamos solo las URLs de las imágenes SVG
      this.banderasDisponibles = data.map((pais: any) => pais.flags.svg);
    } catch (error) {
      console.error('Error al descargar estandartes:', error);
    }
  }

  newGame() {
    this.attempts = 0;
    this.matches = 0;
    this.firstPick = null;
    this.secondPick = null;
    this.boardLocked = false;

    // Si no hay banderas cargadas, no podemos iniciar
    if (this.banderasDisponibles.length === 0) return;

    // 1. Desordenamos todas las banderas disponibles para que cada partida tenga países distintos
    const banderasMezcladas = [...this.banderasDisponibles];
    for (let i = banderasMezcladas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [banderasMezcladas[i], banderasMezcladas[j]] = [banderasMezcladas[j], banderasMezcladas[i]];
    }

    // 2. Tomamos solo los 8 primeros países para esta partida
    const selected: string[] = banderasMezcladas.slice(0, this.pairs);

    // 3. Generamos los pares de cartas
    const deck: Card[] = selected.flatMap<Card>((url: string, i: number) => ([
      { id: i * 2, key: 'k' + i, imagenUrl: url, revealed: false, matched: false },
      { id: i * 2 + 1, key: 'k' + i, imagenUrl: url, revealed: false, matched: false }
    ]));

    // 4. Mezclamos el mazo final que irá al tablero
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.cards = deck;
  }

  onCardClick(card: Card) {
    if (card.revealed || card.matched || this.boardLocked) {
      return;
    }

    card.revealed = true;

    if (!this.firstPick) {
      this.firstPick = card;
      return;
    }

    if (!this.secondPick) {
      this.secondPick = card;
      this.attempts++;
      this.boardLocked = true;

      const match = this.firstPick.key === this.secondPick.key;

      if (match) {
        this.firstPick.matched = true;
        this.secondPick.matched = true;
        this.matches++;
        this.resetPick();
      } else {
        setTimeout(() => {
          if (this.firstPick) this.firstPick.revealed = false;
          if (this.secondPick) this.secondPick.revealed = false;
          this.resetPick();
        }, 800);
      }
    }
  }

  resetPick() {
    this.firstPick = null;
    this.secondPick = null;
    this.boardLocked = false;
  }

  get finished() {
    return this.matches === this.pairs;
  }
}