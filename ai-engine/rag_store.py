"""
rag_store.py
FAISS RAG Pipeline
"""

import os
import json
import time
from typing import Optional

from dotenv import load_dotenv
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Load environment variables
load_dotenv()


DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
FAISS_INDEX_PATH = os.path.join(DATA_DIR, "faiss_index")
CHUNK_SIZE = 500
CHUNK_OVERLAP = 80
RETRIEVAL_K = 4



def _search_web(queries: list[str], max_results_per_query: int = 5) -> list[dict]:
    """
    Uses DuckDuckGo (ddgs) to search the web for each query.
    Returns a list of {title, url/href, body/snippet} dicts.
    Falls back gracefully if the package is unavailable.
    """
    results = []

    # Try the new 'ddgs' package first, then legacy 'duckduckgo_search'
    DDGS = None
    try:
        from ddgs import DDGS as _DDGS
        DDGS = _DDGS
    except ImportError:
        try:
            from duckduckgo_search import DDGS as _DDGS
            DDGS = _DDGS
        except ImportError:
            print("[Search] Neither 'ddgs' nor 'duckduckgo_search' installed. Skipping web search.")
            return results

    try:
        with DDGS() as ddgs:
            for query in queries:
                print(f"  [Search] Querying: '{query}'")
                try:
                    hits = list(ddgs.text(query, max_results=max_results_per_query))
                    results.extend(hits)
                    print(f"  [Search] Got {len(hits)} results")
                    time.sleep(0.5)  # Rate limit courtesy
                except Exception as e:
                    print(f"  [Search] Query failed: {e}")
    except Exception as e:
        print(f"[Search] DuckDuckGo unavailable: {e}")

    return results


def _search_arxiv(queries: list[str], max_docs: int = 2) -> list:
    """
    Uses the ArxivLoader to fetch academic papers matching queries.
    Returns LangChain Document objects.
    """
    docs = []
    try:
        from langchain_community.document_loaders import ArxivLoader
        for query in queries:
            print(f"  [Arxiv] Searching: '{query}'")
            try:
                loader = ArxivLoader(
                    query=query,
                    load_max_docs=max_docs,
                    max_downloaded_bytes=5_000_000,
                )
                loaded = loader.load()
                docs.extend(loaded)
                print(f"  [Arxiv] Loaded {len(loaded)} papers")
            except Exception as e:
                print(f"  [Arxiv] Query failed: {e}")
    except ImportError:
        print("[Arxiv] arxiv package not installed. Skipping.")

    return docs


def _generate_search_queries(topic: str) -> dict:
    """
    Uses a local LLM (Ollama) to generate optimal search queries
    for fetching relevant data on a topic. If Ollama is unavailable,
    uses deterministic fallback queries.

    Returns:
        {
            "web_queries": ["query1", "query2", ...],
            "arxiv_queries": ["query1", ...]
        }
    """
    # Try LLM-powered query generation
    try:
        import ollama as _ollama
        response = _ollama.chat(
            model="llama3.2",
            messages=[{
                "role": "user",
                "content": (
                    f"You are a research assistant. Generate optimized search queries to build a comprehensive "
                    f"knowledge base on the topic: '{topic}'. "
                    f"Return ONLY valid JSON with two keys:\n"
                    f"1. \"web_queries\": a list of 6-8 diverse web search queries targeting authoritative sources "
                    f"(government disaster agencies, Wikipedia, NDMA, FEMA, WHO, relief organizations, news). "
                    f"Cover: safety procedures, historical events, warning systems, evacuation, first aid, infrastructure.\n"
                    f"2. \"arxiv_queries\": a list of 2-3 academic search queries for relevant research papers.\n"
                    f"Be specific. Target Indian flood data, global best practices, and prediction models."
                )
            }],
            format="json"
        )
        parsed = json.loads(response["message"]["content"])
        web_q = parsed.get("web_queries", [])
        arxiv_q = parsed.get("arxiv_queries", [])
        if web_q:
            print(f"[QueryGen] LLM generated {len(web_q)} web + {len(arxiv_q)} arxiv queries")
            return {"web_queries": web_q, "arxiv_queries": arxiv_q}
    except Exception as e:
        print(f"[QueryGen] LLM query generation failed: {e}")

    # Deterministic fallback queries
    print("[QueryGen] Using deterministic fallback queries")
    return {
        "web_queries": [
            f"{topic} disaster management guidelines India NDMA",
            f"{topic} safety procedures evacuation protocol",
            f"{topic} warning system early detection",
            f"{topic} historical events India casualties damage",
            f"{topic} first aid emergency rescue operations",
            f"{topic} infrastructure damage assessment recovery",
            f"{topic} prediction weather monitoring system",
            f"{topic} relief operations shelter management",
        ],
        "arxiv_queries": [
            f"{topic} prediction machine learning",
            f"{topic} risk assessment natural disaster",
        ]
    }


