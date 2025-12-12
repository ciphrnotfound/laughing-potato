-- Enable pgvector extension
create extension if not exists vector;

-- Knowledge Bases (The "Brain" containers)
create table if not exists knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Documents (Files or text sources within a KB)
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  kb_id uuid references knowledge_bases(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  source_type text default 'text', -- 'text', 'pdf', 'url'
  content_source_url text, -- If file/url
  metadata jsonb,
  created_at timestamptz default now()
);

-- Document Chunks (The embeddings)
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade not null,
  content text not null, -- The actual text chunk
  embedding vector(1536), -- OpenAI Ada-002 / 3-small dimension
  chunk_index int,
  metadata jsonb
);

-- Index for fast similarity search
create index on document_chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Function to match documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  p_kb_id uuid
)
returns table (
  id uuid,
  content text,
  similarity float,
  document_title text
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    1 - (document_chunks.embedding <=> query_embedding) as similarity,
    documents.title as document_title
  from document_chunks
  join documents on document_chunks.document_id = documents.id
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  and documents.kb_id = p_kb_id
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;
