import { basename, join, posix, win32 } from "path";
import { sync } from "fast-glob";
import { Command } from "../structures/Command";
import { Routes } from "discord-api-types/v10";
import { client, rest } from "./client";
import { development } from "./env";
import { config } from "./config";
import { Collection } from "discord.js";

const commandFolder = join(__dirname, "../commands/**/*.js").replaceAll(win32.sep, posix.sep);
export const commandRegistry = new Collection<string, Command>();

const registerCommands = async (commands: Command[]) => {
	if (!client.isReady()) throw new Error("registerCommands called before client was ready.");
	const route = development
		? Routes.applicationGuildCommands(client.application.id, config.mainServer)
		: Routes.applicationCommands(client.application.id);
	await rest.put(route, { body: commands.map(x => x.toJSON()) });
	commands.forEach(x => commandRegistry.set(x.name, x));
};
export const loadCommands = async (): Promise<Command[]> => {
	const commands: Command[] = [];
	const commandFiles = sync(commandFolder);
	for (const file of commandFiles) {
		const data = await import(file) as { command: unknown; };
		if (!(data.command instanceof Command)) throw new Error(`File ${file} does not export 'command'.`);
		console.log(`Registered command ${basename(file)}`);
		commands.push(data.command);
	}
	await registerCommands(commands);
	return commands;
};