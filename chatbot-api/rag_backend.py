from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import logging
import sys
import io
import traceback
import uuid
from datetime import datetime
from dotenv import load_dotenv
from openai import OpenAI
import pymysql
from pymysql.cursors import DictCursor

# Import ChromaDBManager from local file
from chromadb_manager import ChromaDBManager

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.WARNING,  # Changed from INFO to WARNING for production
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("flexwork-chatbot-api")

app = Flask(__name__)
# Configure CORS to allow all origins with comprehensive settings
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": "*",
        "expose_headers": "*",
        "supports_credentials": False,
        "max_age": 86400  # Cache preflight requests for 24 hours
    }
})

@app.route("/cb/api/test", methods=["GET"])
def test_connection():
    """Simple endpoint to test if the backend is accessible"""
    return jsonify({
        "status": "success",
        "message": "Backend connection successful!",
        "timestamp": datetime.now().isoformat()
    })

# OpenAI API configuration
API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=API_KEY)

# Initialize ChromaDB manager
chroma_manager = ChromaDBManager()

# Database connection configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'flexwork_chatbot'),
    'charset': 'utf8mb4',
    'autocommit': True,
    'connect_timeout': 10,
    'read_timeout': 10,
    'write_timeout': 10
}

# Database connection function
def get_db_connection():
    try:
        connection = pymysql.connect(
            **DB_CONFIG,
            cursorclass=DictCursor
        )
        # Test the connection
        connection.ping(reconnect=True)
        return connection
    except pymysql.Error as e:
        logger.error(f"MySQL error: {e}")
        return None
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None
    
# Database initialization function
def init_database():
    """Initialize database and create tables if they don't exist"""
    try:
        conn = get_db_connection()
        if not conn:
            logger.error("Cannot initialize database - connection failed")
            return False
            
        with conn.cursor() as cursor:
            # Create user_selections table if it doesn't exist
            # Using the schema from database.sql
            create_table_query = """
            CREATE TABLE IF NOT EXISTS user_selections (
              id INT AUTO_INCREMENT PRIMARY KEY,
              session_id VARCHAR(36) NOT NULL UNIQUE,
              user_type ENUM('employer', 'student', 'freelancer') NOT NULL,
              name VARCHAR(100),
              email VARCHAR(100),
              phone VARCHAR(20),
              -- Common fields across all user types
              role VARCHAR(100),
              work_mode VARCHAR(50),
              -- Employer specific fields
              skills VARCHAR(255),
              employer_headcount_consultant VARCHAR(50),
              employer_project_size_consultant VARCHAR(100),
              employer_service VARCHAR(100),
              employer_start_time_consultant VARCHAR(50),
              employer_work_mode_consultant VARCHAR(50),
              chat_transcript TEXT,
              -- Student and freelancer specific fields
              student_option VARCHAR(100),
              student_training VARCHAR(255),
              freelancer_category VARCHAR(100),
              -- Status tracking
              verified BOOLEAN DEFAULT FALSE,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX (session_id),
              INDEX (user_type),
              INDEX (email)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """
            
            cursor.execute(create_table_query)
            logger.info("Database tables initialized successfully")
            
        conn.close()
        return True
        
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        return False

# Initialize database on startup
if not init_database():
    logger.warning("Database initialization failed - some features may not work")
    
