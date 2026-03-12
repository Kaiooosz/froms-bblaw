import os
import glob
from dotenv import load_dotenv

from PyPDF2 import PdfReader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings

load_dotenv()

DOCS_DIR = r"C:\Users\victo\Documents\Prog\froms-bblaw\Documentos\Kaio_"
VECTOR_DB_PATH = "faiss_index"
# Multilingual model — better for Portuguese documents
EMBEDDING_MODEL = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"


def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
    except Exception:
        pass
    return text


import xml.etree.ElementTree as ET
import zipfile


def extract_text_from_docx(docx_path):
    try:
        text_list = []
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            for node in tree.iter():
                if node.tag.endswith('}t') and node.text:
                    text_list.append(node.text)
        return "\n".join(text_list)
    except Exception:
        return ""


def create_vector_db():
    print(">>> Loading documents...")
    documents = []

    docx_files = glob.glob(os.path.join(DOCS_DIR, "*.docx"))
    print(f"Found {len(docx_files)} DOCX files")
    for file in docx_files:
        print("Processing:", os.path.basename(file).encode('ascii', 'ignore').decode())
        text = extract_text_from_docx(file)
        if text.strip():
            documents.append({"text": text, "source": os.path.basename(file)})

    pdf_files = glob.glob(os.path.join(DOCS_DIR, "*.pdf"))
    print(f"Found {len(pdf_files)} PDF files")
    for file in pdf_files:
        text = extract_text_from_pdf(file)
        if text.strip():
            documents.append({"text": text, "source": os.path.basename(file)})

    print(f"Total documents loaded: {len(documents)}")
    print("Splitting texts into chunks...")

    chunks = []
    metadatas = []
    chunk_size = 1000
    overlap = 200

    for doc in documents:
        text = doc["text"]
        start = 0
        while start < len(text):
            chunks.append(text[start:start + chunk_size])
            metadatas.append({"source": doc["source"]})
            start += chunk_size - overlap

    print(f"Created {len(chunks)} chunks.")
    print(f"Generating embeddings with '{EMBEDDING_MODEL}' (multilingual — this may take a while)...")

    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
    vectorstore = FAISS.from_texts(texts=chunks, embedding=embeddings, metadatas=metadatas)
    vectorstore.save_local(VECTOR_DB_PATH)
    print(f"Vector database saved to {VECTOR_DB_PATH}")


if __name__ == "__main__":
    create_vector_db()
