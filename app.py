from flask import Flask, request, session, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

app = Flask(__name__)
app.secret_key = 'segredo123'
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# ---------------- BANCO ----------------
def get_db():
    return sqlite3.connect('banco.db')

def criar_banco():
    conn = sqlite3.connect('banco.db')
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vendedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT
    )
    """)

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

# ---------------- AUTH ----------------
@app.route('/api/cadastro', methods=['POST'])
def cadastro():
    data = request.get_json()
    nome = data.get('nome')
    email = data.get('email')
    senha = generate_password_hash(data.get('senha'))

    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO vendedores (nome, email, senha) VALUES (?, ?, ?)",
            (nome, email, senha)
        )
        conn.commit()
        conn.close()
        return jsonify({'ok': True, 'mensagem': 'Cadastro realizado com sucesso'})
    except:
        return jsonify({'ok': False, 'erro': 'Email já cadastrado'}), 409


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    senha = data.get('senha')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendedores WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user[3], senha):
        session['usuario'] = user[1]
        session['usuario_id'] = user[0]
        return jsonify({'ok': True, 'nome': user[1]})

    return jsonify({'ok': False, 'erro': 'Email ou senha inválidos'}), 401


@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'ok': True})


@app.route('/api/me')
def me():
    if 'usuario' not in session:
        return jsonify({'autenticado': False}), 401
    return jsonify({'autenticado': True, 'nome': session['usuario']})


# ---------------- DASHBOARD ----------------
@app.route('/api/dashboard')
def dashboard():
    if 'usuario' not in session:
        return jsonify({'erro': 'Não autorizado'}), 401

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT COUNT(*) FROM clientes")
    total_clientes = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM produtos")
    total_produtos = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM vendas")
    total_vendas = cursor.fetchone()[0]

    cursor.execute("SELECT SUM(total) FROM vendas")
    faturamento = cursor.fetchone()[0] or 0

    cursor.execute("""
        SELECT id, nome, quantidade, estoque_minimo
        FROM produtos
        WHERE quantidade <= estoque_minimo
    """)
    estoque_baixo = [
        {'id': r[0], 'nome': r[1], 'quantidade': r[2], 'estoque_minimo': r[3]}
        for r in cursor.fetchall()
    ]

    cursor.execute("SELECT * FROM vendas ORDER BY id DESC LIMIT 5")
    vendas_recentes = [
        {'id': r[0], 'cliente': r[1], 'data': r[2],
         'pagamento': r[3], 'status': r[4], 'total': r[5]}
        for r in cursor.fetchall()
    ]

    conn.close()

    return jsonify({
        'total_clientes': total_clientes,
        'total_produtos': total_produtos,
        'total_vendas': total_vendas,
        'faturamento': round(faturamento, 2),
        'estoque_baixo': estoque_baixo,
        'vendas_recentes': vendas_recentes,
    })


# ---------------- CLIENTES ----------------
@app.route('/api/clientes', methods=['GET'])
def listar_clientes():
    if 'usuario' not in session:
        return jsonify({'erro': 'Não autorizado'}), 401

    busca = request.args.get('busca', '')
    conn = get_db()
    cursor = conn.cursor()

    if busca:
        cursor.execute(
            "SELECT * FROM clientes WHERE nome LIKE ?",
            ('%' + busca + '%',)
        )
    else:
        cursor.execute("SELECT * FROM clientes")

    clientes = [
        {'id': r[0], 'nome': r[1], 'email': r[2], 'telefone': r[3]}
        for r in cursor.fetchall()
    ]
    conn.close()
    return jsonify(clientes)


@app.route('/api/clientes', methods=['POST'])
def criar_cliente():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)",
        (data['nome'], data.get('email'), data.get('telefone'))
    )
    conn.commit()
    novo_id = cursor.lastrowid
    conn.close()
    return jsonify({'ok': True, 'id': novo_id}), 201


@app.route('/api/clientes/<int:id>', methods=['PUT'])
def editar_cliente(id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE clientes SET nome=?, email=?, telefone=? WHERE id=?",
        (data['nome'], data.get('email'), data.get('telefone'), id)
    )
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/clientes/<int:id>', methods=['DELETE'])
def deletar_cliente(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM clientes WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ---------------- PRODUTOS ----------------
@app.route('/api/produtos', methods=['GET'])
def listar_produtos():
    if 'usuario' not in session:
        return jsonify({'erro': 'Não autorizado'}), 401

    busca = request.args.get('busca', '')
    apenas_ativos = request.args.get('ativos', 'false') == 'true'

    conn = get_db()
    cursor = conn.cursor()

    query = "SELECT * FROM produtos WHERE 1=1"
    params = []

    if busca:
        query += " AND nome LIKE ?"
        params.append('%' + busca + '%')

    if apenas_ativos:
        query += " AND status = 'Ativo'"

    cursor.execute(query, params)
    produtos = [
        {
            'id': r[0], 'nome': r[1], 'categoria': r[2],
            'preco_venda': r[3], 'preco_custo': r[4],
            'quantidade': r[5], 'estoque_minimo': r[6], 'status': r[7]
        }
        for r in cursor.fetchall()
    ]
    conn.close()
    return jsonify(produtos)


@app.route('/api/produtos', methods=['POST'])
def criar_produto():
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO produtos
        (nome, categoria, preco_venda, preco_custo, quantidade, estoque_minimo, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        data['nome'], data.get('categoria'),
        data.get('preco_venda'), data.get('preco_custo'),
        data.get('quantidade'), data.get('estoque_minimo'),
        data.get('status', 'Ativo')
    ))
    conn.commit()
    novo_id = cursor.lastrowid
    conn.close()
    return jsonify({'ok': True, 'id': novo_id}), 201


@app.route('/api/produtos/<int:id>', methods=['PUT'])
def editar_produto(id):
    data = request.get_json()
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE produtos SET
        nome=?, categoria=?, preco_venda=?, preco_custo=?,
        quantidade=?, estoque_minimo=?, status=?
        WHERE id=?
    """, (
        data['nome'], data.get('categoria'),
        data.get('preco_venda'), data.get('preco_custo'),
        data.get('quantidade'), data.get('estoque_minimo'),
        data.get('status', 'Ativo'), id
    ))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


