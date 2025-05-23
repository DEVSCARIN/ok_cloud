from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import csv
import os
from typing import List

app = FastAPI()

# Middleware CORS (permite frontend acessar API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # cria a pasta se não existir

# Model do JSON recebido no login
class LoginRequest(BaseModel):
    username: str
    password: str

# Função para ler o CSV com os usuários
def read_users_csv(file_path='users.csv'):
    users = []
    if not os.path.isfile(file_path):  # verifica se o arquivo existe para evitar erro
        return users
    with open(file_path, newline='', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            users.append({
                "username": row.get("username", "").strip(),
                "password": row.get("password", "").strip()
            })
    return users

# Endpoint de login
@app.post("/login")
def login(data: LoginRequest):
    users = read_users_csv()
    for u in users:
        if u["username"] == data.username.strip() and u["password"] == data.password.strip():
            return {"success": True, "message": "Login autorizado"}
    raise HTTPException(status_code=401, detail="Usuário ou senha inválidos")

# Endpoint para upload de arquivos
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    content = await file.read()
    with open(file_location, "wb") as f:
        f.write(content)
    return {"filename": file.filename, "message": "Arquivo enviado com sucesso."}

# Endpoint para listar arquivos enviados
@app.get("/files", response_model=List[str])
def list_files():
    try:
        return os.listdir(UPLOAD_DIR)
    except Exception:
        raise HTTPException(status_code=500, detail="Erro ao listar arquivos.")

# Endpoint para download de arquivos
@app.get("/download/{filename}")
def download_file(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.isfile(file_path):
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')
    else:
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")

# Servir arquivos estáticos:
# Pasta /login
app.mount("/login", StaticFiles(directory="login", html=True), name="login")

# Pasta raiz (onde deve ter index.html, style.css, script.js do dashboard)
app.mount("/", StaticFiles(directory=".", html=True), name="root")
