import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {StoryService} from '../services/story.service';
import {Scene, Story} from '../models/story.model';
import {Subscription} from 'rxjs';
import {marked} from 'marked';
import {
    KatexOptions,
    MarkdownComponent,
    MarkdownModule,
    MARKED_OPTIONS,
    MarkedOptions,
    MERMAID_OPTIONS,
    provideMarkdown
} from "ngx-markdown";

export function markedOptionsFactory(): MarkedOptions {
    const renderer = new marked.Renderer();

    return {
        gfm: true,
        breaks: true,
        renderer: renderer
    };
}

@Component({
    selector: 'app-book',
    standalone: true,
    imports: [CommonModule, MarkdownComponent, MarkdownModule],
    providers: [
        provideMarkdown({
            markedOptions: {
                provide: MARKED_OPTIONS,
                useFactory: markedOptionsFactory
            },
            mermaidOptions: {
                provide: MERMAID_OPTIONS,
                useValue: {
                    darkMode: true,
                    look: 'handDrawn',
                }
            },
        }),
    ],
    template: `
        <div class="book-container" *ngIf="selectedStory; else noStorySelected">
            <div class="book" #bookElement>
                <div class="book-spine" *ngIf="!bookOpen" (click)="openBook()">
                    <h2 class="book-spine-title">{{ selectedStory.storyTitle }}</h2>
                </div>

                <div class="book-pages" [class.open]="bookOpen">
                    <markdown class="page-left"
                              #leftPage
                              [class.flipping]="isFlipping && flipDirection === 'forward'"
                              (touchstart)="onTouchStart($event, 'left')"
                              (touchmove)="onTouchMove($event)"
                              (touchend)="onTouchEnd($event, 'left')"
                              (mousedown)="onMouseDown($event, 'left')"
                              (mousemove)="onMouseMove($event)"
                              (mouseup)="onMouseUp($event, 'left')"
                              (mouseleave)="onMouseLeave($event)"
                              [data]="currentScene?.text || ''"
                              [clipboard]="false"
                              [mermaid]="false"
                              [katex]="false"
                              [katexOptions]="options">
                    </markdown>

                    <div class="page-right"
                         #rightPage
                         [class.flipping]="isFlipping && flipDirection === 'backward'"
                         (touchstart)="onTouchStart($event, 'right')"
                         (touchmove)="onTouchMove($event)"
                         (touchend)="onTouchEnd($event, 'right')"
                         (mousedown)="onMouseDown($event, 'right')"
                         (mousemove)="onMouseMove($event)"
                         (mouseup)="onMouseUp($event, 'right')"
                         (mouseleave)="onMouseLeave($event)">
                        <div class="page-content">
                            <div class="page-image">
                                <img [src]="currentScene?.imagePath" [alt]="'Szene ' + (currentSceneIndex + 1)"/>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="navigation" *ngIf="bookOpen">
                    <button
                            class="nav-button prev"
                            [disabled]="!canGoPrevious"
                            (click)="previousScene()"
                            [class.disabled]="!canGoPrevious">
                        ←
                    </button>
                    <span class="page-indicator">
            {{ currentSceneIndex + 1 }} / {{ selectedStory.scenes.length }}
          </span>
                    <button
                            class="nav-button next"
                            [disabled]="!canGoNext"
                            (click)="nextScene()"
                            [class.disabled]="!canGoNext">
                        →
                    </button>
                </div>
            </div>
        </div>

        <ng-template #noStorySelected>
            <div class="no-story-message">
                <div class="message-content">
                    <h2>Wählen Sie eine Story</h2>
                    <p>Bitte wählen Sie eine Story aus der Liste links aus, um das magische Buch zu öffnen.</p>
                </div>
            </div>
        </ng-template>
    `,
    styles: [`
        .book-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            padding: 1rem;
            background-image: url("./../assets/wood.jpg");
        }

        .book {
            position: relative;
            perspective: 1200px;
            width: 40vw;
            height: 90vh;
            max-width: 85vw;
            max-height: 90vh;
        }

        .book-spine {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: url("../assets/book.png");
            border-radius: 8px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3),
            inset 0 2px 4px rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.4s ease;
            z-index: 10;
        }

        .book-spine:hover {
            transform: translateY(-4px);
            box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35),
            inset 0 2px 4px rgba(255, 255, 255, 0.15);
            color: #FFD090;
            font-size: 5rem;
            font-weight: 700;
            text-shadow: 20px 20px 40px rgba(0, 0, 0, 1);
            text-align: center;
            padding: 0 2rem;
        }

        .book-spine-title {
            color: #FFD090;
            font-size: 5rem;
            font-weight: 700;
            text-shadow: 20px 20px 40px rgba(0, 0, 0, 1);
            text-align: center;
            padding: 0 2rem;
        }

        .book-pages {
            position: absolute;
            width: 100%;
            height: 100%;
            display: flex;
            transform-style: preserve-3d;
            transition: all 0.6s ease;
            opacity: 0;
            pointer-events: none;
            transform: rotateY(-10deg);
            z-index: 5;
        }

        .book-pages.open {
            opacity: 1;
            pointer-events: all;
            transform: rotateY(0deg);
            z-index: 15;
        }

        .page-left,
        .page-right {
            width: 50%;
            height: 100%;
            padding: 1rem;
            background-image: url("./../assets/paper.jpg");
            background-size: cover; /* skaliert das Bild, sodass es den Container vollständig abdeckt */
            background-position: center; /* optional: zentriert das Bild */
            background-repeat: no-repeat; /* verhindert Wiederholung */
            border: 1px solid #DDD;
            position: relative;
            backface-visibility: hidden;
            transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transform-style: preserve-3d;
            overflow-y: auto;
        }

        .page-left {
            border-radius: 8px 0 0 8px;
            transform-origin: right center;
            border-right: 2px solid #8B4513;
        }

        .page-right {
            border-radius: 0 8px 8px 0;
            transform-origin: left center;
            border-left: 2px solid #8B4513;
        }

        .page-left.flipping {
            animation: flipPageRight 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        .page-right.flipping {
            animation: flipPageLeft 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }

        @keyframes flipPageLeft {
            0% {
                transform: rotateY(0deg);
                z-index: 20;
            }
            15% {
                transform: rotateY(-25deg) translateZ(50px);
                box-shadow: -20px 0 40px rgba(0, 0, 0, 0.3);
            }
            25% {
                transform: rotateY(-45deg) translateZ(50px);
                box-shadow: -20px 0 40px rgba(0, 0, 0, 0.4);
            }
            35% {
                transform: rotateY(-65deg) translateZ(50px);
                box-shadow: -25px 0 45px rgba(0, 0, 0, 0.5);
            }
            50% {
                transform: rotateY(-90deg) translateZ(50px);
                box-shadow: -30px 0 50px rgba(0, 0, 0, 0.5);
            }
            65% {
                transform: rotateY(-110deg) translateZ(50px);
                box-shadow: -25px 0 45px rgba(0, 0, 0, 0.5);
            }
            75% {
                transform: rotateY(-135deg) translateZ(50px);
                box-shadow: -20px 0 40px rgba(0, 0, 0, 0.5);
            }
            85% {
                transform: rotateY(-155deg) translateZ(50px);
                box-shadow: -10px 0 30px rgba(0, 0, 0, 0.4);
            }
            90% {
                transform: rotateY(-180deg) translateZ(50px);
                box-shadow: 5px 0 20px rgba(0, 0, 0, 0.3);
            }
            100% {
                transform: rotateY(-210deg);
                z-index: 1;
            }
        }

        @keyframes flipPageRight {
            0% {
                transform: rotateY(0deg);
                z-index: 20;
            }
            15% {
                transform: rotateY(25deg) translateZ(50px);
                box-shadow: 20px 0 40px rgba(0, 0, 0, 0.3);
            }
            25% {
                transform: rotateY(45deg) translateZ(50px);
                box-shadow: 20px 0 40px rgba(0, 0, 0, 0.4);
            }
            35% {
                transform: rotateY(65deg) translateZ(50px);
                box-shadow: 25px 0 45px rgba(0, 0, 0, 0.5);
            }
            50% {
                transform: rotateY(90deg) translateZ(50px);
                box-shadow: 30px 0 50px rgba(0, 0, 0, 0.5);
            }
            65% {
                transform: rotateY(110deg) translateZ(50px);
                box-shadow: 25px 0 45px rgba(0, 0, 0, 0.5);
            }
            75% {
                transform: rotateY(135deg) translateZ(50px);
                box-shadow: 20px 0 40px rgba(0, 0, 0, 0.5);
            }
            85% {
                transform: rotateY(155deg) translateZ(50px);
                box-shadow: 10px 0 30px rgba(0, 0, 0, 0.4);
            }
            90% {
                transform: rotateY(180deg) translateZ(50px);
                box-shadow: 5px 0 20px rgba(0, 0, 0, 0.3);
            }
            100% {
                transform: rotateY(210deg);
                z-index: 1;
            }
        }

        .page-content {
            padding: 2rem;
            height: 100%;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .page-text {
            flex: 1;
            font-size: 1.5rem;
            font-weight: 400;
            line-height: 1.8;
            color: #333;
            font-family: 'Georgia', serif;
            text-align: justify;
            overflow-y: auto;
        }

        .page-text ::ng-deep h3 {
            color: #8B4513;
            font-size: 1.3rem;
            margin-bottom: 1rem;
            font-weight: 600;
        }

        .page-image {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .page-image img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .navigation {
            position: absolute;
            bottom: -60px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 2rem;
            background: rgba(255, 255, 255, 0.9);
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-button {
            background: #8B4513;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .nav-button:hover:not(.disabled) {
            background: #A0522D;
            transform: scale(1.1);
        }

        .nav-button.disabled {
            background: #CCC;
            cursor: not-allowed;
            opacity: 0.5;
        }

        .page-indicator {
            font-weight: 600;
            color: #8B4513;
            min-width: 60px;
            text-align: center;
        }

        .no-story-message {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-image: url("./../assets/wood.jpg");
        }

        .message-content {
            color: #FFD090;
            font-size: 5rem;
            font-weight: 700;
            text-shadow: 20px 20px 40px rgba(0, 0, 0, 1);
            text-align: center;
            padding: 0 2rem;
        }

        .message-content h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .message-content p {
            font-size: 1.1rem;
            opacity: 0.9;
            line-height: 1.6;
        }

        @media (max-width: 768px) {
            .book-container {
                padding: 1rem;
            }

            .book {
                width: 350px;
                height: 500px;
            }

            .book-spine-title {
                font-size: 1.5rem;
            }

            .page-content {
                padding: 1rem;
            }

            .page-text {
                font-size: 0.9rem;
            }

            .navigation {
                bottom: -50px;
                gap: 1rem;
                padding: 0.6rem 1rem;
            }

            .nav-button {
                width: 35px;
                height: 35px;
                font-size: 1rem;
            }
        }

        @media (max-width: 480px) {
            .book {
                width: 300px;
                height: 420px;
            }

            .page-content {
                padding: 0.8rem;
            }

            .page-text {
                font-size: 0.85rem;
                line-height: 1.6;
            }
        }
    `]
})
export class BookComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('bookElement') bookElement!: ElementRef;
    @ViewChild('leftPage') leftPage!: ElementRef;
    @ViewChild('rightPage') rightPage!: ElementRef;

    selectedStory: Story | null = null;
    currentScene: Scene | null = null;
    currentSceneIndex: number = 0;
    bookOpen: boolean = false;
    canGoNext: boolean = false;
    canGoPrevious: boolean = false;

    // Animation states
    isFlipping: boolean = false;
    flipDirection: 'forward' | 'backward' = 'forward';

    // Touch/Mouse handling
    private startX: number = 0;
    private startY: number = 0;
    private isDragging: boolean = false;
    private minSwipeDistance: number = 50;

    private subscriptions: Subscription = new Subscription();

    public options: KatexOptions = {
        displayMode: true,
        throwOnError: false,
        errorColor: '#cc0000',
    };

    constructor(private storyService: StoryService) {
    }

    ngOnInit(): void {
        this.subscriptions.add(
            this.storyService.selectedStory$.subscribe(story => {
                this.selectedStory = story;
                this.bookOpen = false;
                if (this.bookElement) {
                    this.bookElement.nativeElement.style.width = '40vw';
                }
                if (story) {
                    setTimeout(() => this.updateCurrentScene(), 100);
                }
            })
        );

        this.subscriptions.add(
            this.storyService.currentSceneIndex$.subscribe(index => {
                this.currentSceneIndex = index;
                this.updateCurrentScene();
                this.updateNavigationState();
            })
        );
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    private updateCurrentScene(): void {
        if (this.selectedStory && this.selectedStory.scenes[this.currentSceneIndex]) {
            this.currentScene = this.selectedStory.scenes[this.currentSceneIndex];
        }
    }

    private updateNavigationState(): void {
        this.canGoNext = this.storyService.canGoNext();
        this.canGoPrevious = this.storyService.canGoPrevious();
    }

    openBook(): void {
        if (!this.bookOpen) {
            this.bookElement.nativeElement.style.width = 85 + 'vw';
            this.bookOpen = true;
        } else {
            this.bookElement.nativeElement.style.width = 40 + 'vw';
        }
    }

    nextScene(): void {
        if (this.canGoNext && !this.isFlipping) {
            this.flipDirection = 'backward';
            this.isFlipping = true;

            setTimeout(() => {
                this.storyService.nextScene();
            }, 725);

            setTimeout(() => {
                this.isFlipping = false;
            }, 775);
        }
    }

    previousScene(): void {
        if (this.canGoPrevious && !this.isFlipping) {
            this.flipDirection = 'forward';
            this.isFlipping = true;

            setTimeout(() => {
                this.storyService.previousScene();
            }, 600);

            setTimeout(() => {
                this.isFlipping = false;
            }, 1200);
        }
    }

    // Touch Events
    onTouchStart(event: TouchEvent, side: 'left' | 'right'): void {
        if (!this.bookOpen) return;

        const touch = event.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.isDragging = true;

        event.preventDefault();
    }

    onTouchMove(event: TouchEvent): void {
        if (!this.isDragging) return;
        event.preventDefault();
    }

    onTouchEnd(event: TouchEvent, side: 'left' | 'right'): void {
        if (!this.isDragging) return;

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - this.startX;
        const deltaY = touch.clientY - this.startY;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
            if (side === 'right' && deltaX < 0) {
                // Swipe left on right side - go forward
                this.nextScene();
            } else if (side === 'left' && deltaX > 0) {
                // Swipe right on left side - go backward
                this.previousScene();
            }
        }

        this.isDragging = false;
    }

    // Mouse Events (for desktop)
    onMouseDown(event: MouseEvent, side: 'left' | 'right'): void {
        if (!this.bookOpen) return;

        this.startX = event.clientX;
        this.startY = event.clientY;
        this.isDragging = true;

        event.preventDefault();
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.isDragging) return;
        event.preventDefault();
    }

    onMouseUp(event: MouseEvent, side: 'left' | 'right'): void {
        if (!this.isDragging) return;

        const deltaX = event.clientX - this.startX;
        const deltaY = event.clientY - this.startY;

        // Check if it's a horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.minSwipeDistance) {
            if (side === 'right' && deltaX < 0) {
                // Swipe left on right side - go forward
                this.nextScene();
            } else if (side === 'left' && deltaX > 0) {
                // Swipe right on left side - go backward
                this.previousScene();
            }
        }

        this.isDragging = false;
    }

    onMouseLeave(event: MouseEvent): void {
        this.isDragging = false;
    }
}