@app.route('/api/produtos/<int:id>', methods=['DELETE'])
def deletar_produto(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM produtos WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ---------------- VENDAS ----------------
@app.route('/api/vendas', methods=['GET'])
def listar_vendas():
    if 'usuario' not in session:
        return jsonify({'erro': 'Não autorizado'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM vendas ORDER BY id DESC")
    vendas = [
        {'id': r[0], 'cliente': r[1], 'data': r[2],
         'pagamento': r[3], 'status': r[4], 'total': r[5]}
        for r in cursor.fetchall()
    ]
    conn.close()
    return jsonify(vendas)


@app.route('/api/vendas', methods=['POST'])
def criar_venda():
    data = request.get_json()

    cliente = data.get('cliente') or 'Não informado'
    produto_id = data['produto_id']
    quantidade = int(data['quantidade'])
    pagamento = data['pagamento']
    status = data.get('status', 'Concluída')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT nome, preco_venda, quantidade FROM produtos WHERE id = ?",
        (produto_id,)
    )
    produto = cursor.fetchone()

    if not produto:
        conn.close()
        return jsonify({'ok': False, 'erro': 'Produto não encontrado'}), 404

    nome_produto, preco, estoque = produto

    if quantidade > estoque:
        conn.close()
        return jsonify({'ok': False, 'erro': 'Estoque insuficiente'}), 400

    total = round(preco * quantidade, 2)
    data_venda = datetime.now().strftime('%d/%m/%Y')

    cursor.execute("""
        INSERT INTO vendas (cliente, data, pagamento, status, total)
        VALUES (?, ?, ?, ?, ?)
    """, (cliente, data_venda, pagamento, status, total))

    venda_id = cursor.lastrowid

    cursor.execute("""
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco)
        VALUES (?, ?, ?, ?)
    """, (venda_id, produto_id, quantidade, preco))

    cursor.execute("""
        UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?
    """, (quantidade, produto_id))

    conn.commit()
    conn.close()

    return jsonify({'ok': True, 'id': venda_id, 'total': total}), 201


@app.route('/api/vendas/<int:id>', methods=['DELETE'])
def deletar_venda(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM vendas WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return jsonify({'ok': True})


# ---------------- ESTOQUE ----------------
@app.route('/api/estoque', methods=['GET'])
def estoque():
    if 'usuario' not in session:
        return jsonify({'erro': 'Não autorizado'}), 401

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, nome, categoria, quantidade, estoque_minimo, status
        FROM produtos
        ORDER BY quantidade ASC
    """)
    produtos = [
        {
            'id': r[0], 'nome': r[1], 'categoria': r[2],
            'quantidade': r[3], 'estoque_minimo': r[4],
            'status': r[5],
            'baixo': r[3] <= r[4]
        }
        for r in cursor.fetchall()
    ]
    conn.close()
    return jsonify(produtos)


# ---------------- START ----------------
if __name__ == '__main__':
    app.run(debug=True)