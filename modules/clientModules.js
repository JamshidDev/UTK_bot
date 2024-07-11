const {Composer, Keyboard} = require("grammy");
const {Menu, MenuRange} = require("@grammyjs/menu");
const {I18n, hears} = require("@grammyjs/i18n");
const {
    conversations,
    createConversation,
} = require("@grammyjs/conversations");
const {
    get_organizations,
    chek_user,
    chek_user_salary,
    chek_register_user,
} = require("../service/services/ApiService");
const channel_id = -1001490133717;
const client_bot = new Composer();
const i18n = new I18n({
    defaultLocale: "uz",
    useSession: true,
    directory: "locales",
    globalTranslationContext(ctx) {
        return {first_name: ctx.from?.first_name ?? ""};
    },
});
client_bot.use(i18n);

const pm = client_bot.chatType("private");

const channle_btn = new Menu("channle_btn").url(
    "➕ A'zo bo'lish",
    "https://t.me/Toshkent_MTU"
);
pm.use(channle_btn);
pm.use(async (ctx, next) => {
    let permission_list = ["member", "adminstator", "creator"];
    let user_id = ctx.from?.id;
    let chat_member = await ctx.chatMembers.getChatMember(channel_id, user_id);
    if (permission_list.includes(chat_member?.status)) {
        await next();
    } else {
        const stats = await ctx.conversation.active();
        for (let key of Object.keys(stats)) {
            await ctx.conversation.exit(key);
        }
        ctx.reply(
            `
👋 Salom <a href="tg://user?id=${ctx.from.id}">${ctx.from.first_name}</a>. Botdan foydalanish uchun <b>"Toshkent MTU" UK </b> rasmiy kanaliga a'zo bo'lishingiz shart!

<i>A'zo bo'lish uchun <b>➕ A'zo bo'lish</b> tugmasini bosing</i>        
<i>A'zo bo'lganingizdan so'ng qayta /start buyrug'ini botga yuboring</i>        
        `,
            {
                parse_mode: "HTML",
                reply_markup: channle_btn,
            }
        );
    }
});

pm.use(conversations());

pm.use(createConversation(register_conversations));
pm.use(createConversation(main_menu_conversation));
pm.use(createConversation(salary_show_conversation));

// conversations

async function register_conversations(conversation, ctx) {
    await ctx.reply(
        `
    <b>✍️ Tabel raqamingizni kiriting!</b>
    `,
        {
            parse_mode: "HTML",
            reply_markup: {
                remove_keyboard: true,
            },
        }
    );
    ctx = await conversation.wait();
    if (
        !(ctx.message?.text && !isNaN(ctx.message.text) && ctx.message.text != "0")
    ) {
        do {
            await ctx.reply(
                `
<b>⚠️ Noto'g'ri ma'lumot kiritildi</b> 

<i>✍️ Tabel raqamingizni kiriting!</i>
            `,
                {
                    parse_mode: "HTML",
                }
            );
            ctx = await conversation.wait();
        } while (
            !(
                ctx.message?.text &&
                !isNaN(ctx.message.text) &&
                ctx.message.text != "0"
            )
            );
    }

    conversation.session.session_db.client.report_number = ctx.message.text;
    let phone_keyboard = new Keyboard()
        .requestContact("📞 Telefon raqam yuborish")
        .resized();
    await ctx.reply(
        `
    <b>📞 Telefon raqamingizni yuboring!</b>
    `,
        {
            parse_mode: "HTML",
            reply_markup: phone_keyboard,
        }
    );
    ctx = await conversation.wait();
    if (!ctx.message?.contact) {
        do {
            await ctx.reply(
                `
<b>⚠️ Noto'g'ri ma'lumot kiritildi</b> 
            
<i>📞 Telefon raqamingizni yuboring!</i>`,
                {
                    parse_mode: "HTML",
                }
            );
            ctx = await conversation.wait();
        } while (!ctx.message?.contact);
    }
    conversation.session.session_db.client.phone =
        ctx.message.contact.phone_number;

    let data = conversation.session.session_db.client;
    data.chat_id = ctx.from.id;

    let [error, user] = await chek_user({data});
    if (user?.status) {
        await ctx.reply(
            `
        ${user.message}
        `,
            {
                reply_markup: {remove_keyboard: true},
            }
        );
        await main_menu_conversation(conversation, ctx);
    } else {
        await ctx.reply(
            `
        ${user.message}
        `,
            {
                reply_markup: {remove_keyboard: true},
            }
        );

        let re_register = new Keyboard()
            .text("🔄 Qayta ro'yhatdan o'tish")
            .resized();

        await ctx.reply(
            `
        <i>Ma'lumotlarni qayta kirish uchun <b>🔄 Qayta ro'yhatdan o'tish</b> tugmasini bosing</i>
        `,
            {
                parse_mode: "HTML",
                reply_markup: re_register,
            }
        );
    }
}

