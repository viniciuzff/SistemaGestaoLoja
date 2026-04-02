from flask import Flask, render_template, request, redirect, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'segredo123'

# conexão
def get_db():
    return sqlite3.connect('banco.db')

# criar banco
def criar_banco():
    conn = sqlite3.connect('banco.db')
    cursor = conn.cursor()

    # tabela vendedores
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
    )
    """)

    # tabela clientes
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT
    )
    """)

    conn.commit()
    conn.close()

criar_banco()

# ---------------- CADASTRO ----------------
@app.route('/cadastro', methods=['GET', 'POST'])
def cadastro():
    if request.method == 'POST':
        nome = request.form['nome']
        email = request.form['email']
        senha = generate_password_hash(request.form['senha'])

        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO vendedores (nome, email, senha) VALUES (?, ?, ?)",
                           (nome, email, senha))
            conn.commit()
            conn.close()

            return redirect('/login')

        except:
            return "Erro: email já cadastrado"

    return render_template('cadastro.html')

# ---------------- LOGIN ----------------
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        senha = request.form['senha']

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM vendedores WHERE email = ?", (email,))
        user = cursor.fetchone()
        conn.close()

        if user and check_password_hash(user[3], senha):
            session['usuario'] = user[1]
            return redirect('/dashboard')

        return "Login inválido"

    return render_template('login.html')

# ---------------- DASHBOARD ----------------
@app.route('/dashboard')
def dashboard():
    if 'usuario' not in session:
        return redirect('/login')

    return render_template('dashboard.html')
# ---------------- LOGOUT ----------------
@app.route('/logout')
def logout():
    session.pop('usuario', None)
    return redirect('/login')

@app.route('/clientes')
def clientes():
    if 'usuario' not in session:
        return redirect('/login')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM clientes")
    clientes = cursor.fetchall()
    conn.close()

    return render_template('clientes.html', clientes=clientes)



@app.route('/novo_cliente', methods=['GET', 'POST'])
def novo_cliente():
    if request.method == 'POST':
        nome = request.form['nome']
        email = request.form['email']
        telefone = request.form['telefone']

        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)",
                       (nome, email, telefone))
        conn.commit()
        conn.close()

        return redirect('/clientes')

    return render_template('novo_cliente.html')

@app.route('/editar_cliente', methods=['POST'])
def editar_cliente():
    id = request.form['id']
    nome = request.form['nome']
    email = request.form['email']
    telefone = request.form['telefone']

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE clientes
        SET nome=?, email=?, telefone=?
        WHERE id=?
    """, (nome, email, telefone, id))

    conn.commit()
    conn.close()

    return redirect('/clientes')
    
@app.route('/deletar_cliente/<int:id>')
def deletar_cliente(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM clientes WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return redirect('/clientes')

# ---------------- START ----------------
if __name__ == '__main__':
    app.run(debug=True)

conn = get_db()
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())

conn.close()