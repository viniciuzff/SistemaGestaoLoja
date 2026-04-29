from flask import Flask, render_template, request, redirect, session
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

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

        # tabela Produtos
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria TEXT,
        preco_venda REAL,
        preco_custo REAL,
        quantidade INTEGER,
        estoque_minimo INTEGER,
        status TEXT
    )
    """)

        # TABELA VENDAS
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente TEXT,
        data TEXT,
        pagamento TEXT,
        status TEXT,
        total REAL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER,
        produto_id INTEGER,
        quantidade INTEGER,
        preco REAL
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

# ---------------- CLIENTES ----------------
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


# ---------------- NOVO CLIENTE ----------------
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

# ---------------- EDITAR CLIENTE ----------------
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

# ---------------- DELETAR CLIENTE ----------------
@app.route('/deletar_cliente/<int:id>')
def deletar_cliente(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM clientes WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return redirect('/clientes')


# ---------------- PRODUTOS ----------------
@app.route('/produtos')
def produtos():
    if 'usuario' not in session:
        return redirect('/login')

    busca = request.args.get('busca')

    conn = get_db()
    cursor = conn.cursor()

    if busca:
        cursor.execute(
            "SELECT * FROM produtos WHERE nome LIKE ?", 
            ('%' + busca + '%',)
        )
    else:
        cursor.execute("SELECT * FROM produtos")

    produtos = cursor.fetchall()
    conn.close()

    return render_template('produtos.html', produtos=produtos)

# ---------------- NOVO PRODUTO ----------------
@app.route('/novo_produto', methods=['POST'])
def novo_produto():
    nome = request.form['nome']
    categoria = request.form['categoria']
    preco_venda = request.form['preco_venda']
    preco_custo = request.form['preco_custo']
    quantidade = request.form['quantidade']
    estoque_minimo = request.form['estoque_minimo']
    status = request.form['status']

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO produtos 
        (nome, categoria, preco_venda, preco_custo, quantidade, estoque_minimo, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (nome, categoria, preco_venda, preco_custo, quantidade, estoque_minimo, status))

    conn.commit()
    conn.close()

    return redirect('/produtos')

# ---------------- EDITAR PRODUTO ----------------
@app.route('/editar_produto/<int:id>', methods=['POST'])
def editar_produto(id):
    nome = request.form['nome']
    categoria = request.form['categoria']
    preco_venda = request.form['preco_venda']
    preco_custo = request.form['preco_custo']
    quantidade = request.form['quantidade']
    estoque_minimo = request.form['estoque_minimo']
    status = request.form['status']

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE produtos SET
        nome=?, categoria=?, preco_venda=?, preco_custo=?, quantidade=?, estoque_minimo=?, status=?
        WHERE id=?
    """, (nome, categoria, preco_venda, preco_custo, quantidade, estoque_minimo, status, id))

    conn.commit()
    conn.close()

    return redirect('/produtos')

# ---------------- DELETAR PRODUTO ----------------
@app.route('/deletar_produto/<int:id>')
def deletar_produto(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM produtos WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return redirect('/produtos')

# ---------------- VENDAS ----------------
@app.route('/vendas')
def vendas():
    if 'usuario' not in session:
        return redirect('/login')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM vendas ORDER BY id DESC")
    vendas = cursor.fetchall()

    cursor.execute("SELECT * FROM clientes")
    clientes = cursor.fetchall()

    cursor.execute("SELECT * FROM produtos WHERE status = 'Ativo'")
    produtos = cursor.fetchall()

    conn.close()

    return render_template(
        'vendas.html',
        vendas=vendas,
        clientes=clientes,
        produtos=produtos
    )


# ---------------- NOVA VENDA ----------------
@app.route('/nova_venda', methods=['POST'])
def nova_venda():
    cliente = request.form.get('cliente')
    if not cliente:
        cliente = "Não informado"

    produto_id = request.form['produto_id']
    quantidade = int(request.form['quantidade'])
    pagamento = request.form['pagamento']
    status = request.form['status']

    conn = get_db()
    cursor = conn.cursor()

    # pegar produto
    cursor.execute("SELECT nome, preco_venda, quantidade FROM produtos WHERE id = ?", (produto_id,))
    produto = cursor.fetchone()

    if not produto:
        return "Produto não encontrado"

    nome_produto, preco, estoque = produto

    # validar estoque
    if quantidade > estoque:
        return "Estoque insuficiente"

    total = preco * quantidade
    data = datetime.now().strftime('%d/%m/%Y')

    # salvar venda
    cursor.execute("""
        INSERT INTO vendas (cliente, data, pagamento, status, total)
        VALUES (?, ?, ?, ?, ?)
    """, (cliente, data, pagamento, status, total))

    venda_id = cursor.lastrowid

    # salvar item da venda
    cursor.execute("""
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco)
        VALUES (?, ?, ?, ?)
    """, (venda_id, produto_id, quantidade, preco))

    # 🔥 BAIXAR ESTOQUE CORRETO
    cursor.execute("""
        UPDATE produtos
        SET quantidade = quantidade - ?
        WHERE id = ?
    """, (quantidade, produto_id))

    conn.commit()
    conn.close()

    return redirect('/vendas')

# ---------------- DELETAR VENDA ----------------
@app.route('/deletar_venda/<int:id>')
def deletar_venda(id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("DELETE FROM vendas WHERE id = ?", (id,))

    conn.commit()
    conn.close()

    return redirect('/vendas')
# ---------------- START ----------------
if __name__ == '__main__':
    app.run(debug=True)

conn = get_db()
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())

conn.close()