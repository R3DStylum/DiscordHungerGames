import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js"

export abstract class Command{
    abstract builder:SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    abstract handler:(interaction:ChatInputCommandInteraction) => void;
}