def _load_urls(urls: list[str]) -> list:
    """
    Fetches full page content from a list of URLs using WebBaseLoader.
    Filters out duplicates, PDFs, and dead links gracefully.
    """
    docs = []
    if not urls:
        return docs

    # Deduplicate and filter PDFs
    unique_urls = []
    for u in urls:
        if u not in unique_urls and not u.lower().endswith(".pdf"):
            unique_urls.append(u)
            
    print(f"  [WebLoader] Fetching {len(unique_urls)} unique non-PDF URLs...")

    try:
        from langchain_community.document_loaders import WebBaseLoader
        # Load one by one so a single failure doesn't crash the batch
        import warnings
        with warnings.catch_warnings():
            warnings.simplefilter("ignore") # ignore insecure request warnings
            for i, url in enumerate(unique_urls):
                try:
                    loader = WebBaseLoader([url])
                    loader.requests_kwargs = {"timeout": 10, "verify": False}
                    loaded = loader.load()
                    docs.extend(loaded)
                    print(f"  [WebLoader] [{i+1}/{len(unique_urls)}] Loaded: {url[:60]}...")
                except Exception as e:
                    print(f"  [WebLoader] [{i+1}/{len(unique_urls)}] Failed: {url[:60]}... (Error: {e})")
    except ImportError:
        print("[WebLoader] beautifulsoup4 not installed. Skipping web loading.")

    return docs



def fetch_dynamic_data(topic: str = "flood disaster management") -> list:
    """
    Master function that orchestrates the full dynamic data pipeline:
    1. LLM generates search queries
    2. DuckDuckGo finds real URLs
    3. ArxivLoader fetches papers
    4. WebBaseLoader fetches page content
    5. Returns all documents ready for chunking

    No static files needed. Everything is live.
    """
    print(f"\n{'='*60}")
    print(f"[Dynamic RAG] Starting data ingestion for: '{topic}'")
    print(f"{'='*60}")

    all_docs = []

    # Step 1: Generate search queries
    queries = _generate_search_queries(topic)
    web_queries = queries["web_queries"]
    arxiv_queries = queries["arxiv_queries"]

    # Step 2: Web search → get URLs
    print(f"\n[Phase 1] Web Search ({len(web_queries)} queries)...")
    search_results = _search_web(web_queries)
    urls = [r.get("href") or r.get("url", "") for r in search_results if r.get("href") or r.get("url")]
    print(f"[Phase 1] Discovered {len(urls)} URLs from web search")

    # Step 3: Fetch full page content from URLs
    if urls:
        print(f"\n[Phase 2] Fetching full page content...")
        web_docs = _load_urls(urls)
        all_docs.extend(web_docs)
        print(f"[Phase 2] Loaded {len(web_docs)} web documents")

    # Step 4: Arxiv papers
    if arxiv_queries:
        print(f"\n[Phase 3] Arxiv Papers ({len(arxiv_queries)} queries)...")
        arxiv_docs = _search_arxiv(arxiv_queries)
        all_docs.extend(arxiv_docs)
        print(f"[Phase 3] Loaded {len(arxiv_docs)} arxiv papers")

    print(f"\n{'='*60}")
    print(f"[Dynamic RAG] Total documents ingested: {len(all_docs)}")
    total_chars = sum(len(d.page_content) for d in all_docs)
    print(f"[Dynamic RAG] Total content: {total_chars:,} characters ({total_chars // 1000}KB)")
    print(f"{'='*60}\n")

    return all_docs



