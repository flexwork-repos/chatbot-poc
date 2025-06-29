import chromadb
from chromadb.config import Settings
import PyPDF2
import docx
import pandas as pd
import json
import hashlib
import re
import io
from datetime import datetime
import traceback
from typing import Dict, Any, List, Tuple

class ChromaDBManager:
    def __init__(self):
        self.chroma_client = None
        self.collection = None
        self.init_chromadb()
    
    def init_chromadb(self):
        """Initialize ChromaDB client and collection"""
        try:
            # Create persistent ChromaDB client
            self.chroma_client = chromadb.PersistentClient(
                path="./chroma_db",
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Get or create collection
            self.collection = self.chroma_client.get_or_create_collection(
                name="documents",
                metadata={"description": "Document embeddings for RAG"}
            )
            
            print("ChromaDB initialized successfully")
            
        except Exception as e:
            print(f"ChromaDB initialization failed: {str(e)}")
            raise e
    
    def clean_text(self, text: str) -> str:
        """Clean text by removing unwanted characters"""
        # Remove non-breaking spaces, zero-width spaces, and control characters
        text = text.replace('\xa0', ' ')
        text = text.replace('\u200b', '')
        text = re.sub(r'[\x00-\x1F\x7F]', '', text)  # Remove control characters
        text = re.sub(r'\s+', ' ', text)  # Replace multiple whitespace with single space
        return text.strip()
    
    def extract_text_from_file(self, file_content: bytes, filename: str) -> str:
        """Extract text from various file formats"""
        text = ""
        file_extension = filename.split('.')[-1].lower()
        
        try:
            if file_extension == 'pdf':
                pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
            
            elif file_extension in ['docx', 'doc']:
                doc = docx.Document(io.BytesIO(file_content))
                for paragraph in doc.paragraphs:
                    text += paragraph.text + "\n"
            
            elif file_extension == 'txt':
                text = file_content.decode("utf-8")
            
            elif file_extension == 'csv':
                df = pd.read_csv(io.BytesIO(file_content))
                text = df.to_string()
            
            elif file_extension == 'json':
                json_data = json.loads(file_content.decode("utf-8"))
                text = json.dumps(json_data, indent=2)
            
            else:
                raise ValueError(f"Unsupported file format: {file_extension}")
        
        except Exception as e:
            print(f"Error extracting text from {filename}: {str(e)}")
            traceback.print_exc()
            # Use standard exception instead of FastAPI specific
            raise Exception(f"Error extracting text from {filename}: {str(e)}")
        
        return text.strip()
    
    def add_document_to_db(self, text: str, filename: str, metadata: Dict[str, Any] = None) -> Tuple[bool, int]:
        """Add text document to ChromaDB with chunking"""
        try:
            # Clean the text
            text = self.clean_text(text)
            
            if not text:
                return False, 0
            
            # Create unique ID for the document
            doc_id = hashlib.md5(f"{filename}_{datetime.now().isoformat()}".encode()).hexdigest()
            
            # Prepare metadata
            doc_metadata = {
                "filename": filename,
                "upload_date": datetime.now().isoformat(),
                "text_length": len(text)
            }
            if metadata:
                doc_metadata.update(metadata)
            
            # Split text into chunks (adjust chunk_size as needed)
            chunk_size = 1000  # Increased chunk size for better context
            overlap = 100      # Add overlap between chunks
            chunks = []
            
            for i in range(0, len(text), chunk_size - overlap):
                chunk = text[i:i + chunk_size]
                if chunk.strip():  # Only add non-empty chunks
                    chunks.append(chunk.strip())
            
            # Add chunks to ChromaDB
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                chunk_id = f"{doc_id}_chunk_{i}"
                chunk_metadata = doc_metadata.copy()
                chunk_metadata["chunk_index"] = i
                chunk_metadata["total_chunks"] = len(chunks)
                
                documents.append(chunk)
                metadatas.append(chunk_metadata)
                ids.append(chunk_id)
            
            # Batch add to collection
            if documents:
                self.collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
            
            return True, len(chunks)
        
        except Exception as e:
            print(f"Error adding document to ChromaDB: {str(e)}")
            traceback.print_exc()
            return False, 0
    
    def search_documents(self, query: str, n_results: int = 5, metadata_filter: Dict[str, Any] = None) -> Dict[str, Any]:
        """Search for similar documents in ChromaDB"""
        try:
            query_params = {
                "query_texts": [query],
                "n_results": min(n_results, 10)
            }
            
            if metadata_filter:
                query_params["where"] = metadata_filter
            
            results = self.collection.query(**query_params)
            
            return {
                "documents": results.get('documents', [[]])[0],
                "metadatas": results.get('metadatas', [[]])[0],
                "distances": results.get('distances', [[]])[0],
                "ids": results.get('ids', [[]])[0]
            }
        except Exception as e:
            print(f"Error searching ChromaDB: {str(e)}")
            traceback.print_exc()
            return {
                "error": f"Search failed: {str(e)}",
                "documents": [],
                "metadatas": [],
                "distances": [],
                "ids": []
            }
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the collection"""
        try:
            count = self.collection.count()
            return {
                "collection_name": self.collection.name,
                "document_count": count,
                "metadata": self.collection.metadata
            }
        except Exception as e:
            print(f"Error getting collection info: {str(e)}")
            return {"error": str(e)}
    
    def delete_document(self, document_id: str) -> bool:
        """Delete a document and all its chunks"""
        try:
            # Find all chunks for this document
            results = self.collection.get(
                where={"filename": document_id}
            )
            
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                return True
            return False
        
        except Exception as e:
            print(f"Error deleting document: {str(e)}")
            return False
    
    def reset_collection(self) -> bool:
        """Reset/clear the entire collection"""
        try:
            self.chroma_client.delete_collection("documents")
            self.collection = self.chroma_client.get_or_create_collection(
                name="documents",
                metadata={"description": "Document embeddings for RAG"}
            )
            return True
        except Exception as e:
            print(f"Error resetting collection: {str(e)}")
            return False
