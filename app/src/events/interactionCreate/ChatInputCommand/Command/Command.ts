import { ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js"

export abstract class Command{
    //DO NOT EVER FORGET to add a description to EVERYTHING YOU CAN in the builder.
    abstract builder:SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    abstract handler:(interaction:ChatInputCommandInteraction) => void;
}