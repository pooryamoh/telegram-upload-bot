import EasyDl from "easydl";
import { Bot, InputFile } from "grammy";
import { Command } from "commander";
import * as fs from "fs";
const program = new Command();

program
  .name("upload-bot")
  .description("Telegram bot to upload files based on provided url")
  .version("1.0.0");

program
  .command("run")
  .description("Run bot")
  .option("--user-id <id>", "Id of user wich interact with bot")
  .option("--api-url <url>", "Url of telegram bot api")
  .option("--token <token>", "The bot's token as acquired from https://t.me/BotFather")
  .action((option) => {
    const bot = new Bot(option.token, {
      client: { apiRoot: option.apiUrl },
    });
    bot.on("message", async (ctx) => {
      if ((await ctx.getAuthor()).user.id != option.userId) return;
      try {
        const dl = new EasyDl(ctx.message.text ?? "", "tmp/", {
          connections: 10,
          maxRetry: 5,
        });
        const metadata = await dl.metadata();
        const completed = await dl.wait();
        if (!completed) {
          await bot.api.sendMessage(
            ctx.chatId,
            "Something went wrong during download."
          );
          return;
        }
        const file = new InputFile(metadata.savedFilePath);
        const uploadMessage = await bot.api.sendMessage(
          ctx.chatId,
          "Uploading"
        );
        await ctx.replyWithVideo(file);
        await bot.api.deleteMessage(ctx.chatId, uploadMessage.message_id);
        fs.rmSync(metadata.savedFilePath, { recursive: true, force: true });
      } catch (err) {
        console.log("[error]", err);
      }
    });
    bot.start();
  });

program.parse();
