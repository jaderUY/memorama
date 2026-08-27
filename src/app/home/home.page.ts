import { Component, OnInit, ChangeDetectorRef} from '@angular/core';
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
  pairs = 8;
  cards: Card[] = [];
  firstPick: Card | null = null;
  secondPick: Card | null = null;
  boardLocked = false;
  attempts = 0;
  matches = 0;
  imagenesDisponibles: string[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  async ngOnInit() {
    await this.loadDogImages();
    this.newGame();
  }

  async loadDogImages() {
    this.imagenesDisponibles = Array.from(
      { length: this.pairs },
      (_, index) => `assets/dogs/dog-${index + 1}.jpg`
    );
  }

  newGame() {
    this.attempts = 0;
    this.matches = 0;
    this.resetPick();

    if (this.imagenesDisponibles.length === 0) return;

    const selected = [...this.imagenesDisponibles];
    const deck: Card[] = selected.flatMap((url, i) => [
      { id: i * 2, key: 'k' + i, imagenUrl: url, revealed: false, matched: false },
      { id: i * 2 + 1, key: 'k' + i, imagenUrl: url, revealed: false, matched: false }
    ]);

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    this.cards = deck;
    this.cdr.detectChanges();
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

      // Se guardan referencias locales inmunes a cambios externos
      const card1 = this.firstPick;
      const card2 = this.secondPick;
      const match = card1.key === card2.key;

      if (match) {
        card1.matched = true;
        card2.matched = true;
        this.matches++;
        this.resetPick();
      } else {
        setTimeout(() => {
          card1.revealed = false;
          card2.revealed = false;
          this.resetPick();
          this.cdr.detectChanges(); // Fuerza a Angular a actualizar el DOM y desbloquear los botones
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