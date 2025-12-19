-- Enable Vector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- Shared Memory Table ("The Hive Mind")
-- accessible by all bots belonging to the same user
CREATE TABLE IF NOT EXISTS hive_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536), -- Compatible with OpenAI text-embedding-ada-002
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Ownership
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL, -- traceback which bot "learned" this
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Index (IVFFlat for speed)
CREATE INDEX IF NOT EXISTS hive_memory_embedding_idx ON hive_memory 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- RLS Policies
ALTER TABLE hive_memory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their hive memory"
    ON hive_memory
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
