export interface Scene {
    index: number;
    text: string;
    imagePath: string;
}

export interface Story {
    storyTitle: string;
    scenes: Scene[];
}

export interface StoryCollection {
    stories: Story[];
}