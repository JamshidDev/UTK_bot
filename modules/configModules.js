const { Composer, MemorySessionStorage, session } = require("grammy");
const { Menu, MenuRange } = require("@grammyjs/menu");
const { I18n, hears } = require("@grammyjs/i18n");
const {
    conversations,
} = require("@grammyjs/conversations");
const {logout_user  } = require("../service/services/ApiService");


const config_bot = new Composer();

const i18n = new I18n({
    defaultLocale: "uz",
    useSession: true,
    directory: "locales",
    globalTranslationContext(ctx) {
        return { first_name: ctx.from?.first_name ?? "" };
    },
});
config_bot.use(i18n);

config_bot.use(session({
    type: "multi",
    session_db: {
        initial: () => {
            return {
                client: {
                    organization_id:null,
                    phone: null,
                    report_number: null,
                },
                salary:{
                    year:null,
                    month:null,
                }
            }
        },
        storage: new MemorySessionStorage(),
    },
    conversation: {},
    __language_code: {},
}));

config_bot.use(conversations());

config_bot.on("my_chat_member", async (ctx) => {
    if (ctx.update.my_chat_member.new_chat_member.status == "kicked") {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
        await logout_user({data:{
            chat_id:ctx.from.id,
        }})
    }

});

config_bot.use(async (ctx, next) => {
    let permissions = ['🔴 Bekor qilish']
    if (permissions.includes(ctx.message?.text)) {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
    }
    ctx.config = {
        is_admin: true
    }
    await next()
})


























module.exports = {config_bot}