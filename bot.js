const { Bot, session, MemorySessionStorage, Keyboard, InlineKeyboard, InputFile, InputMediaDocument, InputMediaBuilder } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
// const { I18n, hears } = require("@grammyjs/i18n");
// const {
//     conversations,
//     createConversation,
// } = require("@grammyjs/conversations");
require('dotenv').config()
// const Database = require("./db");
const customLogger = require("./config/customLogger");
const { get_organizations, chek_user, chek_user_salary, chek_register_user } = require("./service/services/ApiService");

// modules

const { client_bot } = require("./modules/clientModules");
const { config_bot } = require("./modules/configModules")

const bot_token = process.env.BOT_TOKEN;
const payme_tokent = process.env.PAYME_PROVIDER_TOKEN;







const bot = new Bot(bot_token);

bot.use(config_bot)

bot.use(client_bot)

const organization_menu = new Menu("organization_menu")
    .dynamic(async (ctx, range) => {
        let [error, list] = await get_organizations();

        list.forEach((item) => {
            range
                .text(item.name, async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage()
                    ctx.session.session_db.client.organization_id = item.id;
                    await ctx.conversation.enter("register_conversations");
                })
                .row();
        })
    })
bot.chatType("private").use(organization_menu)

bot.chatType("private").use(async (ctx, next) => {
    let [error, res] = await chek_register_user({data:{chat_id:ctx.from.id}} )
    if (res.status) {
        await ctx.conversation.enter("main_menu_conversation");
    } else {
        await ctx.reply(`
    <b>Korxongizni tanlang!</b>    
        `, {
            reply_markup: organization_menu,
            parse_mode: "HTML"
        })
    }
    next()
})

bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const message = err.error;
    customLogger.log({
        level: 'error',
        message: message
    });
});



bot.start({
    // Make sure to specify the desired update types
    allowed_updates: ["my_chat_member", "chat_member", "message", "callback_query", "inline_query"],
});