async function salary_show_conversation(conversation, ctx) {
    let years_list = new Keyboard()
        .text("2023")
        .text("2024")
        .row()
        .text("2025")
        .text("2026")
        .row()
        .text("🔴 Bekor qilish")
        .resized();
    await ctx.reply("Yilni tanlang", {
        reply_markup: years_list,
        parse_mode: "HTML",
    });
    ctx = await conversation.wait();
    if (!(ctx.message?.text && ctx.message?.text.length == 4)) {
        do {
            await ctx.reply("Yilni tanlang", {
                parse_mode: "HTML",
                reply_markup: years_list,
            });
            ctx = await conversation.wait();
        } while (!(ctx.message?.text && ctx.message?.text.length == 4));
    }
    conversation.session.session_db.salary.year = ctx.message.text;

    let month_list = new Keyboard()
        .text("Yanvar")
        .text("Fevral")
        .text("Mart")
        .text("Aprel")
        .row()
        .text("May")
        .text("Iyun")
        .text("Iyul")
        .text("Avgust")
        .row()
        .text("Sentyabr")
        .text("Oktyabr")
        .text("Noyabr")
        .text("Dekabr")
        .row()
        .text("🔴 Bekor qilish")
        .resized();

    await ctx.reply("Oyni tanlang", {
        reply_markup: month_list,
    });
    ctx = await conversation.wait();
    let months = [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentyabr",
        "Oktyabr",
        "Noyabr",
        "Dekabr",
    ];
    if (!months.includes(ctx.message?.text)) {
        do {
            await ctx.reply("Oyni tanlang", {
                parse_mode: "HTML",
                reply_markup: month_list,
            });
            ctx = await conversation.wait();
        } while (!months.includes(ctx.message?.text));
    }
    let select_month = ctx.message?.text;
    for (let i = 0; i < months.length; i++) {
        if (months[i] == select_month) {
            conversation.session.session_db.salary.month = i + 1;
        }
    }

    let data = conversation.session.session_db.salary;
    data.chat_id = ctx.from.id;
    let [error, res] = await chek_user_salary({data});
    await ctx.reply(res.message, {
        parse_mode: "HTML",
    });
    await main_menu_conversation(conversation, ctx);
}

async function main_menu_conversation(conversation, ctx) {
    let main_menu = new Keyboard()
        .text("💰 Ish haqi ma'lumotlarim")
        .row()
        .text("⚙️ Sozlamalar")
        .text("☎️ Kontaktlar")
        .row()
        .text("ℹ️ Biz haqimizda")
        .resized();

    await ctx.reply("⚡️ Asosiy menu ⚡️", {
        reply_markup: main_menu,
    });
    return;
}

const language_menu = new Menu("language_menu").dynamic(async (ctx, range) => {
    let list = [
        {
            name: "language_uz",
            key: "uz",
        },
        {
            name: "language_ru",
            key: "ru",
        },
    ];
    list.forEach((item) => {
        range
            .text(ctx.t(item.name), async (ctx) => {
                await ctx.answerCallbackQuery();
                await ctx.i18n.setLocale(item.key);
                data = {
                    user_id: ctx.from.id,
                    lang: item.key,
                };
                await set_user_lang(data);
                await ctx.deleteMessage();
            })
            .row();
    });
});
pm.use(language_menu);

const organization_menu = new Menu("organization_menu").dynamic(
    async (ctx, range) => {
        let [error, list] = await get_organizations();

        list.forEach((item) => {
            range
                .text(item.name, async (ctx) => {
                    await ctx.answerCallbackQuery();
                    await ctx.deleteMessage();
                    ctx.session.session_db.client.organization_id = item.id;
                    await ctx.conversation.enter("register_conversations");
                })
                .row();
        });
    }
);
pm.use(organization_menu);
pm.command("start", async (ctx) => {
    let [error, res] = await chek_register_user({
        data: {chat_id: ctx.from.id},
    });
    if (res.status) {
        await ctx.conversation.enter("main_menu_conversation");
    } else {
        await ctx.reply(
            `
        👋 Salom ${ctx.from.first_name}. Oylik maosh botiga xush kelibsiz!    
            `,
            {
                parse_mode: "HTML",
                reply_markup: {
                    remove_keyboard: true,
                },
            }
        );
        await ctx.reply(
            `
    <b>Korxongizni tanlang!</b>    
        `,
            {
                reply_markup: organization_menu,
                parse_mode: "HTML",
            }
        );
    }

    // let user = await check_user(ctx.from.id);
    // data = {
    //     user_id: ctx.from.id,
    //     full_name: ctx.from.first_name,
    //     username: ctx.from.username || null,
    //     active: true
    // }
    // if (user) {
    //     await ctx.i18n.setLocale(user.lang);
    //     data.lang = user.lang;
    //     await register_user(data);
    // } else {
    //     lang = await ctx.i18n.getLocale()
    //     data.lang = lang;
    //     await register_user(data);
    // }
    // await ctx.reply(ctx.t("start_hello_msg", {
    //     full_name: ctx.from.first_name,
    //     organization_name: "Fashion Market"
    // }), {
    //     parse_mode: "HTML",
    //     reply_markup: language_menu
    // })
});

pm.hears("💰 Ish haqi ma'lumotlarim", async (ctx) => {
    await ctx.conversation.enter("salary_show_conversation");
});

pm.hears("⚙️ Sozlamalar", async (ctx) => {
    await ctx.reply("🛠 Bu bo'lim tez orqada ishga tushishi reja qilingan");
});
pm.hears("☎️ Kontaktlar", async (ctx) => {
    await ctx.reply("🛠 Bu bo'lim tez orqada ishga tushishi reja qilingan");
});
pm.hears("ℹ️ Biz haqimizda", async (ctx) => {
    await ctx.reply("🛠 Bu bo'lim tez orqada ishga tushishi reja qilingan");
});
pm.hears("🔴 Bekor qilish", async (ctx) => {
    await ctx.conversation.enter("main_menu_conversation");
});
pm.hears("🔄 Qayta ro'yhatdan o'tish", async (ctx) => {
    await ctx.reply(
        `
    <b>Korxongizni tanlang!</b>    
        `,
        {
            reply_markup: organization_menu,
            parse_mode: "HTML",
        }
    );
});

module.exports = {client_bot};