def _get_embeddings():
    """
    Returns the best available embedding model.
    Tries Ollama → Google → HuggingFace → lightweight BoW fallback.
    """
    # Attempt 1: Ollama Embeddings (local, free)
    try:
        from langchain_ollama import OllamaEmbeddings
        embeddings = OllamaEmbeddings(model="llama3.2")
        embeddings.embed_query("test")
        print("[RAG] Using OllamaEmbeddings (local)")
        return embeddings
    except Exception as e:
        print(f"[RAG] OllamaEmbeddings not available: {e}")

    # Attempt 2: Google Generative AI Embeddings (cloud)
    try:
        google_key = os.environ.get("GOOGLE_API_KEY", "")
        if google_key:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=google_key
            )
            print("[RAG] Using GoogleGenerativeAIEmbeddings (cloud)")
            return embeddings
    except Exception as e:
        print(f"[RAG] GoogleGenerativeAIEmbeddings not available: {e}")

    # Attempt 3: HuggingFace Embeddings
    try:
        from langchain_community.embeddings import HuggingFaceEmbeddings
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": True}
        )
        print("[RAG] Using HuggingFaceEmbeddings (local)")
        return embeddings
    except Exception as e:
        print(f"[RAG] HuggingFaceEmbeddings not available: {e}")

    # Attempt 4: Lightweight fallback
    print("[RAG] Using lightweight BoW fallback embeddings")
    return _BowEmbeddings()


class _BowEmbeddings:
    """
    Ultra-lightweight bag-of-words embedding fallback.
    Implements __call__ for FAISS compatibility.
    """
    VOCAB = [
        "flood", "water", "rain", "rainfall", "precipitation", "storm",
        "river", "dam", "drainage", "evacuation", "shelter", "rescue",
        "warning", "emergency", "safety", "risk", "critical", "high",
        "moderate", "low", "wind", "gust", "temperature", "humidity",
        "monsoon", "surge", "inundation", "landslide", "bridge", "road",
        "casualty", "injury", "missing", "affected", "population", "zone",
        "relief", "recovery", "aid", "first", "medical", "contamination",
        "sanitation", "power", "electrical", "vehicle", "route", "authority",
        "ndma", "communication", "alert", "forecast", "level", "stage",
        "major", "minor", "record", "action", "prepare", "kit", "supply",
        "food", "drinking", "purify", "boil", "chlorine", "damage", "assess",
        "infrastructure", "rebuild", "insurance", "agriculture", "crop",
    ]

    def embed_documents(self, texts):
        return [self._embed(t) for t in texts]

    def embed_query(self, text):
        return self._embed(text)

    def __call__(self, text):
        if isinstance(text, list):
            return self.embed_documents(text)
        return self.embed_query(text)

    def _embed(self, text):
        text_lower = text.lower()
        vec = [0.0] * len(self.VOCAB)
        for i, word in enumerate(self.VOCAB):
            vec[i] = float(text_lower.count(word))
        norm = sum(v * v for v in vec) ** 0.5
        if norm > 0:
            vec = [v / norm for v in vec]
        return vec



_embeddings_instance = None

def _cached_embeddings():
    global _embeddings_instance
    if _embeddings_instance is None:
        _embeddings_instance = _get_embeddings()
    return _embeddings_instance


