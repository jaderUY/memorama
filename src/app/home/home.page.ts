import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonChip, IonBadge, IonButton } from '@ionic/angular';

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
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonRow, IonCol, IonChip, IonBadge, IonButton],
})

export class HomePage implements OnInit {
cards: Card[] = [];
  pairs = 8; // La Dog API nos traerá 8 imágenes únicas
  matches = 0;
  attempts = 0;
  finished = false;
  boardLocked = false;
  flippedCards: Card[] = [];

  ngOnInit() {
    this.newGame();
  }

  async newGame() {
    this.matches = 0;
    this.attempts = 0;
    this.finished = false;
    this.boardLocked = false;
    this.flippedCards = [];
    this.cards = []; // Limpiamos el tablero mientras carga

    await this.loadDogImages();
  }

  loadDogImages() {
    const images = Array.from(
      { length: this.pairs },
      (_, index) => `assets/dogs/dog-${index + 1}.jpg`,
    );

    this.setupBoard(images);
  }

  setupBoard(images: string[]) {
    const tempCards: Card[] = [];
    let idCounter = 0;

    images.forEach((imgUrl) => {
      const key = `pair-${idCounter}`;

      tempCards.push({ id: idCounter, key, imagenUrl: imgUrl, revealed: false, matched: false });
      idCounter++;

      tempCards.push({ id: idCounter, key, imagenUrl: imgUrl, revealed: false, matched: false });
      idCounter++;
    });

    this.cards = tempCards.sort(() => Math.random() - 0.5);
  }

  onCardClick(card: Card) {
    // Bloqueamos la acción si el tablero está en pausa o la carta ya está revelada
    if (this.boardLocked || card.revealed || card.matched) return;

    card.revealed = true;
    this.flippedCards.push(card);

    if (this.flippedCards.length === 2) {
      this.boardLocked = true;
      this.attempts++;
      this.checkForMatch();
    }
  }

  checkForMatch() {
    const [card1, card2] = this.flippedCards;

    // Comparamos las URLs provenientes de la API para validar el par
    if (card1.imagenUrl === card2.imagenUrl) {
      card1.matched = true;
      card2.matched = true;
      this.matches++;
      this.flippedCards = [];
      this.boardLocked = false;

      if (this.matches === this.pairs) {
        this.finished = true;
      }
    } else {
      // Si fallan, esperamos 1 segundo para aplicar el CSS de reversa
      setTimeout(() => {
        card1.revealed = false;
        card2.revealed = false;
        this.flippedCards = [];
        this.boardLocked = false;
      }, 1000);
    }
  }
}