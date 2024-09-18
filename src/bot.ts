import { Bot, InlineKeyboard } from "./deps.ts";

const BOT_TOKEN = Deno.env.get("BOT_TOKEN") as string;

export const bot = new Bot(BOT_TOKEN);
const kv = await Deno.openKv();

bot.command("ping", async (ctx) => {
  await ctx.reply("pong");
});

bot
  .command("set")
  .filter((ctx) => {
    return ctx.from?.id === +(Deno.env.get("ADMIN_ID") as string);
  })
  .use(async (ctx) => {
    await kv.set(["link"], ctx.match);
    await ctx.react("🏆");
  });

bot.on("channel_post", async (ctx) => {
  if (ctx.channelPost.forward_origin || ctx.channelPost.media_group_id) {
    return;
  }

  const link = await kv.get<string>(["link"]);

  if (!link.value) {
    return;
  }

  await ctx.editMessageReplyMarkup({
    reply_markup: new InlineKeyboard().url(
      "Entra aqui para apoyar al canal ",
      link.value
    ),
  });
});
