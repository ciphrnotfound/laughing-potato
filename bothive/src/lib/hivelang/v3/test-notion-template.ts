
import { Tokenizer } from './tokenizer';
import { Parser } from './parser';

const NOTION_ASSISTANT_CODE = `bot NotionAssistant
  description "A smart bot that creates Notion pages and remembers your workspace structure."
  
  memory session
    var parentPageId string
  end

  # --- Setting the Parent ID ---
  on input when input.message contains "Page ID:"
    # This captures the ID and saves it to session memory
    call ai.generate with {
        prompt: "Extract the alphanumeric ID from: " + input.message,
        format: "text"
    } as id
    set $parentPageId = id
    say "🔒 Root Page ID locked: " + $parentPageId
  end

  # --- Creating a Page ---
  on input when input.message contains "create page" or input.message contains "new page"
    say "📝 Crafting your new Notion page..."
    
    call integrations.createNotionPage with {
      title: input.title ?? "New Notion Page",
      content: input.content ?? "Generated via Hivelang v3.",
      parent_page_id: $parentPageId
    } as res
    
    if res.success
      say "✅ Successfully created! View it here: " + res.url
    else
      say "⚠️ Error: " + res.output
      say "Tip: You can set a parent page by saying: 'Page ID: YOUR_NOTION_ID'"
    end
  end

  # Fallback
  on input
    call general.respond with { prompt: input.message } as response
    say response.output
  end
end`;

async function test() {
  console.log("Testing Notion Assistant Template Parsing...");
  try {
    const tokenizer = new Tokenizer(NOTION_ASSISTANT_CODE);
    const tokens = tokenizer.tokenize();
    console.log("✅ Tokenization successful");

    const parser = new Parser(tokens);
    const ast = parser.parse();
    console.log("✅ Parsing successful");
    // console.log(JSON.stringify(ast, null, 2));
  } catch (e: any) {
    console.error("❌ Failed:", e.message);
    process.exit(1);
  }
}

test();