@app.route("/cb/api/health", methods=["GET"])
def health_check():
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "services": {}
        }
        
        # Check database connection
        db_conn = get_db_connection()
        if db_conn:
            health_status["services"]["database"] = "healthy"
            db_conn.close()
        else:
            health_status["services"]["database"] = "unhealthy"
            health_status["status"] = "degraded"
        
        # Check ChromaDB
        if chroma_manager and chroma_manager.collection:
            try:
                chroma_manager.collection.count()
                health_status["services"]["chromadb"] = "healthy"
            except Exception as e:
                health_status["services"]["chromadb"] = f"unhealthy: {str(e)}"
                health_status["status"] = "degraded"
        else:
            health_status["services"]["chromadb"] = "not initialized"
            health_status["status"] = "degraded"
        
        # Check OpenAI API key
        if API_KEY:
            health_status["services"]["openai"] = "configured"
        else:
            health_status["services"]["openai"] = "not configured"
            health_status["status"] = "degraded"
        
        status_code = 200 if health_status["status"] == "healthy" else 503
        return jsonify(health_status), status_code
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return jsonify({
            "status": "error",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Groq chat endpoint with RAG integration
@app.route("/cb/api/groq/chat", methods=["POST"])
def chat_with_groq():
    try:
        payload = request.json or {}
        messages = payload.get("messages")
        use_rag = payload.get("use_rag", True)  # Default to using RAG
        model_name = payload.get("model_name", "gpt-4.1-nano")
        temperature = payload.get("temperature", 0.7)
        max_tokens = payload.get("max_tokens", 1024)
        
        if not messages:
            return jsonify({"error": "Messages are required"}), 400

        # Extract the latest user message for RAG context retrieval
        latest_user_message = ""
        for msg in reversed(messages):
            if msg.get("role") == "user":
                latest_user_message = msg.get("content", "")
                break
        
        # Get relevant context from ChromaDB if RAG is enabled
        context = ""
        if use_rag and latest_user_message:
            try:
                # Search for relevant documents
                search_results = chroma_manager.search_documents(
                    query=latest_user_message,
                    n_results=3  # Retrieve top 3 most relevant chunks
                )
                
                # Format the context from search results
                if search_results and "documents" in search_results:
                    context = "\n\nRelevant information from knowledge base:\n"
                    for i, doc in enumerate(search_results["documents"]):
                        context += f"Document {i+1}: {doc}\n\n"
                    
                    logger.info(f"Retrieved {len(search_results['documents'])} context documents for RAG",context)
            except Exception as e:
                logger.warning(f"Error retrieving RAG context: {e}")
                # Continue without RAG if there's an error
        
        # Prepare messages with system instruction and context
        augmented_messages = messages.copy()
        
        # If we have context and the first message is a system message, augment it
        if context and augmented_messages and augmented_messages[0].get("role") == "system":
            augmented_messages[0]["content"] = augmented_messages[0]["content"] + context
        # If we have context but no system message, add one
        elif context:
            augmented_messages.insert(0, {
                "role": "system",
                "content": f"You are a helpful assistant. Please use the following information to inform your responses when relevant: {context}"
            })

        # Call OpenAI ChatCompletion with augmented messages and user-specified parameters
        resp = client.chat.completions.create(
            model=model_name,
            messages=augmented_messages,
            temperature=temperature,
            max_tokens=max_tokens
        )
        
        # Log the completion for debugging
        logger.info(f"Generated response with{'out' if not context else ''} RAG context")
        
        # The API returns a dict; we can forward it directly
        return {"content": resp.choices[0].message.content}

    except OpenAI.error.OpenAIError as oe:
        logger.error(f"OpenAI API error: {oe}")
        return jsonify({"error": str(oe)}), 500

    except Exception as e:
        logger.error(f"Error in chat_with_openai: {e}")
        return jsonify({"error": str(e)}), 500

# Save user selections
@app.route("/cb/api/user-selections", methods=["POST"])
def save_user_selections():
    try:
        data = request.json
        user_selections = data.get("userSelections")
        
        if not user_selections:
            return jsonify({"error": "User selections data is required"}), 400
        
        # Generate a session ID if not provided
        session_id = data.get("sessionId") or str(uuid.uuid4())
        
        # Extract common fields from userSelections
        name = user_selections.get("name")
        email = user_selections.get("email")
        phone = user_selections.get("phone")
        role = user_selections.get("role")
        
        # Determine user type based on role selection
        user_type = "Student/Fresher/Upskill"  # Default
        if role == "Employer":
            user_type = "Employer"
        elif role == "Freelancer":
            user_type = "Freelancer"
        
        # Extract work mode based on user type
        work_mode = user_selections.get("work_mode")
        
        # Initialize all possible fields with None
        # Employer fields
        skills = None
        employer_headcount_consultant = None
        employer_project_size_consultant = None
        employer_service = None
        employer_start_time_consultant = None
        employer_work_mode_consultant = None
        
        # Student fields
        student_option = None
        student_training = None
        
        # Freelancer fields
        freelancer_category = None
        freelancer_availability = None
        
        # Extract fields based on user type
        if user_type == "Employer":
            skills = user_selections.get("skills")
            employer_headcount_consultant = user_selections.get("employer_headcount_consultant")
            employer_project_size_consultant = user_selections.get("employer_project_size_consultant")
            employer_service = user_selections.get("employer_service")
            employer_start_time_consultant = user_selections.get("employer_start_time_consultant")
            employer_work_mode_consultant = user_selections.get("employer_work_mode_consultant")
            # If work_mode is not set, use the specific employer work mode
            if not work_mode:
                work_mode = (
                    employer_work_mode_consultant or
                    user_selections.get("employer_work_mode_trainer") or
                    user_selections.get("employer_work_mode_panel") or
                    user_selections.get("employer_work_mode_multi")
                )
        
        elif user_type == "Student/Fresher/Upskill":
            student_option = user_selections.get("student_option")
            student_training = user_selections.get("student_training")
            
        elif user_type == "Freelancer":
            freelancer_category = user_selections.get("freelancer_category")
            freelancer_availability = user_selections.get("freelancer_availability")
            # If work_mode is not set, use freelancer availability
            if not work_mode:
                work_mode = freelancer_availability
        
        # Store remaining selections as JSON
        selections_json = json.dumps(user_selections)
        
        # Get database connection
        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Database connection failed"}), 500
        
        cursor = conn.cursor()
        
        try:
            # Create a chat transcript from messages if available
            chat_transcript = None
            if 'messages' in user_selections:
                chat_transcript = json.dumps(user_selections.get('messages'))
            
            # Check if this session_id already exists
            check_query = "SELECT id FROM user_selections WHERE session_id = %s"
            cursor.execute(check_query, (session_id,))
            existing_record = cursor.fetchone()
            
            if existing_record:
                # Update existing record
                update_query = """
                UPDATE user_selections SET 
                    user_type = %s, name = %s, email = %s, phone = %s, role = %s, work_mode = %s,
                    skills = %s, employer_headcount_consultant = %s, employer_project_size_consultant = %s,
                    employer_service = %s, employer_start_time_consultant = %s, employer_work_mode_consultant = %s,
                    student_option = %s, student_training = %s, freelancer_category = %s, chat_transcript = %s,
                    updated_at = NOW()
                WHERE session_id = %s
                """
                
                cursor.execute(
                    update_query, 
                    (user_type, name, email, phone, role, work_mode,
                     skills, employer_headcount_consultant, employer_project_size_consultant,
                     employer_service, employer_start_time_consultant, employer_work_mode_consultant,
                     student_option, student_training, freelancer_category, chat_transcript,
                     session_id)
                )
                

            else:
                # Insert new record
                insert_query = """
                INSERT INTO chat_user_captures (
                    session_id, user_type, name, email, phone, role, work_mode,
                    skills, employer_headcount_consultant, employer_project_size_consultant,
                    employer_service, employer_start_time_consultant, employer_work_mode_consultant,
                    student_option, student_training, freelancer_category, chat_transcript,
                    verified, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE, NOW())
                """
                
                cursor.execute(
                    insert_query, 
                    (session_id, user_type, name, email, phone, role, work_mode,
                     skills, employer_headcount_consultant, employer_project_size_consultant,
                     employer_service, employer_start_time_consultant, employer_work_mode_consultant,
                     student_option, student_training, freelancer_category, chat_transcript)
                )
                

            
            # Get the insert ID
            insert_id = cursor.lastrowid
            
            return jsonify({
                "message": "User selections saved successfully",
                "sessionId": session_id,
                "insertId": insert_id,
                "userType": user_type
            })
        finally:
            cursor.close()
            conn.close()
            
    except Exception as e:
        logger.error(f"Error saving user selections: {e}")
        return jsonify({"error": f"Failed to save user selections: {str(e)}"}), 500

# Vector Database Management Endpoints

@app.route("/cb/api/vector-db/status", methods=["GET"])
def vector_db_status():
    """Get the status of the vector database"""
    try:
        # Check if ChromaDB is initialized
        if not chroma_manager or not chroma_manager.collection:
            return jsonify({"status": "error", "message": "ChromaDB not initialized"}), 500
        
        # Get collection info
        collection_count = chroma_manager.collection.count()
        
        return jsonify({
            "status": "success",
            "message": "ChromaDB is operational",
            "collection_count": collection_count,
            "collection_name": chroma_manager.collection.name
        })
    except Exception as e:
        logger.error(f"Error checking vector DB status: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/cb/api/vector-db/upload", methods=["POST"])
def upload_document():
    """Upload a document to the vector database"""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Get custom metadata if provided
        custom_metadata = {}
        if 'metadata' in request.form:
            try:
                custom_metadata = json.loads(request.form['metadata'])
            except json.JSONDecodeError:
                return jsonify({"error": "Invalid metadata format"}), 400
        
        # Read file content
        file_content = file.read()
        
        try:
            # Extract text from file
            text = chroma_manager.extract_text_from_file(file_content, file.filename)
            
            # Add document to ChromaDB
            success, chunk_count = chroma_manager.add_document_to_db(
                text=text,
                filename=file.filename,
                metadata=custom_metadata
            )
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            traceback.print_exc()
            return jsonify({"error": str(e), "status": "error"}), 500
        
        if success:
            return jsonify({
                "status": "success",
                "message": f"Document uploaded and processed into {chunk_count} chunks",
                "filename": file.filename,
                "chunk_count": chunk_count
            })
        else:
            return jsonify({"error": "Failed to add document to vector database"}), 500
            
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/cb/api/vector-db/search", methods=["POST"])
def search_vector_db():
    """Search the vector database with relevancy filtering"""
    try:
        payload = request.json or {}
        query = payload.get("query")
        n_results = payload.get("n_results", 5)
        metadata_filter = payload.get("metadata_filter")
        relevancy_threshold = payload.get("relevancy_threshold", 0.0)  # Default to no filtering
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        # Search documents
        results = chroma_manager.search_documents(
            query=query,
            n_results=n_results,
            metadata_filter=metadata_filter
        )
        
        # Filter results by relevancy threshold if specified
        if relevancy_threshold > 0.0 and "distances" in results and results["distances"]:
            # In ChromaDB, lower distance means higher relevance
            # Convert distances to similarity scores (1 - distance) for more intuitive filtering
            # Assuming distances are normalized between 0 and 1
            similarity_scores = [1 - min(dist, 1.0) for dist in results["distances"]]
            
            # Create filtered results based on threshold
            filtered_indices = [i for i, score in enumerate(similarity_scores) if score >= relevancy_threshold]
            
            if not filtered_indices:
                # Return empty results if nothing meets the threshold
                return jsonify({
                    "documents": [],
                    "metadatas": [],
                    "distances": [],
                    "ids": [],
                    "similarity_scores": [],
                    "filtered_count": len(results["distances"]) - len(filtered_indices)
                })
            
            # Filter all result arrays
            filtered_results = {
                "documents": [results["documents"][i] for i in filtered_indices],
                "metadatas": [results["metadatas"][i] for i in filtered_indices],
                "distances": [results["distances"][i] for i in filtered_indices],
                "ids": [results["ids"][i] for i in filtered_indices],
                "similarity_scores": [similarity_scores[i] for i in filtered_indices],
                "filtered_count": len(results["distances"]) - len(filtered_indices)
            }
            
            return jsonify(filtered_results)
        
        # If no threshold or no filtering needed, return original results
        # Add similarity scores for consistency
        if "distances" in results and results["distances"]:
            results["similarity_scores"] = [1 - min(dist, 1.0) for dist in results["distances"]]
            results["filtered_count"] = 0
            
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Error searching vector DB: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/cb/api/vector-db/documents", methods=["GET"])
def list_documents():
    """List all documents in the vector database"""
    try:
        try:
            # Get all documents from collection
            results = chroma_manager.collection.get(
                include=["metadatas"],  # Removed embeddings to reduce response size
                limit=100  # Limit to prevent large responses
            )
        except Exception as e:
            logger.error(f"Error getting documents from collection: {e}")
            traceback.print_exc()
            return jsonify({"error": str(e), "status": "error"}), 500
        
        # Process results to group by filename
        documents = {}
        if results and "metadatas" in results:
            for i, metadata in enumerate(results["metadatas"]):
                if metadata and "filename" in metadata:
                    filename = metadata["filename"]
                    if filename not in documents:
                        documents[filename] = {
                            "filename": filename,
                            "chunk_count": 0,
                            "upload_date": metadata.get("upload_date", "Unknown"),
                            "custom_metadata": {}
                        }
                    
                    # Update chunk count
                    documents[filename]["chunk_count"] += 1
                    
                    # Add any custom metadata from the first chunk
                    if documents[filename]["chunk_count"] == 1:
                        for key, value in metadata.items():
                            if key not in ["filename", "upload_date", "chunk_index", "total_chunks", "text_length"]:
                                documents[filename]["custom_metadata"][key] = value
        
        return jsonify({
            "status": "success",
            "document_count": len(documents),
            "documents": list(documents.values())
        })
        
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/cb/api/vector-db/documents/<filename>", methods=["DELETE"])
def delete_document(filename):
    """Delete a document from the vector database"""
    try:
        # Get all document IDs with matching filename
        results = chroma_manager.collection.get(
            where={"filename": filename},
            include=[]
        )
        
        if not results or "ids" not in results or not results["ids"]:
            return jsonify({"error": f"Document '{filename}' not found"}), 404
            
        # Delete all chunks of the document
        chroma_manager.collection.delete(ids=results["ids"])
        
        return jsonify({
            "status": "success",
            "message": f"Document '{filename}' deleted successfully",
            "deleted_chunks": len(results["ids"])
        })
        
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        return jsonify({"error": str(e)}), 500

@app.route("/cb/api/vector-db/reset", methods=["POST"])
def reset_vector_db():
    """Reset the vector database"""
    try:
        # Reset collection
        chroma_manager.collection.delete()
        
        return jsonify({
            "status": "success",
            "message": "Vector database reset successfully"
        })
        
    except Exception as e:
        logger.error(f"Error resetting vector DB: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Bind to 0.0.0.0 to make the server accessible externally
    # This is important for ngrok to be able to forward requests
    app.run(host="0.0.0.0", port=5001, debug=False, threaded=True)
