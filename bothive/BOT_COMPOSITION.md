# Bot Composition Guide

##  How to Compose Bots

You can now create bots that call other bots using the `bot.call` tool!

### Example: Modular Thanksgiving Planner

**Bot 1: Shopping List Generator**
```hivelang
bot ShoppingListGenerator
  description "Creates a Thanksgiving shopping list"

  on input
    call agent.analyze with {
      context: "Generate shopping list for Thanksgiving dinner for " + input.guest_count + " guests"
    } as list
    
    call integrations.createNotionPage with {
      title: "Thanksgiving Shopping List",
      content: list.output
    } as page
    
    say page.url
  end
end
```

**Bot 2: Email Inviter**
```hivelang
bot EmailInviter
  description "Sends Thanksgiving invitations"

  on input
    call email.sendBulk with {
      recipients: input.family_emails,
      subject: "Thanksgiving Invitation 🦃",
      body: "Join us for Thanksgiving dinner on " + input.date + "! Looking forward to seeing you."
    } as result
    
    say "Sent " + result.sent_count + " invitations"
  end
end
```

**Bot 3: Ultimate Thanksgiving (Composition)**
```hivelang
bot UltimateThanksgiving
  description "Complete Thanksgiving planning automation"

  on input
    # Step 1: Create shopping list
    call bot.call with {
      botName: "ShoppingListGenerator",
      input: { guest_count: input.guests }
    } as shopping
    
    # Step 2: Send invitations
    call bot.call with {
      botName: "EmailInviter",
      input: {
        family_emails: input.family_emails,
        date: input.date
      }
    } as invites
    
    # Step 3: Schedule calendar event
    call calendar.createEvent with {
      title: "Thanksgiving Dinner",
      slot: {
        start: input.date + "T17:00:00Z",
        end: input.date + "T21:00:00Z"
      },
      attendees: input.family_emails
    } as event
    
    say "✅ Thanksgiving Planned!\n\nShopping: " + shopping.output + "\nInvites: " + invites.output + "\nCalendar: " + event.link
  end
end
```

### How It Works

1. **Create modular bots** - Each bot does one thing well
2. **Save them to your workspace**
3. **Compose them** using `bot.call`
4. **Reuse** - Use the same bots in multiple workflows

### Syntax

```
call bot.call with {
  botName: "BotNameHere",
  input: {
    field1: "value",
    field2: input.data
  }
} as result
```

The result contains:
- `result.output` - The bot's final output
- `result.botName` - Name of the executed bot
- `result.steps` - Number of reasoning steps

### Tips

- **Bot names must match exactly** - Use the exact name from your workspace
- **Pass necessary input** - Each bot defines what input it needs
- **Chain results** - Use one bot's output as input to another
- **Error handling** - If a bot fails, the composition will show an error

Now you can build complex workflows from simple, reusable bots! 🚀