def build_faiss_index(force_rebuild: bool = False, topic: str = "flood disaster management"):
    """
    Build FAISS index from dynamically fetched data.
    If the index exists on disk and force_rebuild is False, loads from disk.

    When force_rebuild is True:
    1. LLM generates search queries for the topic
    2. DuckDuckGo finds real URLs + Arxiv finds papers
    3. WebBaseLoader fetches full content
    4. Everything is chunked, embedded, and stored in FAISS
    """
    from langchain_community.vectorstores import FAISS

    embeddings = _cached_embeddings()

    # Load from disk if available
    if not force_rebuild and os.path.exists(FAISS_INDEX_PATH):
        try:
            print("[RAG] Loading existing FAISS index from disk...")
            return FAISS.load_local(
                FAISS_INDEX_PATH,
                embeddings,
                allow_dangerous_deserialization=True
            )
        except Exception as e:
            print(f"[RAG] Failed to load index from disk: {e}")
            print("[RAG] Rebuilding index...")

    # Fetch data dynamically
    docs = fetch_dynamic_data(topic)

    if not docs:
        print("[RAG] No documents fetched. Creating minimal fallback index.")
        return FAISS.from_texts(
            [
                "Flood safety: Move to higher ground during flooding. Follow local emergency authority instructions.",
                "During a flood warning, prepare an emergency kit with water, food, medications, and important documents.",
                "Never walk or drive through floodwater. Turn around, don't drown.",
                "After a flood, avoid contaminated water and check for structural damage before entering buildings.",
            ],
            embeddings
        )

    # Chunk all documents
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = text_splitter.split_documents(docs)
    print(f"[RAG] Created {len(chunks)} chunks from {len(docs)} documents.")

    # Create FAISS index
    vectorstore = FAISS.from_documents(chunks, embeddings)

    # Persist to disk
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        vectorstore.save_local(FAISS_INDEX_PATH)
        print(f"[RAG] FAISS index saved to {FAISS_INDEX_PATH}")
    except Exception as e:
        print(f"[RAG] Could not save index to disk: {e}")

    return vectorstore



_vectorstore = None

def get_retriever():
    """
    Returns a FAISS-backed retriever with top-k similarity search.
    The vectorstore is loaded/built once and cached.
    """
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = build_faiss_index()
    return _vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": RETRIEVAL_K}
    )


def retrieve_context(query: str) -> str:
    """
    Retrieve relevant context for a query from the dynamic FAISS index.
    Returns concatenated document text ready for prompt injection.
    """
    try:
        retriever = get_retriever()
        docs = retriever.invoke(query)
        if not docs:
            return "No relevant information found in knowledge base."
        return "\n\n---\n\n".join([doc.page_content for doc in docs])
    except Exception as e:
        print(f"[RAG] Retrieval error: {e}")
        return "Knowledge base retrieval encountered an error."



if __name__ == "__main__":
    import sys

    topic = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "flood disaster management India"

    print(f"\n{'#'*60}")
    print(f"# Relief.AI — Dynamic RAG Index Builder")
    print(f"# Topic: {topic}")
    print(f"{'#'*60}\n")

    vs = build_faiss_index(force_rebuild=True, topic=topic)

    # Test retrieval
    test_queries = [
        "What should I do during a flash flood?",
        "Mumbai flood history and casualties",
        "Evacuation procedures during critical flood risk",
    ]
    print(f"\n{'='*60}")
    print("RETRIEVAL TESTS")
    print(f"{'='*60}")

    retriever = vs.as_retriever(search_kwargs={"k": 2})
    for q in test_queries:
        results = retriever.invoke(q)
        print(f"\nQuery: '{q}'")
        print(f"Retrieved {len(results)} documents:")
        for i, doc in enumerate(results):
            source = doc.metadata.get("source", "unknown")[:60]
            print(f"  [{i+1}] ({source}) {doc.page_content[:100]}...")
