const i18n = require('./i18n');

module.exports = [{
    "intent": "Greeting",
    "replies": [
        i18n.Welcome
    ]
},
{
    "intent": "Goodbye",
    "replies": [
        i18n.GoodByeResponse,
        i18n.GoodByeResponse2
    ]
},
{
    "intent": "Complement",
    "replies": [
        i18n.ComplementIntentReply1,
        i18n.ComplementIntentReply2
    ]
},
{
    "intent": "ThankYou",
    "replies": [
        i18n.ThankYouResponse,
        i18n.ThankYouResponse2
    ]
},
{
    "intent": "Help",
    "replies": [
        i18n.HelpIntentReply
    ]
},
{
        "intent": "BotName",
        "replies": [
            i18n.BotNameIntentReply1,
            i18n.BotNameIntentReply2
        ]
    },
    {
        "intent": "BotAge",
        "replies": [
            i18n.BotAgeIntentReply1,
            i18n.BotAgeIntentReply2
        ]
    },
    {
        "intent": "BotCreator",
        "replies": [
            i18n.BotAgeIntentReply1,
            i18n.BotAgeIntentReply2
        ]
    },
    {
        "intent": "B1MovieStar",
        "replies": [
            i18n.B1MoiveStarIntentReply1,
            i18n.B1MoiveStarIntentReply2
        ]
    },
    {
        "intent": "InvalidAttachment",
        "replies": [
            i18n.InvalidAttachmentTypeReply
        ]
    }
];