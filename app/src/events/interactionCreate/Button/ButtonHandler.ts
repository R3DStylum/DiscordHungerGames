import { ButtonInteraction } from "discord.js"

export abstract class ButtonHandler{
    abstract handler:(interaction:ButtonInteraction) => void;
}